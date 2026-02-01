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

# Ensure public dir exists
Config.ensure_public_dir()

# Mount public directory to serve PDFs
app.mount("/public", StaticFiles(directory=Config.PUBLIC_DIR), name="public")

@app.post("/api/mirror")
async def mirror_cv(request: MirrorRequest):
    """
    Mirrors the CV from Overleaf Project ID used by the Nickname.
    """
    logger.info(f"Received request for {request.nickname} (ID: {request.project_id})")
    
    # Construct a temporary user dict for the bot
    # The bot handles "http" vs raw ID logic, so we pass project_id as url field
    user_data = {
        "username": request.nickname,
        "url": request.project_id
    }
    
    try:
        # We start a fresh bot instance for each request to ensure isolation and stability
        # Note: This is synchronous and blocking. For high load, this should be offloaded to a background task.
        # But for a personal tool, this is fine and keeps it simple.
        with OverleafBot(headless=True) as bot:
            # Login (uses cached session if available)
            if not bot.login(manual=False):
                raise HTTPException(status_code=500, detail="Bot authentication failed. Service unavailable.")
            
            # Process the user
            success = bot.process_user(user_data)
            
            if success:
                # Construct the public URL
                # Assuming the server is running on the same host
                # We return a relative path or full URL if we knew the domain
                pdf_filename = f"{request.nickname}.pdf"
                return {
                    "status": "success",
                    "url": f"/public/{pdf_filename}",
                    "filename": pdf_filename
                }
            else:
                raise HTTPException(status_code=400, detail="Failed to mirror CV. Check the Project ID or permissions.")
                
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Run on 0.0.0.0 to be accessible if needed, port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
