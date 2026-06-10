from beanie import Document
from pydantic import EmailStr, Field
from datetime import datetime

class User(Document):
    email: EmailStr
    hashed_password: str
    role: str  # super_admin|hospital_admin|doctor|nurse|receptionist|lab_tech|pharmacist|billing|patient
    hospital_id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"  