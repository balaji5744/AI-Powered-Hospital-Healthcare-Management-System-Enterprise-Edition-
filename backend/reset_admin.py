import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.auth_utils import get_password_hash
from app.config import settings

async def reset_admin():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client["ai_hospital_db"]
    users_collection = db["users"]
    
    # Update the admin password to 'admin123'
    await users_collection.update_one(
        {"email": "admin@hospital.com"},
        {"$set": {"hashed_password": get_password_hash("admin123")}}
    )
    print("✅ Admin password reset to 'admin123'")

if __name__ == "__main__":
    asyncio.run(reset_admin())