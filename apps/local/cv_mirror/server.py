from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import logging
import json
import asyncio
from overlink_bot.client import OverleafBot
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

@app.post("/api/mirror")
async def mirror_cv(request: MirrorRequest):
    """
    Mirrors the CV from Overleaf Project ID used by the Nickname.
    Returns a stream of status updates ending with the final result.
    """
    logger.info(f"Received request for {request.nickname} (ID: {request.project_id})")
    
    # Save/Update user in users.json using Config
    try:
        updated = Config.add_user(request.nickname, request.email, request.project_id)
        action = "Updated" if updated else "Added"
        logger.info(f"{action} user: {request.nickname}")
    except Exception as e:
        logger.error(f"Error saving user data: {e}")

    # Prepare user data dict for the bot
    user_data = {
        "username": request.nickname,
        "email": request.email,
        "url": request.project_id if request.project_id.startswith("http") else f"https://www.overleaf.com/project/{request.project_id}"
    }

    async def event_generator():
        q = asyncio.Queue()
        
        async def bot_producer():
            """Runs the bot and puts status updates into the queue."""
            try:
                # Callback that puts messages into queue
                async def status_callback(msg):
                    await q.put(json.dumps({"type": "status", "message": msg}) + "\n")
                
                await q.put(json.dumps({"type": "status", "message": "Initializing session..."}) + "\n")
                
                async with OverleafBot(headless=True, auth_path=Config.AUTH_FILE) as bot:
                    await q.put(json.dumps({"type": "status", "message": "Authenticating..."}) + "\n")
                    
                    if not await bot.login(email=Config.EMAIL, password=Config.PASSWORD, manual=False, status_callback=status_callback):
                        await q.put(json.dumps({"type": "error", "message": "Bot authentication failed."}) + "\n")
                        return

                    target_path = os.path.join(Config.PDF_DIR, f"{request.nickname}.pdf")
                    success = await bot.download_project(user_data["url"], target_path, status_callback=status_callback)
                    
                    if success:
                        pdf_filename = f"{request.nickname}.pdf"
                        result = {
                            "status": "success",
                            "url": f"/public/pdfs/{pdf_filename}",
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
            if user.get("username") == request.username and user.get("email") == request.email:
                found = True
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
