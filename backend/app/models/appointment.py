from beanie import Document
from pydantic import Field
from datetime import datetime
from app.models.enums import AppointmentStatus

class Appointment(Document):
    patient_id: str
    doctor_id: str
    department: str
    appointment_date: datetime
    time_slot: str # e.g., "10:00 AM - 10:30 AM"
    status: AppointmentStatus = AppointmentStatus.REQUESTED
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "appointments"