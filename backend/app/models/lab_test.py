from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from app.models.enums import LabTestStatus

class LabTest(Document):
    patient_id: str
    doctor_id: str

    appointment_id: Optional[str] = None
    test_type: str
    priority: str = "routine"

    status: LabTestStatus = LabTestStatus.REQUESTED

    report_url: Optional[str] = None
    lab_notes: Optional[str] = None

    lab_tech_id: Optional[str] = None

    requested_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "lab_tests"