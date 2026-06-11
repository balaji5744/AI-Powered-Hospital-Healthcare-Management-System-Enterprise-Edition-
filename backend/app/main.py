# =========================================================
# NETWORK PATCH FOR DNS ISSUES
# =========================================================
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    print("Network Patch applied: Forcing public DNS resolution.")
except Exception as e:
    print(f"Could not apply network patch: {e}")

# =========================================================
# IMPORTS
# =========================================================
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config import settings

# Models
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

# Routers
from app.routers import (
    auth,
    patients,
    appointments,
    doctors,
    prescriptions,
    billing,
    departments,
    clinical,
    ai,
    users,
    admin,
)

# =========================================================
# DATABASE STARTUP / SHUTDOWN
# =========================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Connecting to MongoDB Atlas.")

    client = AsyncIOMotorClient(settings.MONGO_URI)

    # Temporary compatibility fix
    client.append_metadata = lambda *args, **kwargs: None

    await init_beanie(
        database=client.hospital_db,
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
            AuditLog,
        ],
    )

    print("Successfully connected to MongoDB and registered all models!")

    yield

    print("Shutting down... Closing MongoDB connection.")
    client.close()


# =========================================================
# FASTAPI APP
# =========================================================
app = FastAPI(
    title="AI-Powered Hospital Management API",
    description="Enterprise Edition Backend for HMS",
    version="1.0.0",
    lifespan=lifespan,
)

# =========================================================
# CORS
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://your-app.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# AUDIT LOG MIDDLEWARE
# =========================================================
@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    response = await call_next(request)

    if (
        request.method in ["POST", "PUT", "PATCH", "DELETE"]
        and response.status_code < 400
    ):
        if "/admin/audit-logs" not in request.url.path:
            user_id = "ANONYMOUS"

            if hasattr(request.state, "user") and request.state.user:
                user_id = str(request.state.user.id)

            try:
                log_entry = AuditLog(
                    user_id=user_id,
                    action=request.method,
                    resource_id=request.url.path,
                    timestamp=datetime.utcnow(),
                    ip_address=request.client.host
                    if request.client
                    else "127.0.0.1",
                )

                await log_entry.insert()

            except Exception as e:
                print(f"⚠️ Audit logging skipped or failed: {str(e)}")

    return response


# =========================================================
# HEALTH CHECK
# =========================================================
@app.get("/", tags=["Health Check"])
async def health_check():
    return {
        "status": "Healthy",
        "message": "Welcome to the Hospital Management System API",
    }


# =========================================================
# ROUTERS
# =========================================================
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