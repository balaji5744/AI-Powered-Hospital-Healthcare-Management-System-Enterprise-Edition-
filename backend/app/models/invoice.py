from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.enums import PaymentMethod, PaymentStatus

class InvoiceItem(BaseModel):
    description: str # e.g., "Consultation Fee", "Blood Test", "Paracetamol 500mg"
    quantity: int = 1
    unit_price: float
    total: float

class Invoice(Document):
    patient_id: str
    reference_id: Optional[str] = None  # Could link to an appointment_id or admission_id
    items: List[InvoiceItem]
    subtotal: float
    tax: float = 0.0
    total_amount: float
    payment_method: Optional[PaymentMethod] = None
    payment_status: PaymentStatus = PaymentStatus.PENDING
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None

    class Settings:
        name = "invoices"