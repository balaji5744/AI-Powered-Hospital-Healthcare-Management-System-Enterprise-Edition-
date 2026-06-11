from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import List, Optional
from app.models.enums import AppointmentStatus

class Appointment(Document):
    patient_id: str
    doctor_id: str
    department: str
    appointment_date: datetime
    time_slot: str

    status: AppointmentStatus = AppointmentStatus.REQUESTED

    notes: str = ""

    # Clinical Documentation
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    prescriptions: List[str] = []

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "appointments"