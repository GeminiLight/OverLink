from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from cv_mirror.bot import OverleafBot
from cv_mirror.config import Config

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

app = FastAPI(title="CV Mirror API")

# Allow CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Model
class MirrorRequest(BaseModel):
    nickname: str
    project_id: str
    email: str

class DeleteRequest(BaseModel):
    username: str
    email: str

# Ensure public dir exists
Config.ensure_public_dir()

# Mount public directory to serve PDFs
app.mount("/public", StaticFiles(directory=Config.PUBLIC_DIR), name="public")

from fastapi.responses import StreamingResponse
import json
import asyncio

@app.post("/api/mirror")
async def mirror_cv(request: MirrorRequest):
    """
    Mirrors the CV from Overleaf Project ID used by the Nickname.
    Returns a stream of status updates ending with the final result.
    """
    logger.info(f"Received request for {request.nickname} (ID: {request.project_id})")
    
    # Construct user data
    user_data = {
        "username": request.nickname,
        "email": request.email,
        "url": request.project_id
    }

    # Save/Update user in users.json
    try:
        users = Config.load_users()
        user_index = next((index for (index, d) in enumerate(users) if d["username"] == request.nickname), None)
        
        if user_index is not None:
             users[user_index] = user_data
             logger.info(f"Updated existing user: {request.nickname}")
        else:
             users.append(user_data)
             logger.info(f"Added new user: {request.nickname}")
        
        Config.save_users(users)
    except Exception as e:
        logger.error(f"Error saving user data: {e}")

    async def event_generator():
        q = asyncio.Queue()
        
        async def bot_producer():
            """Runs the bot and puts status updates into the queue."""
            try:
                # Callback that puts messages into queue
                async def status_callback(msg):
                    await q.put(json.dumps({"type": "status", "message": msg}) + "\n")
                
                await q.put(json.dumps({"type": "status", "message": "Initializing session..."}) + "\n")
                
                async with OverleafBot(headless=True) as bot:
                    await q.put(json.dumps({"type": "status", "message": "Authenticating..."}) + "\n")
                    
                    if not await bot.login(manual=False, status_callback=status_callback):
                        await q.put(json.dumps({"type": "error", "message": "Bot authentication failed."}) + "\n")
                        return

                    success = await bot.process_user(user_data, status_callback=status_callback)
                    
                    if success:
                        pdf_filename = f"{request.nickname}.pdf"
                        result = {
                            "status": "success",
                            "url": f"/public/{pdf_filename}",
                            "filename": pdf_filename
                        }
                        await q.put(json.dumps({"type": "result", **result}) + "\n")
                    else:
                        await q.put(json.dumps({"type": "error", "message": "Failed to mirror CV."}) + "\n")
                        
            except Exception as e:
                logger.error(f"Error in bot producer: {e}")
                await q.put(json.dumps({"type": "error", "message": f"Server error: {str(e)}"}) + "\n")
            finally:
                # Sentinel to signal end of stream
                await q.put(None)

        # Start producer as a background task
        producer_task = asyncio.create_task(bot_producer())
        
        try:
            while True:
                # Wait for next item
                item = await q.get()
                if item is None:
                    break
                yield item
        except asyncio.CancelledError:
            # If client disconnects, we should try to cancel the producer
            producer_task.cancel()
            raise

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

@app.post("/api/delete")
async def delete_cv(request: DeleteRequest):
    """
    Deletes the CV entry if username and email match.
    """
    logger.info(f"Received delete request for {request.username}")
    
    try:
        users = Config.load_users()
        found = False
        new_users = []
        
        for user in users:
            # Check for match (case-sensitive for simplicity, could be lowered)
            if user.get("username") == request.username and user.get("email") == request.email:
                found = True
                # Skip this user (delete)
                continue
            new_users.append(user)
            
        if found:
            Config.save_users(new_users)
            logger.info(f"User {request.username} deleted.")
            return {"status": "success", "message": "CV entry deleted."}
        else:
            raise HTTPException(status_code=404, detail="User not found or email mismatch.")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Run on 0.0.0.0 to be accessible if needed, port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
