from fastapi import APIRouter, Depends
from typing import Dict, Any

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
    
    # 2. Count Users by Role (Using pure Python to bypass library bugs)
    all_users = await User.find_all().to_list()
    roles_count = {}
    for u in all_users:
        roles_count[u.role] = roles_count.get(u.role, 0) + 1

    # 3. Count Total Appointments
    total_appointments = await Appointment.count()
    
    # 4. Count Appointments by Status (Using pure Python)
    all_appts = await Appointment.find_all().to_list()
    appointment_stats = {}
    for a in all_appts:
        appointment_stats[a.status] = appointment_stats.get(a.status, 0) + 1

    return {
        "status": "success",
        "data": {
            "users": {
                "total": total_users,
                "by_role": roles_count
            },
            "appointments": {
                "total": total_appointments,
                "by_status": appointment_stats
            },
            "system_health": "Optimal"
        }
    }