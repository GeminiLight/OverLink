import argparse
import json
import os
import sys

# Path to the users file
USERS_FILE = os.path.join("public", "users.json")

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_users(users):
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

def add_user(args):
    users = load_users()
    new_user = {
        "username": args.nickname,
        "email": args.email,
        "url": args.project_id if args.project_id.startswith("http") else f"https://www.overleaf.com/project/{args.project_id}"
    }
    
    # Check if user exists and update, or append
    updated = False
    for i, user in enumerate(users):
        if user["username"] == args.nickname:
            users[i] = new_user
            updated = True
            break
    
    if not updated:
        users.append(new_user)
        
    save_users(users)
    print(f"User '{args.nickname}' {'updated' if updated else 'added'} successfully.")

def delete_user(args):
    users = load_users()
    initial_count = len(users)
    users = [u for u in users if u["username"] != args.nickname]
    
    if len(users) < initial_count:
        save_users(users)
        print(f"User '{args.nickname}' deleted successfully.")
    else:
        print(f"User '{args.nickname}' not found.")

def main():
    parser = argparse.ArgumentParser(description="Manage CV Mirror users")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Add command
    parser_add = subparsers.add_parser("add", help="Add a new user")
    parser_add.add_argument("--nickname", required=True, help="User nickname")
    parser_add.add_argument("--project-id", required=True, help="Overleaf project ID or URL")
    parser_add.add_argument("--email", required=True, help="User email")
    parser_add.set_defaults(func=add_user)

    # Delete command
    parser_delete = subparsers.add_parser("delete", help="Delete a user")
    parser_delete.add_argument("--nickname", required=True, help="User nickname")
    parser_delete.set_defaults(func=delete_user)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
