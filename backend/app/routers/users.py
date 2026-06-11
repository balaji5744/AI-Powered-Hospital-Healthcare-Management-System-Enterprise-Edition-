from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.middleware.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["User Management"])

# Pydantic model for updating a profile
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Fetch the currently logged-in user's full profile."""
    # We remove the password hash before sending it to the frontend!
    user_data = current_user.dict(exclude={"hashed_password"})
    
    # Ensure MongoDB ObjectId is converted to a string for JSON parsing
    if "id" in user_data:
        user_data["id"] = str(user_data["id"])
    elif "_id" in user_data:
        user_data["_id"] = str(user_data["_id"])
        
    return {"status": "success", "data": user_data}

@router.put("/me")
async def update_my_profile(
    update_data: UserUpdate, 
    current_user: User = Depends(get_current_user)
):
    """Update the currently logged-in user's details."""
    # Drop any None values so we don't overwrite existing data with nulls
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields provided for update.")

    # Update the user model directly using your ODM
    for key, value in update_dict.items():
        setattr(current_user, key, value)
        
    # Save the changes to MongoDB
    await current_user.save()

    return {"status": "success", "message": "Profile updated successfully"}

@router.get("/")
async def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Fetch a directory of users with optional filtering and search."""
    query = {}
    
    # 1. Filter by role (e.g., role="doctor")
    if role:
        query["role"] = role.lower()
        
    # 2. Search by email or name (case-insensitive)
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}}
        ]

    # 3. Fetch from MongoDB using Beanie ODM
    users_cursor = User.find(query).skip(skip).limit(limit)
    users = await users_cursor.to_list()
    
    # 4. Clean the data (remove passwords, fix ObjectIds)
    cleaned_users = []
    for user in users:
        user_data = user.dict(exclude={"hashed_password"})
        if "id" in user_data:
            user_data["id"] = str(user_data["id"])
        elif "_id" in user_data:
            user_data["_id"] = str(user_data["_id"])
        cleaned_users.append(user_data)
        
    return {
        "status": "success", 
        "count": len(cleaned_users),
        "data": cleaned_users
    }