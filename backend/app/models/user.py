from beanie import Document
from pydantic import EmailStr, Field
from datetime import datetime
from typing import Optional

class User(Document):
    email: EmailStr
    hashed_password: str
    role: str
    hospital_id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # --- ADD THESE 3 NEW FIELDS ---
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None

    class Settings:
        name = "users"