import asyncio
import random
import os
from playwright.async_api import async_playwright
from .logger import setup_logger

logger = setup_logger()

class OverleafBot:
    def __init__(self, headless=True, auth_path="auth.json"):
        self.headless = headless
        self.auth_path = auth_path
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop()

    async def start(self):
        self.playwright = await async_playwright().start()
        
        # Use standard launch
        self.browser = await self.playwright.chromium.launch(headless=self.headless)
        
        context_args = {
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "locale": "en-US"
        }
        
        if os.path.exists(self.auth_path) and self.headless:
            logger.info(f"Loading session from {self.auth_path}...")
            context_args["storage_state"] = self.auth_path
            
        self.context = await self.browser.new_context(**context_args)
        
        self.page = await self.context.new_page()

    async def stop(self):
        if self.context:
            try:
                # Save state on exit if we are running successfully and path is set
                if self.auth_path:
                    await self.context.storage_state(path=self.auth_path)
            except Exception:
                pass
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def _random_delay(self):
        await asyncio.sleep(random.uniform(1, 3))

    async def login(self, email=None, password=None, manual=False, status_callback=None):
        if status_callback: await status_callback("Checking authentication status...")
        if manual:
            logger.info("--- SETUP MODE ---")
            logger.info("Please log in manually in the browser.")
            if status_callback: await status_callback("Manual mode: Please login in the browser window.")
            await self.page.goto("https://www.overleaf.com/login")
            
            # Pre-fill
            if email: await self.page.fill('input[name="email"]', email)
            if password: await self.page.fill('input[name="password"]', password)
            
            print("Press Enter in terminal after you have logged in...")
            await asyncio.to_thread(input)
            
            await self.context.storage_state(path=self.auth_path)
            logger.info(f"Session saved to {self.auth_path}.")
            if status_callback: await status_callback("Session saved.")
            return True

        # Check existing session
        logger.info("Verifying session...")
        if status_callback: await status_callback("Verifying existing session...")
        await self.page.goto("https://www.overleaf.com/project")
        await self._random_delay()
        
        if "login" in self.page.url:
            logger.warning("Session invalid. Attempting automated login...")
            if status_callback: await status_callback("Session expired. Attempting auto-login...")
            return await self._attempt_auto_login(email, password, status_callback)
        
        if status_callback: await status_callback("Session valid.")
        return True

    async def _attempt_auto_login(self, email, password, status_callback=None):
        if not email or not password:
            logger.error("No credentials for auto-login.")
            if status_callback: await status_callback("Error: No credentials provided for auto-login.")
            return False
            
        try:
            if status_callback: await status_callback("Navigating to login page...")
            await self.page.goto("https://www.overleaf.com/login")
            await self._random_delay()
            if status_callback: await status_callback("Entering credentials...")
            await self.page.fill('input[name="email"]', email)
            await self._random_delay()
            await self.page.fill('input[name="password"]', password)
            
            try:
                await self.page.click('button[type="submit"], .btn-primary-main')
                await self.page.wait_for_url(lambda u: "login" not in u, timeout=60000)
            except Exception as wait_err:
                 if "login" in self.page.url:
                     logger.warning("Timeout waiting for URL change.")
                 else:
                     raise wait_err
            
            # Verify result
            if "login" not in self.page.url:
                logger.info("Auto-login successful.")
                await self.context.storage_state(path=self.auth_path)
                if status_callback: await status_callback("Auto-login successful.")
                return True
            else:
                logger.error("Auto-login failed.")
                if status_callback: await status_callback("Auto-login failed.")
                return False
        except Exception as e:
            logger.error(f"Auto-login failed: {e}")
            if status_callback: await status_callback(f"Auto-login exception: {e}")
            return False

    async def download_project(self, project_id, output_path, status_callback=None):
        """
        Downloads the PDF from a project ID or URL to the specified output path.
        Returns True on success.
        """
        # Normalize URL
        if "http" in project_id:
            url = project_id
            pid = project_id.split("/")[-1]
        else:
            url = f"https://www.overleaf.com/project/{project_id}"
            pid = project_id
            
        logger.info(f"Processing {pid} -> {url}")
        if status_callback: await status_callback(f"Processing project: {pid}")
        
        try:
            if status_callback: await status_callback(f"Navigating to Overleaf project...")
            await self.page.goto(url)
            await self._random_delay()
            
            # 1. Handle Join Interstitial
            try:
                join_btn = self.page.get_by_text("OK, join project")
                if await join_btn.is_visible(timeout=3000):
                    logger.info("Joining project...")
                    await join_btn.click()
                    await self._random_delay()
            except:
                pass
                
            # 2. Download
            download_selector = '[aria-label="Download PDF"]'
            if status_callback: await status_callback("Waiting for editor to load...")
            await self.page.wait_for_selector(download_selector, timeout=60000)
            
            # Download to a temporary path first (output_path + .tmp)
            temp_path = output_path + ".tmp"
            
            if status_callback: await status_callback("Initiating PDF download...")
            async with self.page.expect_download() as download_info:
                await self.page.click(download_selector)
                
            download = await download_info.value
            await download.save_as(temp_path)
            
            # If successful, rename temp to target (atomic replacement)
            os.replace(temp_path, output_path)
            
            logger.info(f"Downloaded: {output_path}")
            if status_callback: await status_callback("Download complete.")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process project {pid}: {e}")
            if status_callback: await status_callback(f"Error processing: {str(e)}")
            return False

