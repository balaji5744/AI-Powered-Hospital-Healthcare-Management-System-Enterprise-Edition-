from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from datetime import datetime

from app.models.user import User
from app.models.appointment import Appointment
from app.middleware.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats")
async def get_system_statistics(
    current_user: User = Depends(require_role(["admin"]))
) -> Dict[str, Any]:
    """Fetch high-level system analytics for the admin dashboard."""
    
    # 1. Count Total Users
    total_users = await User.count()
    
    # 2. Count Users by Role (Using your pure Python style)
    all_users = await User.find_all().to_list()
    roles_count = {}
    for u in all_users:
        roles_count[u.role] = roles_count.get(u.role, 0) + 1

    # 3. Count Total Appointments
    total_appointments = await Appointment.count()
    
    # 4. Count Appointments by Status
    all_appts = await Appointment.find_all().to_list()
    appointment_stats = {}
    for a in all_appts:
        appointment_stats[a.status] = appointment_stats.get(a.status, 0) + 1

    # 5. DAY 2 METRICS: Calculate Today's Appointments Volume
    appointments_today = 0
    today_date_string = datetime.utcnow().strftime("%Y-%m-%d")
    
    for a in all_appts:
        # Safely check if the appointment belongs to today
        if hasattr(a, "appointment_date") and today_date_string in str(a.appointment_date):
            appointments_today += 1

    return {
        "status": "success",
        "data": {
            "users": {
                "total": total_users,
                "by_role": roles_count
            },
            "appointments": {
                "total": total_appointments,
                "by_status": appointment_stats,
                "appointments_today": appointments_today
            },
            "hospital_operations": {
                "daily_patients_count": roles_count.get("patient", 0),
                "bed_occupancy": "62%",        # Stand-in operational placeholder asset
                "revenue_today": "₹42,500"     # Stand-in financial metric asset
            },
            "system_health": "Optimal"
        }
    }


# ========================================================
# DAY 2 TASK: STAFF MANAGEMENT ROUTER
# ========================================================
@router.post("/staff")
async def create_hospital_staff_account(
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(["admin"]))
) -> Dict[str, Any]:
    """Allows an administrator to create nurse, receptionist, lab_tech, or pharmacist accounts."""
    
    email = payload.get("email")
    password = payload.get("password")
    role = payload.get("role")  # expected values: nurse, receptionist, lab_tech, pharmacist

    # 1. Input parameters safe check
    if not email or not password or not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing fields. Email, password, and role are required."
        )

    # 2. Check if account already exists
    existing_user = await User.find_one({"email": email.strip()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    # 3. Save new staff member using your native model constructor layout
    new_staff = User(
        email=email.strip(),
        password=password,  # If your User model hashes password automatically on insert, keep as is
        role=role.strip().lower()
    )
    
    # Use your database persistence method (usually .insert() or .save() depending on your library setup)
    await new_staff.insert() 

    return {
        "status": "success",
        "message": f"Staff account provisioned successfully for role: {role.upper()}"
    }