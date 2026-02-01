import os
import sys
import time
import random
import argparse
import json
import shutil
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

# Load environment variables
load_dotenv()

EMAIL = os.getenv("OVERLEAF_EMAIL")
PASSWORD = os.getenv("OVERLEAF_PASSWORD")

def random_delay():
    time.sleep(random.uniform(1, 3))

def process_user(page, user, auth_file):
    username = user.get("username")
    project_url_raw = user.get("url")
    
    print(f"Processing user: {username}...")
    
    target_dir = "public"
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, f"{username}.pdf")
    
    # 1. Prepare Navigation
    # Determine URL
    if "http" in project_url_raw:
        project_url = project_url_raw
    else:
        project_url = f"https://www.overleaf.com/project/{project_url_raw}"
            
    print(f"Navigating to project: {project_url}")
    page.goto(project_url)
    random_delay()

    # Check if we were redirected to login (session expired or invalid)
    if "login" in page.url or "restricted" in page.url:
        print("Session invalid or expired. Attempting fallback login...")
        page.goto("https://www.overleaf.com/login")
        random_delay()
        
        if EMAIL and PASSWORD:
                page.fill('input[name="email"]', EMAIL)
                random_delay()
                page.fill('input[name="password"]', PASSWORD)
                with page.expect_navigation(timeout=60000):
                    page.click('button[type="submit"], .btn-primary-main')
                
                # After login, go back to project
                random_delay()
                page.goto(project_url)
                
                # We successfully logged in, let's save this session!
                try:
                     page.context.storage_state(path=auth_file)
                     print(f"Automatic login successful. Session saved to {auth_file}.")
                except Exception as e:
                     print(f"Warning: Could not save session: {e}")

        else:
            print("Error: detailed credentials missing for fallback login.")
            return False

    # 2. Navigation & Extraction
    # Check for "Join Project" interstitial if using a shared link
    try:
        # Wait briefly to see if the join button appears
        join_button = page.get_by_text("OK, join project")
        if join_button.is_visible(timeout=3000):
            print("Found 'Join Project' button. Clicking...")
            join_button.click()
            random_delay()
    except Exception:
        pass

    # We should be on the project page now
    download_button_selector = '[aria-label="Download PDF"]'
    
    try:
        # Wait for delay to ensure full load
        page.wait_for_selector(download_button_selector, timeout=60000)
    except Exception as e:
        print(f"Error locating download button for {username}: {e}")
        return False
    
    print("Locating download button...")
    
    # 3. File Handling
    print("Initiating download...")
    try:
        with page.expect_download() as download_info:
            page.click(download_button_selector)
        
        download = download_info.value
        print(f"Saving file to {target_path}...")
        download.save_as(target_path)
        print(f"Success! CV for {username} downloaded.")
        return True
    except Exception as e:
        print(f"Error downloading for {username}: {e}")
        return False


def sync_cv(setup_mode=False, visible=False):
    # Determine headless mode
    headless_mode = not (setup_mode or visible)
    auth_file = "auth.json"
    
    with Stealth().use_sync(sync_playwright()) as p:
        # Launch browser
        browser = p.chromium.launch(headless=headless_mode)
        
        context_args = {
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "locale": "en-US"
        }
        
        if os.path.exists(auth_file) and not setup_mode:
            print(f"Loading session from {auth_file}...")
            context_args["storage_state"] = auth_file
            
        context = browser.new_context(**context_args)
        page = context.new_page()

        try:
            # --- SETUP MODE ---
            if setup_mode:
                print("--- SETUP MODE ---")
                print("Please log in manually in the opened browser window.")
                page.goto("https://www.overleaf.com/login")
                if EMAIL: page.fill('input[name="email"]', EMAIL)
                if PASSWORD: page.fill('input[name="password"]', PASSWORD)
                
                input("Press Enter after you have successfully logged in...")
                context.storage_state(path=auth_file)
                print(f"Session saved to {auth_file}.")
                return

            # --- BATCH MODE ---
            # Load users
            if not os.path.exists("users.json"):
                print("Error: users.json not found.")
                sys.exit(1)
                
            with open("users.json", "r") as f:
                users = json.load(f)
            
            print(f"Found {len(users)} users to process.")
            
            success_count = 0
            for user in users:
                if process_user(page, user, auth_file):
                    success_count += 1
                # Small delay between users
                random_delay()
            
            # Update state just in case (keep session fresh)
            context.storage_state(path=auth_file)
            print(f"Batch processing complete. {success_count}/{len(users)} successful.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="error_screenshot.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync CV from Overleaf")
    parser.add_argument("--setup", action="store_true", help="Run in headful mode to setup/refresh login session")
    parser.add_argument("--visible", action="store_true", help="Run in visible (headful) mode")
    args = parser.parse_args()
    
    # We don't strictly require PROJECT_ID env var anymore for batch usage
    # but EMAIL/PASSWORD are still needed for fallback login.
    
    if (not EMAIL or not PASSWORD) and not args.setup:
        # Warn but proceed, relying on session
        print("Warning: Credentials missing from env. Relying solely on auth.json.")
        
    sync_cv(setup_mode=args.setup, visible=args.visible)
