import asyncio
import os
import json
import boto3
from overlink_bot.core import OverleafBot

# Configuration from Environment Variables
PAYLOAD_JSON = os.getenv("payload", "{}")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_BUCKET = os.getenv("R2_BUCKET", "overlink-pdfs")
R2_ENDPOINT = os.getenv("R2_ENDPOINT") 

async def run_worker():
    # 1. Parse Payload
    try:
        data = json.loads(PAYLOAD_JSON)
        print(f"Worker started with payload keys: {list(data.keys())}")
    except Exception as e:
        print(f"Error parsing payload: {e}")
        return

    nickname = data.get("nickname")
    project_id = data.get("project_id")
    email = data.get("email") 
    password = data.get("password")
    
    if not email or not password or not project_id:
        print("Missing required credentials or project_id")
        return

    # 2. Run Playwright Logic
    pdf_path = f"/tmp/{nickname}.pdf"
    
    async with OverleafBot(headless=True, auth_path=None) as bot:
        # Note: auth_path=None because we don't prefer caching sessions in stateless worker, 
        # or we could map it to a /tmp location if we wanted to retry reuse within same job (unlikely).
        
        print("Logging in...")
        if not await bot.login(email=email, password=password, manual=False):
            print("Login failed.")
            return

        print(f"Downloading project: {project_id}")
        if not await bot.download_project(project_id, pdf_path):
            print("Download failed.")
            return

    # 3. Upload to R2
    if R2_ACCESS_KEY and R2_SECRET_KEY:
        print("Uploading to R2...")
        try:
            s3 = boto3.client(
                's3',
                endpoint_url=R2_ENDPOINT,
                aws_access_key_id=R2_ACCESS_KEY,
                aws_secret_access_key=R2_SECRET_KEY,
                region_name="auto"
            )
            
            s3.upload_file(
                pdf_path, 
                R2_BUCKET, 
                f"{nickname}.pdf",
                ExtraArgs={'ContentType': 'application/pdf'}
            )
            print(f"Upload complete: {nickname}.pdf")
        except Exception as e:
            print(f"Upload failed: {e}")

if __name__ == "__main__":
    import sys
    import os
    # Ensure package is in path for local run (in Actions we install it)
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../packages/python-core')))
    asyncio.run(run_worker())
