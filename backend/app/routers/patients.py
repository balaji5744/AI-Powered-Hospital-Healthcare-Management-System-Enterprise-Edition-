from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.user import User
from app.models.patient import Patient
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/patients", tags=["Patient Management"])

@router.get("/me")
async def get_my_profile(
    # Only users with the "patient" role can access this endpoint
    current_user: User = Depends(require_role(["patient"]))
):
    """Fetch the profile of the currently logged-in patient."""
    
    # Find the patient profile linked to this user's ID
    patient = await Patient.find_one(Patient.user_id == str(current_user.id))
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    return patient

@router.get("/")
async def get_all_patients(
    # Notice how we block patients from accessing this list!
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "doctor", "nurse"]))
):
    """Fetch a list of all patients (Staff only)."""
    
    patients = await Patient.find_all().to_list()
    return patients