import asyncio
from datetime import datetime

# 🚀 NETWORK BYPASS PATCH
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    print("Network Patch applied: Forcing public DNS resolution (8.8.8.8).")
except Exception as e:
    print(f"Could not apply network patch: {e}")

from motor.motor_asyncio import AsyncIOMotorClient
from app.services.auth_utils import get_password_hash
from app.config import settings

async def seed_admin():
    print("Connecting to MongoDB via raw Motor to bypass Beanie version bugs...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    
    # Safely extract database target
    try:
        db = client.get_default_database()
        if db.name == "test" or not db.name:
            db = client["ai_hospital_db"]
    except Exception:
        db = client["ai_hospital_db"]
        
    print(f"Connected! Target Database: {db.name}")
    
    # Target the 'users' collection directly (matches Beanie Settings)
    users_collection = db["users"]
    admin_email = "admin@hospital.com"
    
    # Check if this admin already exists in the collection
    existing_admin = await users_collection.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_doc = {
            "email": admin_email,
            "hashed_password": get_password_hash("admin123"),
            "role": "hospital_admin",
            "hospital_id": "HOSP-MAIN",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        # Direct driver insert
        await users_collection.insert_one(admin_doc)
        print("\n🚀 SUCCESS: Hospital Admin account created via raw driver!")
        print(f"👉 Email: {admin_email}")
        print(f"👉 Password: admin123\n")
    else:
        print("\nℹ️ Admin account already exists in the database.")

if __name__ == "__main__":
    asyncio.run(seed_admin())