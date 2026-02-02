import os
import json
from dotenv import load_dotenv

load_dotenv()

class Config:
    EMAIL = os.getenv("OVERLEAF_EMAIL")
    PASSWORD = os.getenv("OVERLEAF_PASSWORD")
    AUTH_FILE = "auth.json"
    PUBLIC_DIR = "public"
    PDF_DIR = os.path.join(PUBLIC_DIR, "pdfs")
    USERS_FILE = os.path.join(PUBLIC_DIR, "users.json")
    
    @classmethod
    def load_users(cls):
        if not os.path.exists(cls.USERS_FILE):
            return []
        with open(cls.USERS_FILE, "r") as f:
            return json.load(f)

    @classmethod
    def ensure_public_dir(cls):
        os.makedirs(cls.PUBLIC_DIR, exist_ok=True)
        os.makedirs(cls.PDF_DIR, exist_ok=True)

    @classmethod
    def save_users(cls, users):
        cls.ensure_public_dir()
        with open(cls.USERS_FILE, "w") as f:
            json.dump(users, f, indent=4)

    @classmethod
    def add_user(cls, nickname, email, project_id):
        users = cls.load_users()
        
        # Handle different input formats
        if project_id.startswith("http"):
            url = project_id
        elif len(project_id) == 24 and "/" not in project_id:
            # Assume Project ID (24 hex chars)
            url = f"https://www.overleaf.com/project/{project_id}"
        elif len(project_id) < 24 and "/" not in project_id:
             # Assume Read Token (usually 12 chars)
            url = f"https://www.overleaf.com/read/{project_id}"
        else:
            # Default fallback
            url = f"https://www.overleaf.com/project/{project_id}"
        
        new_user = {
            "username": nickname,
            "email": email,
            "url": url
        }
        
        updated = False
        for i, user in enumerate(users):
            if user["username"] == nickname:
                users[i] = new_user
                updated = True
                break
        
        if not updated:
            users.append(new_user)
            
        cls.save_users(users)
        return updated

    @classmethod
    def delete_user(cls, nickname):
        users = cls.load_users()
        initial_count = len(users)
        users = [u for u in users if u["username"] != nickname]
        
        if len(users) < initial_count:
            cls.save_users(users)
            return True
        return False
