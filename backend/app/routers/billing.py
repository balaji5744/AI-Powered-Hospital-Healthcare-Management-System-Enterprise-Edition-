from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["Billing"])

class InvoiceCreate(BaseModel):
    appointment_id: str
    consultation_fee: float
    lab_fees: float = 0.0
    pharmacy_fees: float = 0.0

@router.post("/invoices/generate")
async def generate_invoice(invoice_data: InvoiceCreate):
    """
    Day 1 Feature: Mock invoice calculations for the finance tracking system.
    """
    subtotal = invoice_data.consultation_fee + invoice_data.lab_fees + invoice_data.pharmacy_fees
    tax = subtotal * 0.05  # 5% institutional tax
    grand_total = subtotal + tax
    
    return {
        "invoice_id": "MOCK-INV-1001",
        "appointment_id": invoice_data.appointment_id,
        "subtotal": subtotal,
        "tax": tax,
        "grand_total": grand_total,
        "status": "unpaid"
    }