from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from app.models.user import User
from app.models.invoice import Invoice
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.prescription import Prescription
from app.models.room import Room
from app.models.admission import Admission

from app.middleware.dependencies import require_role

router = APIRouter(
    prefix="/billing",
    tags=["Billing & Logistics Management"]
)

# ========================================================
# REQUEST MODELS
# ========================================================

class InvoiceGenerateRequest(BaseModel):
    appointment_id: str
    tax_rate: float = 0.10


class PaymentUpdatePayload(BaseModel):
    payment_method: str


class AdmissionRequest(BaseModel):
    patient_id: str
    room_number: str


# ========================================================
# 💳 SMART INVOICE GENERATION
# ========================================================

@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_invoice(
    request: InvoiceGenerateRequest,
    current_user: User = Depends(
        require_role([
            "super_admin",
            "hospital_admin",
            "billing",
            "admin"
        ])
    )
):
    """
    Generate invoice automatically from
    consultation fee + prescribed medicines.
    """

    appointment = await Appointment.get(request.appointment_id)

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    doctor = await Doctor.find_one(
        Doctor.user_id == appointment.doctor_id
    )

    consultation_fee = (
        doctor.consultation_fee
        if doctor and hasattr(doctor, "consultation_fee")
        else 500.0
    )

    items_list = [
        {
            "description": f"Consultation Fee (Dr. {doctor.last_name if doctor else 'Staff'})",
            "quantity": 1,
            "unit_price": consultation_fee,
            "total": consultation_fee,
            "amount": consultation_fee
        }
    ]

    pharmacy_total = 0.0

    prescription = await Prescription.find_one(
        Prescription.appointment_id == request.appointment_id
    )

    if prescription and prescription.medicines:
        for med in prescription.medicines:

            unit_price = getattr(med, "price", 150.0)
            quantity = getattr(med, "quantity", 1)

            med_cost = unit_price * quantity
            pharmacy_total += med_cost

            med_name = getattr(
                med,
                "name",
                getattr(med, "medicine_name", "Prescribed Medicine")
            )

            items_list.append(
                {
                    "description": f"Medicine: {med_name}",
                    "quantity": quantity,
                    "unit_price": unit_price,
                    "total": med_cost,
                    "amount": med_cost
                }
            )

    subtotal = consultation_fee + pharmacy_total
    tax_amount = subtotal * request.tax_rate
    grand_total = subtotal + tax_amount

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

    return {
        "message": "Invoice compiled and generated successfully",
        "invoice_id": str(invoice.id),
        "summary": {
            "subtotal": subtotal,
            "tax": tax_amount,
            "total_amount": grand_total,
            "status": invoice.status
        }
    }


# ========================================================
# 📄 GET ALL PATIENT INVOICES
# ========================================================

@router.get("/invoices/{patient_id}")
async def get_patient_invoices(
    patient_id: str,
    current_user: User = Depends(
        require_role([
            "patient",
            "admin",
            "billing"
        ])
    )
):
    invoices = await Invoice.find(
        Invoice.patient_id == patient_id
    ).to_list()

    return invoices


# ========================================================
# 💰 PAY INVOICE
# ========================================================

@router.patch("/invoices/{id}/pay")
async def process_invoice_payment(
    id: str,
    payload: PaymentUpdatePayload,
    current_user: User = Depends(
        require_role([
            "patient",
            "billing",
            "admin"
        ])
    )
):
    invoice = await Invoice.get(id)

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice record not found"
        )

    invoice.status = "PAID"
    invoice.payment_method = payload.payment_method

    await invoice.save()

    return {
        "status": "success",
        "message": "Payment completed successfully"
    }


# ========================================================
# 🛏️ ROOM AVAILABILITY
# ========================================================

@router.get("/rooms/availability")
async def check_bed_availability(
    current_user: User = Depends(
        require_role([
            "admin",
            "nurse",
            "receptionist"
        ])
    )
):
    vacant_rooms = await Room.find(
        Room.is_occupied == False
    ).to_list()

    return {
        "status": "success",
        "available_rooms_count": len(vacant_rooms),
        "rooms": vacant_rooms
    }


# ========================================================
# 🏥 ADMIT PATIENT
# ========================================================

@router.post("/admissions")
async def admit_patient_to_ward(
    request: AdmissionRequest,
    current_user: User = Depends(
        require_role([
            "admin",
            "nurse"
        ])
    )
):
    room = await Room.find_one(
        Room.room_number == request.room_number
    )

    if not room or room.is_occupied:
        raise HTTPException(
            status_code=400,
            detail="Room unavailable"
        )

    room.is_occupied = True
    await room.save()

    admission = Admission(
        patient_id=request.patient_id,
        room_number=request.room_number,
        status="ADMITTED",
        admitted_at=datetime.utcnow()
    )

    await admission.insert()

    return {
        "status": "success",
        "admission_id": str(admission.id),
        "message": "Patient admitted successfully"
    }


# ========================================================
# 🏥 DISCHARGE PATIENT
# ========================================================

@router.patch("/admissions/{id}/discharge")
async def discharge_patient_from_ward(
    id: str,
    current_user: User = Depends(
        require_role([
            "admin",
            "nurse",
            "doctor"
        ])
    )
):
    admission = await Admission.get(id)

    if not admission or admission.status == "DISCHARGED":
        raise HTTPException(
            status_code=400,
            detail="Admission record not found"
        )

    room = await Room.find_one(
        Room.room_number == admission.room_number
    )

    if room:
        room.is_occupied = False
        await room.save()

    admission.status = "DISCHARGED"
    admission.discharged_at = datetime.utcnow()

    await admission.save()

    return {
        "status": "success",
        "message": "Patient discharged successfully"
    }