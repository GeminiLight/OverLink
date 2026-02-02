import argparse
import asyncio
import sys
import uvicorn
from backend.config import Config
from overlink_bot.core import OverleafBot
from backend.logger import setup_logger

logger = setup_logger()

def run_sync(args):
    """Runs the synchronization bot."""
    Config.ensure_public_dir()
    
    # In setup mode, we force headful
    headless = not (args.setup or args.visible)
    
    async def _sync():
        async with OverleafBot(headless=headless, auth_path=Config.AUTH_FILE) as bot:
            # 1. Login Phase
            if args.setup:
                await bot.login(manual=True)
                return

            if not await bot.login(email=Config.EMAIL, password=Config.PASSWORD, manual=False):
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
                username = user.get("username")
                target_path = os.path.join(Config.PDF_DIR, f"{username}.pdf")
                
                if await bot.download_project(user.get("url"), target_path):
                    success_count += 1
            
            logger.info(f"Batch complete. {success_count}/{len(users)} successful.")
            
            if success_count == 0 and len(users) > 0:
                sys.exit(1)

    asyncio.run(_sync())

def run_server(args):
    """Runs the FastAPI server."""
    uvicorn.run("backend.server:app", host=args.host, port=args.port, reload=args.reload)

def run_user_add(args):
    """Adds or updates a user."""
    updated = Config.add_user(args.nickname, args.email, args.project_id)
    print(f"User '{args.nickname}' {'updated' if updated else 'added'} successfully.")

def run_user_delete(args):
    """Deletes a user."""
    success = Config.delete_user(args.nickname)
    if success:
        print(f"User '{args.nickname}' deleted successfully.")
    else:
        print(f"User '{args.nickname}' not found.")

def main():
    parser = argparse.ArgumentParser(description="OverLink Unified CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Command: sync
    sync_parser = subparsers.add_parser("sync", help="Run the synchronization bot")
    sync_parser.add_argument("--setup", action="store_true", help="Run in Setup Mode (Manual Login)")
    sync_parser.add_argument("--visible", action="store_true", help="Run browser visibly")
    sync_parser.set_defaults(func=run_sync)

    # Command: server
    server_parser = subparsers.add_parser("server", help="Run the API server")
    server_parser.add_argument("--host", default="0.0.0.0", help="Host to bind")
    server_parser.add_argument("--port", type=int, default=8000, help="Port to bind")
    server_parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    server_parser.set_defaults(func=run_server)

    # Command: user
    user_parser = subparsers.add_parser("user", help="Manage users")
    user_subparsers = user_parser.add_subparsers(dest="user_command", required=True)

    # Command: user add
    add_parser = user_subparsers.add_parser("add", help="Add a new user")
    add_parser.add_argument("--nickname", required=True, help="User nickname")
    add_parser.add_argument("--project-id", required=True, help="Overleaf project ID or URL")
    add_parser.add_argument("--email", required=True, help="User email")
    add_parser.set_defaults(func=run_user_add)

    # Command: user delete
    delete_parser = user_subparsers.add_parser("delete", help="Delete a user")
    delete_parser.add_argument("--nickname", required=True, help="User nickname")
    delete_parser.set_defaults(func=run_user_delete)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
