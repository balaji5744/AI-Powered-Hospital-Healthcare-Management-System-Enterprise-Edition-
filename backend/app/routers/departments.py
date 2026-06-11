from fastapi import APIRouter, Depends
from typing import Dict, List

from app.models.user import User
from app.middleware.dependencies import get_current_user

router = APIRouter(prefix="/departments", tags=["Hospital Departments"])

@router.get("/")
async def get_departments_and_doctors(current_user: User = Depends(get_current_user)):
    """Returns a list of departments and the doctors assigned to them for the booking form."""
    
    # Fetch all doctors from the database
    doctors = await User.find(User.role == "doctor").to_list()
    
    # Group them dynamically by their department
    departments: Dict[str, List[dict]] = {}
    
    for doc in doctors:
        dept_name = getattr(doc, "department", "General Practice")
        
        if dept_name not in departments:
            departments[dept_name] = []
            
        departments[dept_name].append({
            "id": str(doc.id),
            "name": f"Dr. {getattr(doc, 'first_name', '')} {getattr(doc, 'last_name', '')}".strip(),
            "email": doc.email
        })
        
    formatted_result = [{"department": key, "doctors": value} for key, value in departments.items()]
    return {"status": "success", "data": formatted_result}