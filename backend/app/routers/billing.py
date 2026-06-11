from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.models.user import User
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.prescription import Prescription
from app.models.invoice import Invoice
from app.middleware.dependencies import require_role

router = APIRouter(prefix="/billing", tags=["Billing & Payments"])

class InvoiceGenerateRequest(BaseModel):
    appointment_id: str
    tax_rate: float = 0.10  # Default 10% tax

@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_invoice(
    request: InvoiceGenerateRequest,
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "billing"]))
):
    """Aggregates costs from appointments and prescriptions into a validated Invoice."""
    
    # 1. Fetch the Appointment
    appointment = await Appointment.get(request.appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # 2. Fetch Doctor Profile for Consultation Fee lookup
    doctor = await Doctor.find_one(Doctor.user_id == appointment.doctor_id)
    consultation_fee = doctor.consultation_fee if doctor else 500.00

    # 3. Align Item List with Pydantic Schema Requirements (unit_price & total required)
    items_list = [{
        "description": f"Consultation Fee (Dr. {doctor.last_name if doctor else 'Staff'})",
        "quantity": 1,
        "unit_price": consultation_fee,
        "total": consultation_fee,
        "amount": consultation_fee
    }]
    
    pharmacy_total = 0.0
    prescription = await Prescription.find_one(Prescription.appointment_id == request.appointment_id)
    
    if prescription and prescription.medicines:
        for med in prescription.medicines:
            unit_price = getattr(med, 'price', 150.00)
            quantity = getattr(med, 'quantity', 1)
            med_cost = unit_price * quantity
            pharmacy_total += med_cost
            
            med_name = getattr(med, 'name', getattr(med, 'medicine_name', 'Prescribed Medicine'))
            
            # Map values perfectly to avoid nested object validation issues
            items_list.append({
                "description": f"Medicine: {med_name}",
                "quantity": quantity,
                "unit_price": unit_price,
                "total": med_cost,
                "amount": med_cost
            })

    # 4. Calculation aggregates
    subtotal = consultation_fee + pharmacy_total
    tax_amount = subtotal * request.tax_rate
    grand_total = subtotal + tax_amount

    # 5. Build document explicitly supplying both schema variations to guarantee alignment
    # 5. Build document explicitly supplying both schema variations to guarantee alignment
    invoice = Invoice(
        patient_id=appointment.patient_id,
        appointment_id=request.appointment_id,
        items=items_list,
        subtotal=subtotal,
        tax=tax_amount,
        grand_total=grand_total,
        total_amount=grand_total,
        status="UNPAID",
        issued_at=datetime.utcnow()
    )
    await invoice.insert()

    # 🚀 SAFE RETURN PATCH: Bypasses strict dot-notation attributes for the printout summary
    return {
        "message": "Invoice compiled and generated successfully",
        "invoice_id": str(invoice.id),
        "summary": {
            "subtotal": subtotal,
            "tax": tax_amount,
            "total_amount": grand_total,
            "status": getattr(invoice, 'status', getattr(invoice, 'payment_status', 'UNPAID'))
        }
    }