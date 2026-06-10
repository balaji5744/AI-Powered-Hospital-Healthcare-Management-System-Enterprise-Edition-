from beanie import Document
from pydantic import Field
from datetime import datetime

class Doctor(Document):
    user_id: str  # Links to the User login account
    first_name: str
    last_name: str
    department: str
    specialization: str
    consultation_fee: float
    is_available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "doctors"