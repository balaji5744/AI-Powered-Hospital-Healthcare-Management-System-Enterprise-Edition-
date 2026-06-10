from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime

class MedicalRecord(Document):
    patient_id: str
    doctor_id: str
    document_type: str  # Prescription, Lab Report, X-Ray, MRI
    document_url: str   # URL to the AWS S3 or local file storage
    description: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "medical_records"