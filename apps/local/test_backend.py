import asyncio
import os
import json
from backend.config import Config
from server import MirrorRequest, mirror_cv

# Mocking OverleafBot to avoid actual browser interaction during this quick test
from unittest.mock import MagicMock, AsyncMock, patch

async def test_backend_logic():
    print("Testing backend logic...")
    
    # Setup mock data
    nickname = "test_user_unique"
    email = "test@example.com"
    project_id = "123456"
    
    # cleanup
    users = Config.load_users()
    users = [u for u in users if u['username'] != nickname]
    Config.save_users(users)
    
    # Mock request
    request = MirrorRequest(nickname=nickname, email=email, project_id=project_id)
    
    # Mock Bot
    with patch("server.OverleafBot") as MockBot:
        mock_bot_instance = AsyncMock()
        MockBot.return_value.__aenter__.return_value = mock_bot_instance
        mock_bot_instance.login.return_value = True
        mock_bot_instance.process_user.return_value = True
        
        # Call the function
        # We need to run this in an event loop, but since we are mocking the async bot, it should be fast
        try:
             # We need to import the app or function properly. 
             # Since mirror_cv is an endpoint, we can call it directly as a function if we import it.
             response = await mirror_cv(request)
             print("Response:", response)
        except Exception as e:
            print(f"Error calling mirror_cv: {e}")
            raise

    # Verify users.json
    users_after = Config.load_users()
    user_entry = next((u for u in users_after if u['username'] == nickname), None)
    
    if user_entry:
        print("User found in users.json:")
        print(user_entry)
        assert user_entry['email'] == email
        assert user_entry['url'] == project_id
        print("Verification SUCCESS: User data saved correctly.")
    else:
        print("Verification FAILED: User not found in users.json")

    # Cleanup
    users_final = [u for u in users_after if u['username'] != nickname]
    Config.save_users(users_final)

if __name__ == "__main__":
    asyncio.run(test_backend_logic())
