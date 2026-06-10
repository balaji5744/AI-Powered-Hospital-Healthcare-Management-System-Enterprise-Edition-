from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime

class Vitals(Document):
    patient_id: str
    nurse_id: str
    blood_pressure: Optional[str] = None # e.g. "120/80"
    heart_rate: Optional[int] = None
    temperature_f: Optional[float] = None
    oxygen_saturation_pct: Optional[float] = None
    notes: Optional[str] = None
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "vitals"