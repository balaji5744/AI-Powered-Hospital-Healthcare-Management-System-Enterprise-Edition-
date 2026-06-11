from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.models.user import User
from app.models.patient import Patient
from app.middleware.dependencies import get_current_user, require_role

router = APIRouter(prefix="/patients", tags=["Patient Management"])

# ========================================================
# 1. FETCH CURRENT PATIENT PROFILE (Existing - Kept)
# ========================================================
@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(require_role(["patient"]))
):
    """Fetch the profile of the currently logged-in patient."""
    patient = await Patient.find_one(Patient.user_id == str(current_user.id))
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    return patient

# ========================================================
# 2. PATIENT UPDATE OWN PROFILE (Frontend Edit Sync)
# ========================================================
@router.put("/me")
async def update_my_profile(
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(["patient"]))
):
    """Allows a logged-in patient to edit their phone, address, and personal info."""
    patient = await Patient.find_one(Patient.user_id == str(current_user.id))
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile record not found")

    # Safely update using your Pydantic/Beanie setters
    patient.first_name = payload.get("first_name", patient.first_name)
    patient.last_name = payload.get("last_name", patient.last_name)
    patient.date_of_birth = payload.get("date_of_birth", patient.date_of_birth)
    patient.gender = payload.get("gender", patient.gender)
    patient.phone = payload.get("phone", patient.phone)
    patient.address = payload.get("address", patient.address)
    patient.emergency_contact = payload.get("emergency_contact", patient.emergency_contact)

    await patient.save()
    return {"status": "success", "message": "Profile updated successfully"}

# ========================================================
# 3. FETCH ALL PATIENTS (Existing - Kept)
# ========================================================
@router.get("/")
async def get_all_patients(
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "doctor", "nurse", "receptionist"]))
):
    """Fetch a list of all patients (Staff only)."""
    patients = await Patient.find_all().to_list()
    return patients

# ========================================================
# 4. DAY 2: CREATE PATIENT RECORD (POST /patients)
# ========================================================
@router.post("")
async def create_patient_record(
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "receptionist"]))
):
    """Allows hospital reception staff or admins to provision a clinical profile manually."""
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id parameter is required to initialize profile.")

    # Duplicate check matching Beanie conventions
    existing = await Patient.find_one(Patient.user_id == str(user_id))
    if existing:
        raise HTTPException(status_code=400, detail="A clinical profile already exists for this user ID.")

    new_patient = Patient(
        user_id=str(user_id),
        first_name=payload.get("first_name"),
        last_name=payload.get("last_name", ""),
        date_of_birth=payload.get("date_of_birth"),
        gender=payload.get("gender"),
        phone=payload.get("phone"),
        address=payload.get("address"),
        emergency_contact=payload.get("emergency_contact"),
        blood_group=payload.get("blood_group"),
        allergies=payload.get("allergies", []),
        previous_diseases=payload.get("previous_diseases", []),
        surgeries=[],
        current_medications=[]
    )
    await new_patient.insert()
    return {"status": "success", "message": "Patient profile successfully created", "id": str(new_patient.id)}

# ========================================================
# 5. DAY 2: FETCH PATIENT BY ID (GET /patients/{id})
# ========================================================
@router.get("/{patient_id}")
async def get_patient_by_id(
    patient_id: str,
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "doctor", "nurse", "receptionist"]))
):
    """Look up a specific patient profile by its Beanie MongoDB Document ID."""
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found with the requested ID.")
    return patient

# ========================================================
# 6. DAY 2: UPDATE PATIENT BY ID (PUT /patients/{id})
# ========================================================
@router.put("/{patient_id}")
async def update_patient_by_id(
    patient_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "receptionist"]))
):
    """Allows staff to overwrite or update an explicit patient file."""
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    patient.first_name = payload.get("first_name", patient.first_name)
    patient.last_name = payload.get("last_name", patient.last_name)
    patient.date_of_birth = payload.get("date_of_birth", patient.date_of_birth)
    patient.gender = payload.get("gender", patient.gender)
    patient.phone = payload.get("phone", patient.phone)
    patient.address = payload.get("address", patient.address)
    patient.emergency_contact = payload.get("emergency_contact", patient.emergency_contact)
    patient.blood_group = payload.get("blood_group", patient.blood_group)
    patient.allergies = payload.get("allergies", patient.allergies)

    await patient.save()
    return {"status": "success", "message": "Patient profile records modified smoothly."}

# ========================================================
# 7. DAY 2: GET PATIENT HISTORY (GET /patients/{id}/history)
# ========================================================
@router.get("/{patient_id}/history")
async def get_patient_history(
    patient_id: str,
    current_user: User = Depends(require_role(["super_admin", "hospital_admin", "doctor", "nurse"]))
):
    """Fetches diagnostic and historical chart information for a specified patient."""
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient target records missing.")
        
    # Combines profile demographics alongside systemic timelines
    return {
        "status": "success",
        "patient_id": patient_id,
        "clinical_history": {
            "allergies": patient.allergies,
            "previous_diseases": getattr(patient, "previous_diseases", []),
            "past_admissions_count": 0,
            "resolved_prescriptions_count": 0
        }
    }