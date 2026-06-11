from app.celery_app import send_appointment_reminder
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from datetime import datetime, time, timedelta

from app.models.user import User
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/appointments", tags=["Appointment Management"])

class AppointmentCreateRequest(BaseModel):
    doctor_id: str
    department: str
    appointment_date: datetime  # Format: YYYY-MM-DD
    time_slot: str              # Format: "09:00 AM"

# --- 1. GET DOCTOR AVAILABLE SLOTS ---
@router.get("/doctors/{doctor_id}/slots")
async def get_doctor_slots(
    doctor_id: str, 
    date_str: str,  # Expected format: "YYYY-MM-DD"
    current_user: User = Depends(get_current_user)
):
    """Generates free 30-min slots for a doctor on a specific date by checking booked appointments."""
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Standard Hospital Shift: 09:00 AM to 05:00 PM (17:00)
    start_shift = datetime.combine(target_date.date(), time(9, 0))
    end_shift = datetime.combine(target_date.date(), time(17, 0))
    
    # Generate all potential 30-min slots
    all_slots = []
    current_time = start_shift
    while current_time < end_shift:
        all_slots.append(current_time.strftime("%I:%M %p"))
        current_time += timedelta(minutes=30)

    # Query MongoDB for already booked slots for this doctor on this day
    start_of_day = datetime.combine(target_date.date(), time.min)
    end_of_day = datetime.combine(target_date.date(), time.max)
    
    booked_appointments = await Appointment.find(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date >= start_of_day,
        Appointment.appointment_date <= end_of_day,
        Appointment.status != AppointmentStatus.CANCELLED
    ).to_list()

    booked_slots = {appt.time_slot for appt in booked_appointments}

    # Filter out booked slots
    available_slots = [slot for slot in all_slots if slot not in booked_slots]
    
    return {"doctor_id": doctor_id, "date": date_str, "available_slots": available_slots}

# --- 2. POST BOOK APPOINTMENT WITH VALIDATION ---
@router.post("/", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    request: AppointmentCreateRequest,
    current_user: User = Depends(require_role(["patient"]))
):
    """Books an appointment ensuring the time slot is actually free."""
    # Ensure the slot isn't already taken
    existing_booking = await Appointment.find_one(
        Appointment.doctor_id == request.doctor_id,
        Appointment.time_slot == request.time_slot,
        Appointment.status != AppointmentStatus.CANCELLED
    )
    if existing_booking:
        raise HTTPException(status_code=400, detail="This time slot has already been booked.")

    new_appointment = Appointment(
        patient_id=str(current_user.id),
        doctor_id=request.doctor_id,
        department=request.department,
        appointment_date=request.appointment_date,
        time_slot=request.time_slot,
        status=AppointmentStatus.REQUESTED
    )
    await new_appointment.insert()
    return {"message": "Appointment requested successfully", "appointment_id": str(new_appointment.id)}

# --- 3. PATCH STATUS (STATE MACHINE) ---
@router.patch("/{id}/status")
async def update_appointment_status(
    id: str, 
    new_status: AppointmentStatus,
    
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "doctor"]))
):
    """Strict state machine engine enforcing valid workflow transitions."""
    appointment = await Appointment.get(id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    current = appointment.status

    # Define strict Allowed Transitions mapping
    # requested -> confirmed -> in_consultation -> completed
    # any state before completed can transition to cancelled
    allowed_transitions = {
        AppointmentStatus.REQUESTED: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
        AppointmentStatus.CONFIRMED: [AppointmentStatus.IN_CONSULTATION, AppointmentStatus.CANCELLED],
        AppointmentStatus.IN_CONSULTATION: [AppointmentStatus.COMPLETED],
        AppointmentStatus.COMPLETED: [],  # Final state
        AppointmentStatus.CANCELLED: []   # Final state
    }

    if new_status not in allowed_transitions.get(current, []):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid workflow transition from status '{current.value}' to '{new_status.value}'"
        )

    appointment.status = new_status
    await appointment.save()

    # 🚀 CELERY BACKGROUND TRIGGER: If confirmed, dispatch the worker alert instantly!
    if new_status == AppointmentStatus.CONFIRMED:
        
        patient = await User.get(appointment.patient_id)
        
        send_appointment_reminder.delay(
            patient_name=str(patient.first_name if patient else "Patient"),
            appointment_time=appointment.time_slot
        )
        
        print("⚡ [FASTAPI] Dispatched reminder payload over to the Upstash cloud worker stream.")

    return {"message": f"Appointment status updated to {new_status.value}", "current_status": appointment.status}
@router.get("/me")
async def get_my_appointments(current_user: User = Depends(require_role(["patient", "doctor"]))):
    if current_user.role == "patient":
        return await Appointment.find(Appointment.patient_id == str(current_user.id)).to_list()
    return await Appointment.find(Appointment.doctor_id == str(current_user.id)).to_list()