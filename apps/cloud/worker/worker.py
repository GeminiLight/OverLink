import asyncio
import os
import json
import boto3
from Crypto.Cipher import AES
from overlink_bot.core import OverleafBot

def decrypt_from_string(encrypted_text, secret_key):
    """
    Decrypts a string encrypted with AES-256-GCM (same as web app lib/crypto.ts)
    Format: iv:tag:content (all hex)
    """
    try:
        parts = encrypted_text.split(':')
        if len(parts) != 3:
            raise ValueError("Invalid encrypted string format")

        iv_hex, tag_hex, content_hex = parts
        
        iv = bytes.fromhex(iv_hex)
        tag = bytes.fromhex(tag_hex)
        content = bytes.fromhex(content_hex)
        
        # secret_key must be exactly 32 bytes for AES-256
        cipher = AES.new(secret_key.encode('utf-8'), AES.MODE_GCM, nonce=iv)
        decrypted = cipher.decrypt_and_verify(content, tag)
        
        return decrypted.decode('utf-8')
    except Exception as e:
        print(f"Decryption failed: {e}")
        return None

# Configuration from Environment Variables
async def run_worker():
    # 0. Load Configuration
    R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
    R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
    R2_BUCKET = os.getenv("R2_BUCKET", "overlink")
    R2_ENDPOINT = os.getenv("R2_ENDPOINT") 
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

    # 1. Parse Payload
    payload_json = os.getenv("payload", "{}")
    try:
        data = json.loads(payload_json)
        print(f"Worker started with payload keys: {list(data.keys())}")
    except Exception as e:
        print(f"Error parsing payload: {e}")
        return

    email = data.get('email')
    password = data.get('password')

    # Fallback to environment variables if not provided in payload
    if not email:
        email = os.getenv("OVERLEAF_EMAIL")
        print("Using OVERLEAF_EMAIL from environment.")
    if not password:
        password = os.getenv("OVERLEAF_PASSWORD")
        print("Using OVERLEAF_PASSWORD from environment.")
        # If password comes from env, it's likely NOT encrypted in the same way as web payload
        # But we'll let the decryption logic handle the check below

    if not email or not password:
        print("ERROR: Overleaf credentials missing (neither in payload nor environment).")
        return
    
    # Support both single project and batch projects
    projects_input = data.get("projects")
    if not projects_input:
        filename = data.get("filename")
        project_id = data.get("project_id")
        if filename and project_id:
            projects_input = [{"filename": filename, "project_id": project_id}]
    
    if not email or not password or not projects_input:
        print("Missing required credentials or project_id")
        return

    # 2. Run Playwright Logic
    download_tasks = []
    for item in projects_input:
        fname = item.get("filename")
        pid = item.get("project_id")
        if fname and pid:
            dest = f"/tmp/{fname}.pdf"
            download_tasks.append((pid, dest, fname))

    if not download_tasks:
        print("No valid projects to download.")
        return

    async with OverleafBot(headless=True, auth_path="auth.json") as bot:
        print("Logging in...")
        if not await bot.login(email=email, password=password, manual=False):
            print("Login failed. Check your Overleaf credentials.")
            return

        print(f"Starting batch download for {len(download_tasks)} projects...")
        batch_args = [(pid, dest) for pid, dest, _ in download_tasks]
        results = await bot.batch_download_projects(batch_args, max_concurrent=3)
        
    # 3. Upload to R2
    if R2_ACCESS_KEY and R2_SECRET_KEY:
        print(f"Initializing R2 client (Endpoint: {R2_ENDPOINT}, Bucket: {R2_BUCKET})...")
        try:
            endpoint = R2_ENDPOINT
            if endpoint and not endpoint.startswith("http"):
                endpoint = f"https://{endpoint}"

            s3 = boto3.client(
                's3',
                endpoint_url=endpoint,
                aws_access_key_id=R2_ACCESS_KEY,
                aws_secret_access_key=R2_SECRET_KEY,
                region_name="auto"
            )
            
            for (pid, dest, fname), success in zip(download_tasks, results):
                if success:
                    if os.path.exists(dest):
                        size = os.path.getsize(dest)
                        print(f"Uploading {fname}.pdf to R2 (Size: {size} bytes)...")
                        try:
                            # Using put_object for more explicit control/error reporting
                            with open(dest, 'rb') as f:
                                response = s3.put_object(
                                    Bucket=R2_BUCKET,
                                    Key=f"{fname}.pdf",
                                    Body=f,
                                    ContentType='application/pdf'
                                )
                            print(f"Upload complete: {fname}.pdf (Response Code: {response.get('ResponseMetadata', {}).get('HTTPStatusCode')})")
                        except Exception as upload_err:
                            print(f"Failed to upload {fname}.pdf to R2: {upload_err}")
                    else:
                        print(f"ERROR: Local file {dest} not found despite success result.")
                else:
                    print(f"Skipping R2 upload for {fname}.pdf as download failed.")
        except Exception as e:
            print(f"R2 client initialization or batch upload error: {e}")
    else:
        print("R2 credentials missing, skipping upload.")

if __name__ == "__main__":
    import sys
    import os
    # Ensure package is in path for local run
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    asyncio.run(run_worker())
