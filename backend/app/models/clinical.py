from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class Medicine(Document):
    name: str
    category: str  # e.g., "Antibiotic", "Painkiller"
    stock_quantity: int
    unit_price: float
    reorder_level: int = 50

    class Settings:
        name = "medicines"

class LabTest(Document):
    patient_id: str
    doctor_id: str
    test_name: str  # e.g., "Complete Blood Count (CBC)"
    status: str = "Pending"  # "Pending", "Completed"
    report_url: Optional[str] = None  # We will save the Cloudinary PDF URL here later
    ordered_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "lab_tests"