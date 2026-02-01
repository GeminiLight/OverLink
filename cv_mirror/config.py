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
        with open(cls.USERS_FILE, "w") as f:
            json.dump(users, f, indent=4)
