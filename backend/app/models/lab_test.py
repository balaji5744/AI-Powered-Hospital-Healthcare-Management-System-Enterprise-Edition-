from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from app.models.enums import LabTestStatus

class LabTest(Document):
    patient_id: str
    doctor_id: str
    test_type: str  # Blood Test, X-Ray, MRI, CT Scan
    status: LabTestStatus = LabTestStatus.REQUESTED
    report_url: Optional[str] = None # Link to uploaded PDF/Image in cloud storage
    lab_notes: Optional[str] = None
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "lab_tests"