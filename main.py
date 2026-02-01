import argparse
import sys
from cv_mirror.config import Config
from cv_mirror.bot import OverleafBot
from cv_mirror.logger import setup_logger

logger = setup_logger()

def main():
    parser = argparse.ArgumentParser(description="CV-Mirror Service")
    parser.add_argument("--setup", action="store_true", help="Run in Setup Mode (Manual Login)")
    parser.add_argument("--visible", action="store_true", help="Run browser visibly")
    args = parser.parse_args()

    Config.ensure_public_dir()
    
    # In setup mode, we force headful
    headless = not (args.setup or args.visible)
    
    with OverleafBot(headless=headless) as bot:
        # 1. Login Phase
        if args.setup:
            bot.login(manual=True)
            return

        if not bot.login(manual=False):
            logger.error("Authentication failed. Aborting.")
            sys.exit(1)

        # 2. Batch Processing
        users = Config.load_users()
        if not users:
            logger.warning("No users found in users.json")
            return

        logger.info(f"Found {len(users)} users.")
        success_count = 0
        
        for user in users:
            if bot.process_user(user):
                success_count += 1
        
        logger.info(f"Batch complete. {success_count}/{len(users)} successful.")
        
        if success_count == 0 and len(users) > 0:
            sys.exit(1)

if __name__ == "__main__":
    main()
