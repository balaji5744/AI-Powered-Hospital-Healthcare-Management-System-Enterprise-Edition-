from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from app.models.user import User
from app.middleware.dependencies import require_role
from app.services.ai_service import analyze_symptoms

router = APIRouter(prefix="/ai", tags=["AI Features"])

class SymptomCheckRequest(BaseModel):
    symptoms: List[str]
    age: int
    gender: str

@router.post("/symptom-check")
async def run_symptom_check(
    request: SymptomCheckRequest,
    current_user: User = Depends(require_role(["patient", "doctor", "nurse"]))
):
    """
    Takes a list of symptoms and returns an AI-generated triage assessment.
    """
    analysis = await analyze_symptoms(
        symptoms=request.symptoms,
        age=request.age,
        gender=request.gender
    )
    
    return {
        "status": "success",
        "data": analysis
    }