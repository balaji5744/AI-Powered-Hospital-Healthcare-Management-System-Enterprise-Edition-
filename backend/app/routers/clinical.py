from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Import M1's Models (Assuming they are set up as per M1's tasks)
from app.models.user import User
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.lab_test import LabTest

# Core utilities
from app.middleware.dependencies import require_role
from app.services.file_utils import upload_file

router = APIRouter(tags=["Clinical - EMR, Lab, Pharmacy"])

# ==========================================
# EMR: MEDICAL RECORDS
# ==========================================

@router.post("/records/upload", status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
    patient_id: str = Form(...),
    record_type: str = Form(..., description="e.g., X-Ray, MRI, General"),
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["doctor", "nurse", "lab_tech", "hospital_admin"]))
):
    """Accepts multipart form (file + metadata), saves Cloudinary URL to MedicalRecord collection."""
    
    # 1. Upload to Cloudinary
    secure_url = await upload_file(file, folder=f"patients/{patient_id}/records")

    # 2. Save document to MongoDB (Using exact field names expected by M1's model)
    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=str(current_user.id),
        document_type=record_type,  # Changed from 'type'
        title=title,
        document_url=secure_url,    # Changed from 'file_url'
        uploaded_at=datetime.utcnow()
    )
    await record.insert()
    return {"message": "Record uploaded successfully", "record_id": str(record.id), "url": secure_url}


@router.get("/records/{patient_id}")
async def get_patient_records(
    patient_id: str,
    type: Optional[str] = None,
    current_user: User = Depends(require_role(["doctor", "nurse", "patient", "hospital_admin"]))
):
    """Fetch patient records. Supports optional ?type= filter."""
    query = {"patient_id": patient_id}
    if type:
        query["document_type"] = type  # Map the URL parameter 'type' to the DB field 'document_type'

    records = await MedicalRecord.find(query).to_list()
    return records

@router.get("/records/{patient_id}")
async def get_patient_records(
    patient_id: str,
    type: Optional[str] = None,
    current_user: User = Depends(require_role(["doctor", "nurse", "patient", "hospital_admin"]))
):
    """Fetch patient records. M4 needs this for the patient dashboard. Supports optional ?type= filter."""
    query = {"patient_id": patient_id}
    if type:
        query["type"] = type

    records = await MedicalRecord.find(query).to_list()
    return records


# ==========================================
# PHARMACY: PRESCRIPTIONS
# ==========================================

class MedicineItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class PrescriptionCreateRequest(BaseModel):
    patient_id: str
    appointment_id: str
    diagnosis: str
    medicines: List[MedicineItem]
    notes: Optional[str] = None

@router.post("/prescriptions", status_code=status.HTTP_201_CREATED)
async def create_prescription(
    request: PrescriptionCreateRequest,
    current_user: User = Depends(require_role(["doctor"]))
):
    """Doctor creates a prescription with a list of medicines."""
    prescription = Prescription(
        patient_id=request.patient_id,
        doctor_id=str(current_user.id),
        appointment_id=request.appointment_id,
        diagnosis=request.diagnosis,
        medicines=request.medicines,
        notes=request.notes,
        status="pending", # Pending pharmacist dispense
        issued_at=datetime.utcnow()
    )
    await prescription.insert()
    return {"message": "Prescription created successfully", "prescription_id": str(prescription.id)}


@router.get("/pharmacy/prescriptions")
async def get_pending_prescriptions(
    current_user: User = Depends(require_role(["pharmacist", "hospital_admin"]))
):
    """Pending list for the Pharmacist view."""
    pending = await Prescription.find({"status": "pending"}).to_list()
    return pending


# ==========================================
# LAB TESTS
# ==========================================

class LabTestOrderRequest(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    test_type: str  # Changed from test_name
    priority: str = "routine"

@router.post("/lab-tests", status_code=status.HTTP_201_CREATED)
async def order_lab_test(
    request: LabTestOrderRequest,
    current_user: User = Depends(require_role(["doctor"]))
):
    """Doctor orders a lab test."""
    lab_test = LabTest(
        patient_id=request.patient_id,
        doctor_id=str(current_user.id),
        appointment_id=request.appointment_id,
        test_type=request.test_type, # Changed from test_name
        priority=request.priority,
        status="Requested",          # Changed from "pending" to match Enum
        ordered_at=datetime.utcnow()
    )
    await lab_test.insert()
    return {"message": "Lab test ordered", "lab_test_id": str(lab_test.id)}


@router.patch("/lab-tests/{id}/upload-report")
async def upload_lab_report(
    id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["lab_tech", "hospital_admin"]))
):
    """Lab tech uploads the resulting file for an ordered test."""
    lab_test = await LabTest.get(id)
    if not lab_test:
        raise HTTPException(status_code=404, detail="Lab test order not found")

    # 1. Upload report to Cloudinary
    secure_url = await upload_file(file, folder=f"patients/{lab_test.patient_id}/lab_reports")

    # 2. Update DB Record
    lab_test.report_url = secure_url
    lab_test.status = "Report Generation" # Updated to match Enum
    lab_test.completed_at = datetime.utcnow()
    lab_test.lab_tech_id = str(current_user.id)
    
    await lab_test.save()
    return {"message": "Lab report uploaded successfully", "report_url": secure_url}