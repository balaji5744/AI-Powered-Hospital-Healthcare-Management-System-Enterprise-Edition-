from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any

from app.models.user import User
from app.models.doctor import Doctor
from app.services.auth_utils import get_password_hash
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/doctors", tags=["Doctor Management"])

class DoctorCreateRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    department: str
    specialization: str
    consultation_fee: float

# ========================================================
# 1. CREATE DOCTOR (POST /doctors/) - Added "admin"
# ========================================================
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_doctor(
    request: DoctorCreateRequest,
    # 🛠️ FIXED: Added "admin" to the allowed list
    current_user: User = Depends(require_role(["admin", "super_admin", "hospital_admin"]))
):
    """Add a new doctor to the hospital system (Admin Only)."""
    
    existing_user = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        role="doctor",
        hospital_id="HOSP-MAIN"
    )
    await new_user.insert()

    new_doctor = Doctor(
        user_id=str(new_user.id),
        first_name=request.first_name,
        last_name=request.last_name,
        department=request.department,
        specialization=request.specialization,
        consultation_fee=request.consultation_fee,
        is_available=True
    )
    await new_doctor.insert()

    return {"message": "Doctor created successfully", "doctor_id": str(new_doctor.id)}

# ========================================================
# 2. GET DOCTORS (GET /doctors/) - Added "admin"
# ========================================================
@router.get("/")
async def get_all_doctors(
    department: Optional[str] = Query(None, description="Filter doctors by medical department"),
    # 🛠️ FIXED: Added "admin" to the allowed list
    current_user: User = Depends(require_role(["admin", "super_admin", "hospital_admin"]))
):
    """Fetch a list of available doctors, optionally filtered by department (Admin Only)."""
    
    if department:
        doctors = await Doctor.find(
            Doctor.is_available == True, 
            Doctor.department == department
        ).to_list()
    else:
        doctors = await Doctor.find(Doctor.is_available == True).to_list()
        
    return doctors

# ========================================================
# 3. GET DEPARTMENTS (GET /doctors/departments) - Added "admin"
# ========================================================
@router.get("/departments")
async def get_hospital_departments(
    # 🛠️ FIXED: Added "admin" to the allowed list
    current_user: User = Depends(require_role(["admin", "super_admin", "hospital_admin"]))
):
    """Fetch unique medical departments currently staffed by active doctors (Admin Only)."""
    all_doctors = await Doctor.find(Doctor.is_available == True).to_list()
    unique_depts = list(set([doc.department for doc in all_doctors if doc.department]))
    return {"status": "success", "departments": unique_depts}

# ========================================================
# 4. GET SCHEDULE (GET /doctors/{doctor_id}/schedule) - Added "admin"
# ========================================================
@router.get("/{doctor_id}/schedule")
async def get_doctor_schedule(
    doctor_id: str,
    # 🛠️ FIXED: Added "admin" to the allowed list
    current_user: User = Depends(require_role(["admin", "super_admin", "hospital_admin"]))
):
    """Retrieve available booking time slots for a specific doctor (Admin Only)."""
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile record not found")
        
    available_slots = [
        "09:00 AM", 
        "10:00 AM", 
        "11:00 AM", 
        "02:00 PM", 
        "03:00 PM", 
        "04:00 PM"
    ]
    
    return {
        "status": "success",
        "doctor_id": doctor_id,
        "doctor_name": f"Dr. {doctor.first_name} {doctor.last_name}",
        "department": doctor.department,
        "available_slots": available_slots
    }