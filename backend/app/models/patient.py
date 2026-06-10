from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class InsuranceInfo(BaseModel):
    provider_name: str
    policy_number: str
    valid_upto: datetime

class Patient(Document):
    user_id: str  # Links to the User login account
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: str
    blood_group: Optional[str] = None
    phone: str
    address: str
    emergency_contact: str
    
    # Medical History (Module 2)
    allergies: List[str] = []
    previous_diseases: List[str] = []
    surgeries: List[str] = []
    current_medications: List[str] = []
    
    insurance: Optional[InsuranceInfo] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "patients"