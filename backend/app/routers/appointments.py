from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.models.user import User
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/appointments", tags=["Appointment Management"])

# Schema for the incoming booking request
class AppointmentCreateRequest(BaseModel):
    doctor_id: str
    department: str
    appointment_date: datetime
    time_slot: str  # e.g., "10:00 AM - 10:30 AM"
    notes: str = ""

@router.post("/", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    request: AppointmentCreateRequest,
    # Only patients can book appointments this way
    current_user: User = Depends(require_role(["patient"]))
):
    """Book a new appointment as a patient."""
    
    # Create the appointment document
    new_appointment = Appointment(
        patient_id=str(current_user.id),
        doctor_id=request.doctor_id,
        department=request.department,
        appointment_date=request.appointment_date,
        time_slot=request.time_slot,
        notes=request.notes,
        status=AppointmentStatus.REQUESTED
    )
    
    await new_appointment.insert() # Save to database
    
    return {
        "message": "Appointment requested successfully", 
        "appointment_id": str(new_appointment.id)
    }

@router.get("/me")
async def get_my_appointments(
    # Both patients and doctors need to see their own schedules
    current_user: User = Depends(require_role(["patient", "doctor"]))
):
    """Fetch all appointments for the logged-in patient or doctor."""
    
    if current_user.role == "patient":
        appointments = await Appointment.find(Appointment.patient_id == str(current_user.id)).to_list()
    elif current_user.role == "doctor":
        appointments = await Appointment.find(Appointment.doctor_id == str(current_user.id)).to_list()
        
    return appointments