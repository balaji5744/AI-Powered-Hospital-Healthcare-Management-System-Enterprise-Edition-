from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from app.models.enums import AdmissionStatus

class Admission(Document):
    patient_id: str
    room_id: str
    primary_doctor_id: str
    admission_date: datetime = Field(default_factory=datetime.utcnow)
    discharge_date: Optional[datetime] = None
    reason_for_admission: str
    status: AdmissionStatus = AdmissionStatus.ADMITTED

    class Settings:
        name = "admissions"