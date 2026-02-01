import asyncio
import random
import os
from playwright.async_api import async_playwright
# from playwright_stealth import Stealth # Removing unused sync stealth
from .config import Config
from .logger import setup_logger

logger = setup_logger()

class OverleafBot:
    def __init__(self, headless=True):
        self.headless = headless
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
        
        if os.path.exists(Config.AUTH_FILE) and self.headless:
            logger.info(f"Loading session from {Config.AUTH_FILE}...")
            context_args["storage_state"] = Config.AUTH_FILE
            
        self.context = await self.browser.new_context(**context_args)
        
        self.page = await self.context.new_page()

    async def stop(self):
        if self.context:
            try:
                # Save state on exit if we are running successfully
                await self.context.storage_state(path=Config.AUTH_FILE)
            except Exception:
                pass
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def _random_delay(self):
        await asyncio.sleep(random.uniform(1, 3))

    async def login(self, manual=False, status_callback=None):
        if status_callback: await status_callback("Checking authentication status...")
        if manual:
            logger.info("--- SETUP MODE ---")
            logger.info("Please log in manually in the browser.")
            if status_callback: await status_callback("Manual mode: Please login in the browser window.")
            await self.page.goto("https://www.overleaf.com/login")
            
            # Pre-fill
            if Config.EMAIL: await self.page.fill('input[name="email"]', Config.EMAIL)
            if Config.PASSWORD: await self.page.fill('input[name="password"]', Config.PASSWORD)
            
            print("Press Enter in terminal after you have logged in...")
            await asyncio.to_thread(input)
            
            await self.context.storage_state(path=Config.AUTH_FILE)
            logger.info(f"Session saved to {Config.AUTH_FILE}.")
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
            return await self._attempt_auto_login(status_callback)
        
        if status_callback: await status_callback("Session valid.")
        return True

    async def _attempt_auto_login(self, status_callback=None):
        if not Config.EMAIL or not Config.PASSWORD:
            logger.error("No credentials for auto-login.")
            if status_callback: await status_callback("Error: No credentials provided for auto-login.")
            return False
            
        try:
            if status_callback: await status_callback("Navigating to login page...")
            await self.page.goto("https://www.overleaf.com/login")
            await self._random_delay()
            if status_callback: await status_callback("Entering credentials...")
            await self.page.fill('input[name="email"]', Config.EMAIL)
            await self._random_delay()
            await self.page.fill('input[name="password"]', Config.PASSWORD)
            
            # Use more flexible wait strategy (wait for URL change instead of strict navigation event)
            # This handles cases where the app might be an SPA or Cloudflare intervenes
            try:
                await self.page.click('button[type="submit"], .btn-primary-main')
                
                # Wait for either leaving the login page OR staying on it (e.g. error)
                # We simply wait a bit for the action to take effect or look for /project in URL
                await self.page.wait_for_url(lambda u: "login" not in u, timeout=60000)
            except Exception as wait_err:
                 # If we timed out waiting for URL change, we check if we are still on login page to report specific error
                 if "login" in self.page.url:
                     logger.warning("Timeout waiting for URL change. Possible ReCaptcha or wrong credentials.")
                     # Take screenshot for debugging if possible (not implemented here but good practice)
                 else:
                     raise wait_err
            
            # Verify result
            if "login" not in self.page.url:
                logger.info("Auto-login successful.")
                await self.context.storage_state(path=Config.AUTH_FILE)
                if status_callback: await status_callback("Auto-login successful.")
                return True
            else:
                logger.error("Auto-login failed (Login page still active).")
                if status_callback: await status_callback("Auto-login failed.")
                return False
        except Exception as e:
            logger.error(f"Auto-login failed: {e}")
            if status_callback: await status_callback(f"Auto-login exception: {e}")
            return False

    async def process_user(self, user, status_callback=None):
        username = user.get("username")
        url_raw = user.get("url")
        
        target_path = os.path.join(Config.PUBLIC_DIR, f"{username}.pdf")
        
        # Normalize URL
        if "http" in url_raw:
            url = url_raw
        else:
            url = f"https://www.overleaf.com/project/{url_raw}"
            
        logger.info(f"Processing {username} -> {url}")
        if status_callback: await status_callback(f"Processing user: {username}")
        
        try:
            if status_callback: await status_callback(f"Navigating to Overleaf project...")
            await self.page.goto(url)
            await self._random_delay()
            
            # 1. Handle Join Interstitial
            try:
                # get_by_text returns a Locator, which is synchronous to create, but methods on it are async
                join_btn = self.page.get_by_text("OK, join project")
                if await join_btn.is_visible(timeout=3000):
                    logger.info("Joining project...")
                    if status_callback: await status_callback("First time access: Joining project...")
                    await join_btn.click()
                    await self._random_delay()
            except:
                pass
                
            # 2. Download
            download_selector = '[aria-label="Download PDF"]'
            if status_callback: await status_callback("Waiting for editor to load...")
            await self.page.wait_for_selector(download_selector, timeout=60000)
            
            if os.path.exists(target_path):
                os.remove(target_path)
            
            if status_callback: await status_callback("Initiating PDF download...")
            async with self.page.expect_download() as download_info:
                await self.page.click(download_selector)
                
            download = await download_info.value
            await download.save_as(target_path)
            logger.info(f"Downloaded: {target_path}")
            if status_callback: await status_callback("Download complete.")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process {username}: {e}")
            if status_callback: await status_callback(f"Error processing {username}: {str(e)}")
            return False
