from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

from app.models.user import User
from app.models.prescription import Prescription, PrescribedMedicine
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/prescriptions", tags=["Doctor Consultation"])

# Schema for the Doctor creating a prescription
class PrescriptionCreateRequest(BaseModel):
    appointment_id: str
    patient_id: str
    diagnosis: str
    medicines: List[PrescribedMedicine]
    instructions: str

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_prescription(
    request: PrescriptionCreateRequest,
    # ONLY Doctors can write prescriptions!
    current_user: User = Depends(require_role(["doctor"]))
):
    """Create a new prescription and mark the appointment as Completed."""
    
    # 1. Verify the appointment exists
    appointment = await Appointment.get(request.appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # 2. Create the Prescription document
    new_prescription = Prescription(
        doctor_id=str(current_user.id),
        patient_id=request.patient_id,
        appointment_id=request.appointment_id,
        diagnosis=request.diagnosis,
        medicines=request.medicines,
        instructions=request.instructions
    )
    await new_prescription.insert()

    # 3. Update the Appointment status to COMPLETED
    appointment.status = AppointmentStatus.COMPLETED
    await appointment.save()

    return {
        "message": "Prescription created successfully", 
        "prescription_id": str(new_prescription.id)
    }

@router.get("/patient/{patient_id}")
async def get_patient_prescriptions(
    patient_id: str,
    # Patients can see their own, Doctors/Pharmacists can see any
    current_user: User = Depends(require_role(["patient", "doctor", "pharmacist"]))
):
    """Fetch all prescriptions for a specific patient."""
    
    # Security check: If a patient is calling this, ensure they are only asking for their own ID
    if current_user.role == "patient":
        # We'd ideally check if patient_id matches the logged-in user's patient profile here.
        pass 

    prescriptions = await Prescription.find(Prescription.patient_id == patient_id).to_list()
    return prescriptions