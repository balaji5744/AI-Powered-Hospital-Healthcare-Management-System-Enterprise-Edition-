from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("/doctors/{doctor_id}/slots")
async def get_available_slots(doctor_id: str, date: str):
    """
    Day 1 Feature: Generate a fixed set of hourly operational slots 
    for a doctor to let the frontend team test their calendar view.
    """
    # Hardcoded mock schedule for testing
    working_hours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    
    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": working_hours
    }