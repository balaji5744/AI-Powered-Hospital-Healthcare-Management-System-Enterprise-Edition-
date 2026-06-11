try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    print("Network Patch applied: Forcing public DNS resolution (8.8.8.8).")
except Exception as e:
    print(f"Could not apply network patch: {e}")

# --- YOUR ORIGINAL IMPORTS CONTINUE BELOW ---
from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie


# Import your settings
from app.config import settings
from app.routers import ai
# Import ALL the models you just created in Step 4
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.prescription import Prescription
from app.models.lab_test import LabTest
from app.models.invoice import Invoice
from app.models.medicine import Medicine
from app.models.medical_record import MedicalRecord
from app.models.room import Room
from app.models.admission import Admission
from app.models.vitals import Vitals
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, appointments, clinical, ai, users

from app.routers import auth, patients, appointments, doctors, prescriptions, billing,departments
from app.routers import clinical,admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    print("Starting up... Connecting to MongoDB Atlas.")
    
    # Create the Motor client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    
    # 🐛 QUICK FIX: Trick Beanie into thinking the method exists
    client.append_metadata = lambda *args, **kwargs: None
    
    # Initialize Beanie with the specific database and all document models
    await init_beanie(
        database=client.hospital_db, # Name of your database in Atlas
        document_models=[
            User,
            Patient,
            Doctor,
            Appointment,
            Prescription,
            LabTest,
            Invoice,
            Medicine,
            MedicalRecord,
            Room,
            Admission,
            Vitals,
            Notification,
            AuditLog
        ]
    )
    print("Successfully connected to MongoDB and registered all models!")
    
    yield # The application runs while yielding here
    
    # --- SHUTDOWN LOGIC ---
    print("Shutting down... Closing MongoDB connection.")
    client.close()

# Initialize the FastAPI app
app = FastAPI(
    title="AI-Powered Hospital Management API",
    description="Enterprise Edition Backend for HMS",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware

# Allow your React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple root check
@app.get("/", tags=["Health Check"])
async def health_check():
    return {
        "status": "Healthy", 
        "message": "Welcome to the Hospital Management System API"
    }
    


# Add this near the bottom of main.py
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(prescriptions.router)
app.include_router(billing.router)
app.include_router(clinical.router)
app.include_router(ai.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(departments.router)
