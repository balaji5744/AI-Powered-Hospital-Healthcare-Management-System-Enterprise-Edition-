from beanie import Document
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class PrescribedMedicine(BaseModel):
    medicine_name: str
    dosage: str     # e.g., "500mg"
    frequency: str  # e.g., "1-0-1" (Morning-Night)
    duration: str   # e.g., "5 days"

class Prescription(Document):
    doctor_id: str
    patient_id: str
    appointment_id: str
    diagnosis: str
    medicines: List[PrescribedMedicine]
    instructions: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "prescriptions"