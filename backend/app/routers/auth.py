from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.models.user import User
from app.models.patient import Patient
from app.services.auth_utils import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Pydantic Schema to validate incoming registration data
class PatientRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str
    gender: str
    date_of_birth: datetime
    address: str
    emergency_contact: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_patient(patient_data: PatientRegisterRequest):
    # 1. Check if email already exists
    existing_user = await User.find_one(User.email == patient_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create the User login account
    hashed_pw = get_password_hash(patient_data.password)
    new_user = User(
        email=patient_data.email,
        hashed_password=hashed_pw,
        role="patient",
        hospital_id="HOSP-MAIN" # Can be dynamic later
    )
    await new_user.insert() # Save to MongoDB

    # 3. Create the Patient medical profile and link it to the User ID
    new_patient = Patient(
        user_id=str(new_user.id),
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        phone=patient_data.phone,
        gender=patient_data.gender,
        date_of_birth=patient_data.date_of_birth,
        address=patient_data.address,
        emergency_contact=patient_data.emergency_contact
    )
    await new_patient.insert() # Save to MongoDB

    return {
        "message": f"{new_user.role.capitalize()} registered successfully", 
        "user_id": str(new_user.id)
    }


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm maps the username field to our email
    user = await User.find_one(User.email == form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate the JWT Token carrying the user's email and role
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role,
        "user_id": str(user.id)
    }