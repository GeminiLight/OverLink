import asyncio
import os
import json
import boto3
from playwright.async_api import async_playwright

# Configuration from Environment Variables
# In GitHub Actions, 'payload' will be passed as an env var from the dispatch event
PAYLOAD_JSON = os.getenv("payload", "{}")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_BUCKET = os.getenv("R2_BUCKET", "overlink")
R2_ENDPOINT = os.getenv("R2_ENDPOINT") # https://<accountid>.r2.cloudflarestorage.com

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
    email = data.get("email") # Overleaf Email
    password = data.get("password") # Overleaf Password
    
    if not email or not password or not project_id:
        print("Missing required credentials or project_id")
        return

    # 2. Run Playwright Logic
    pdf_path = f"/tmp/{nickname}.pdf"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 ...")
        page = await context.new_page()

        try:
            # Login
            print("Logging in...")
            await page.goto("https://www.overleaf.com/login")
            await page.fill('input[name="email"]', email)
            await page.fill('input[name="password"]', password)
            await page.click('button[type="submit"], .btn-primary-main')
            await page.wait_for_url(lambda u: "login" not in u, timeout=60000)
            print("Login successful.")

            # Navigate to Project
            if "http" not in project_id:
                 url = f"https://www.overleaf.com/project/{project_id}"
            else:
                 url = project_id
            
            print(f"Opening project: {url}")
            await page.goto(url)
            
            # Handle Join Interstitial
            try:
                join_btn = page.get_by_text("OK, join project")
                if await join_btn.is_visible(timeout=3000):
                    await join_btn.click()
            except:
                pass

            # Download
            print("Downloading PDF...")
            download_selector = '[aria-label="Download PDF"]'
            await page.wait_for_selector(download_selector, timeout=60000)
            
            async with page.expect_download() as download_info:
                await page.click(download_selector)
            
            download = await download_info.value
            await download.save_as(pdf_path)
            print(f"PDF saved to {pdf_path}")
            
            # 3. Upload to R2
            if R2_ACCESS_KEY and R2_SECRET_KEY:
                print("Uploading to R2...")
                s3 = boto3.client(
                    's3',
                    endpoint_url=R2_ENDPOINT,
                    aws_access_key_id=R2_ACCESS_KEY,
                    aws_secret_access_key=R2_SECRET_KEY,
                    region_name="auto" # R2 requires region but ignores it, auto is safe
                )
                
                # ContentType is important for browser viewing
                s3.upload_file(
                    pdf_path, 
                    R2_BUCKET, 
                    f"{nickname}.pdf",
                    ExtraArgs={'ContentType': 'application/pdf'}
                )
                print(f"Upload complete: {nickname}.pdf")
            else:
                print("Skipping upload (No R2 credentials found).")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_worker())
