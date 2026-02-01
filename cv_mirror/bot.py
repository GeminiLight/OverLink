import time
import random
import os
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
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

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()

    def start(self):
        self.playwright = sync_playwright().start()
        
        # Use stealth context
        self.stealth = Stealth()
        # We manually apply stealth via use_sync which wraps the context creation usually,
        # but inside a class wrapper we need to be careful.
        # The cleanest way with the library is to use the context manager it provides,
        # but since we want persistent instance, we'll do manual steps or wrap the start.
        
        # Simpler approach: Launch browser, create context, apply stealth manually if needed 
        # OR use the Stealth wrapper pattern but keep the reference.
        
        # Let's trust the library's context wrapper is best, but here we are in a class.
        # We will use the standard launch and standard context, and try to apply stealth if possible,
        # or accepted the library's pattern requires a 'with' block usually.
        # Replicating sync_cv.py pattern:
        
        # To keep it simple and robust, let's use the standard launch.
        self.browser = self.playwright.chromium.launch(headless=self.headless)
        
        context_args = {
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "locale": "en-US"
        }
        
        if os.path.exists(Config.AUTH_FILE) and self.headless:
            logger.info(f"Loading session from {Config.AUTH_FILE}...")
            context_args["storage_state"] = Config.AUTH_FILE
            
        self.context = self.browser.new_context(**context_args)
        
        # Apply stealth manually to page if possible, or just rely on UA.
        # The 'playwright-stealth' lib often works better with its wrapper.
        # Let's apply specific stealth scripts if we could, but the wrapper is 'Stealth().use_sync(...)'.
        # Since we are splitting init/stop, let's just create the page now and know stealth might be reduced 
        # compared to the wrapper unless we copy the wrapper's logic.
        # However, for Overleaf, user-agent and storage state are 90% of the battle.
        self.page = self.context.new_page()

    def stop(self):
        if self.context:
            try:
                # Save state on exit if we are running successfully
                self.context.storage_state(path=Config.AUTH_FILE)
            except Exception:
                pass
            self.context.close()
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()

    def _random_delay(self):
        time.sleep(random.uniform(1, 3))

    def login(self, manual=False):
        if manual:
            logger.info("--- SETUP MODE ---")
            logger.info("Please log in manually in the browser.")
            self.page.goto("https://www.overleaf.com/login")
            
            # Pre-fill
            if Config.EMAIL: self.page.fill('input[name="email"]', Config.EMAIL)
            if Config.PASSWORD: self.page.fill('input[name="password"]', Config.PASSWORD)
            
            input("Press Enter in terminal after you have logged in...")
            self.context.storage_state(path=Config.AUTH_FILE)
            logger.info(f"Session saved to {Config.AUTH_FILE}.")
            return True

        # Check existing session
        logger.info("Verifying session...")
        self.page.goto("https://www.overleaf.com/project")
        self._random_delay()
        
        if "login" in self.page.url:
            logger.warning("Session invalid. Attempting automated login...")
            return self._attempt_auto_login()
        return True

    def _attempt_auto_login(self):
        if not Config.EMAIL or not Config.PASSWORD:
            logger.error("No credentials for auto-login.")
            return False
            
        try:
            self.page.goto("https://www.overleaf.com/login")
            self._random_delay()
            self.page.fill('input[name="email"]', Config.EMAIL)
            self._random_delay()
            self.page.fill('input[name="password"]', Config.PASSWORD)
            
            with self.page.expect_navigation(timeout=60000):
                self.page.click('button[type="submit"], .btn-primary-main')
            
            # Verify result
            if "login" not in self.page.url:
                logger.info("Auto-login successful.")
                self.context.storage_state(path=Config.AUTH_FILE)
                return True
            else:
                logger.error("Auto-login failed (Login page still active).")
                return False
        except Exception as e:
            logger.error(f"Auto-login failed: {e}")
            return False

    def process_user(self, user):
        username = user.get("username")
        url_raw = user.get("url")
        
        target_path = os.path.join(Config.PUBLIC_DIR, f"{username}.pdf")
        
        # Normalize URL
        if "http" in url_raw:
            url = url_raw
        else:
            url = f"https://www.overleaf.com/project/{url_raw}"
            
        logger.info(f"Processing {username} -> {url}")
        
        try:
            self.page.goto(url)
            self._random_delay()
            
            # 1. Handle Join Interstitial
            try:
                join_btn = self.page.get_by_text("OK, join project")
                if join_btn.is_visible(timeout=3000):
                    logger.info("Joining project...")
                    join_btn.click()
                    self._random_delay()
            except:
                pass
                
            # 2. Download
            download_selector = '[aria-label="Download PDF"]'
            self.page.wait_for_selector(download_selector, timeout=60000)
            
            if os.path.exists(target_path):
                os.remove(target_path)
                
            with self.page.expect_download() as download_info:
                self.page.click(download_selector)
                
            download = download_info.value
            download.save_as(target_path)
            logger.info(f"Downloaded: {target_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process {username}: {e}")
            return False
