from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List

from app.models.user import User
from app.models.doctor import Doctor
from app.services.auth_utils import get_password_hash
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/doctors", tags=["Doctor Management"])

# Schema for Admin adding a new doctor
class DoctorCreateRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    department: str
    specialization: str
    consultation_fee: float

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_doctor(
    request: DoctorCreateRequest,
    # In a real system, only admins can hire doctors. 
    # For testing right now, we will temporarily allow 'patient' to create a doctor so you don't get blocked.
    # TODO: Change this to ["super_admin", "hospital_admin"] later!
    current_user: User = Depends(require_role(["patient", "super_admin", "hospital_admin"]))
):
    """Add a new doctor to the hospital system."""
    
    # 1. Check if email exists
    existing_user = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create the User login account for the doctor
    new_user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        role="doctor",
        hospital_id="HOSP-MAIN"
    )
    await new_user.insert()

    # 3. Create the Doctor's public profile
    new_doctor = Doctor(
        user_id=str(new_user.id),
        first_name=request.first_name,
        last_name=request.last_name,
        department=request.department,
        specialization=request.specialization,
        consultation_fee=request.consultation_fee
    )
    await new_doctor.insert()

    return {"message": "Doctor created successfully", "doctor_id": str(new_doctor.id)}

@router.get("/")
async def get_all_doctors(
    # Everyone (patients, nurses, admins) needs to be able to see the doctor list
    current_user: User = Depends(require_role(["patient", "doctor", "nurse", "hospital_admin"]))
):
    """Fetch a list of all available doctors."""
    doctors = await Doctor.find(Doctor.is_available == True).to_list()
    return doctors