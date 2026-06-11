from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    status,
)
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Models
from app.models.user import User
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.lab_test import LabTest
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus

# Dependencies & Services
from app.middleware.dependencies import require_role
from app.services.file_utils import upload_file

router = APIRouter(tags=["Clinical - EMR, Lab, Pharmacy"])


# ==========================================================
# REQUEST MODELS
# ==========================================================

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


class LabTestOrderRequest(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    test_type: str
    priority: str = "routine"


class ClinicalNoteRequest(BaseModel):
    diagnosis: str
    notes: str
    prescriptions: List[str]


# ==========================================================
# EMR - MEDICAL RECORDS
# ==========================================================

@router.post("/records/upload", status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
    patient_id: str = Form(...),
    record_type: str = Form(..., description="e.g., X-Ray, MRI, General"),
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(
        require_role(["doctor", "nurse", "lab_tech", "hospital_admin"])
    ),
):
    """
    Upload medical record file and save metadata.
    """

    secure_url = await upload_file(
        file,
        folder=f"patients/{patient_id}/records"
    )

    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=str(current_user.id),
        document_type=record_type,
        title=title,
        document_url=secure_url,
        uploaded_at=datetime.utcnow(),
    )

    await record.insert()

    return {
        "message": "Record uploaded successfully",
        "record_id": str(record.id),
        "url": secure_url,
    }


@router.get("/records/{patient_id}")
async def get_patient_records(
    patient_id: str,
    type: Optional[str] = None,
    current_user: User = Depends(
        require_role(
            ["doctor", "nurse", "patient", "hospital_admin"]
        )
    ),
):
    """
    Fetch patient medical records.
    Supports optional ?type= filter.
    """

    query = {"patient_id": patient_id}

    if type:
        query["document_type"] = type

    records = await MedicalRecord.find(query).to_list()

    return records


# ==========================================================
# PHARMACY - PRESCRIPTIONS
# ==========================================================

@router.post("/prescriptions", status_code=status.HTTP_201_CREATED)
async def create_prescription(
    request: PrescriptionCreateRequest,
    current_user: User = Depends(require_role(["doctor"])),
):
    """
    Doctor creates prescription.
    """

    prescription = Prescription(
        patient_id=request.patient_id,
        doctor_id=str(current_user.id),
        appointment_id=request.appointment_id,
        diagnosis=request.diagnosis,
        medicines=request.medicines,
        notes=request.notes,
        status="pending",
        issued_at=datetime.utcnow(),
    )

    await prescription.insert()

    return {
        "message": "Prescription created successfully",
        "prescription_id": str(prescription.id),
    }


@router.get("/pharmacy/prescriptions")
async def get_pending_prescriptions(
    current_user: User = Depends(
        require_role(["pharmacist", "hospital_admin"])
    ),
):
    """
    Get all pending prescriptions.
    """

    pending = await Prescription.find(
        {"status": "pending"}
    ).to_list()

    return pending


# ==========================================================
# LAB TESTS
# ==========================================================

@router.post("/lab-tests", status_code=status.HTTP_201_CREATED)
async def order_lab_test(
    request: LabTestOrderRequest,
    current_user: User = Depends(require_role(["doctor"])),
):
    """
    Doctor orders lab test.
    """

    lab_test = LabTest(
        patient_id=request.patient_id,
        doctor_id=str(current_user.id),
        appointment_id=request.appointment_id,
        test_type=request.test_type,
        priority=request.priority,
        status="Requested",
        ordered_at=datetime.utcnow(),
    )

    await lab_test.insert()

    return {
        "message": "Lab test ordered",
        "lab_test_id": str(lab_test.id),
    }


@router.patch("/lab-tests/{id}/upload-report")
async def upload_lab_report(
    id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(
        require_role(["lab_tech", "hospital_admin"])
    ),
):
    """
    Lab technician uploads report.
    """

    lab_test = await LabTest.get(id)

    if not lab_test:
        raise HTTPException(
            status_code=404,
            detail="Lab test order not found",
        )

    secure_url = await upload_file(
        file,
        folder=f"patients/{lab_test.patient_id}/lab_reports",
    )

    lab_test.report_url = secure_url
    lab_test.status = "Report Generation"
    lab_test.completed_at = datetime.utcnow()
    lab_test.lab_tech_id = str(current_user.id)

    await lab_test.save()

    return {
        "message": "Lab report uploaded successfully",
        "report_url": secure_url,
    }


# ==========================================================
# CLINICAL DOCUMENTATION
# ==========================================================

@router.post("/appointments/{appointment_id}/note")
async def add_clinical_note(
    appointment_id: str,
    note_data: ClinicalNoteRequest,
    current_user: User = Depends(require_role(["doctor"])),
):
    """
    Doctor documents consultation and closes appointment.
    """

    appointment = await Appointment.get(appointment_id)

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found",
        )

    if appointment.doctor_id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this appointment",
        )

    appointment.clinical_notes = note_data.notes
    appointment.diagnosis = note_data.diagnosis
    appointment.prescriptions = note_data.prescriptions
    appointment.status = AppointmentStatus.COMPLETED

    await appointment.save()

    return {
        "status": "success",
        "message": "Consultation finalized and record saved.",
    }
    
# --- Add these to the bottom of app/routers/clinical.py ---

# ==========================
# NURSE VITALS
# ==========================
class VitalsRequest(BaseModel):
    patient_id: str
    blood_pressure: str
    heart_rate: int
    temperature: float

@router.post("/vitals")
async def record_vitals(
    request: VitalsRequest,
    current_user: User = Depends(require_role(["nurse", "doctor", "super_admin"]))
):
    """Nurses record patient vitals during triage or rounds."""
    # Note: Ensure you have a Vitals model created in your models folder!
    from app.models.clinical import Vitals 
    
    vitals = Vitals(
        patient_id=request.patient_id,
        nurse_id=str(current_user.id),
        blood_pressure=request.blood_pressure,
        heart_rate=request.heart_rate,
        temperature=request.temperature
    )
    await vitals.insert()
    return {"status": "success", "message": "Vitals recorded successfully", "vitals_id": str(vitals.id)}

# ==========================
# PHARMACY INVENTORY & DISPENSING
# ==========================
@router.get("/medicines/low-stock")
async def get_low_stock_medicines(
    current_user: User = Depends(require_role(["pharmacist", "super_admin", "hospital_admin"]))
):
    """Alerts the pharmacy dashboard of medicines that need to be reordered."""
    from app.models.clinical import Medicine
    low_stock = await Medicine.find(Medicine.stock_quantity <= Medicine.reorder_level).to_list()
    return {"status": "success", "count": len(low_stock), "data": low_stock}

@router.post("/pharmacy/dispense/{prescription_id}")
async def dispense_prescription(
    prescription_id: str,
    current_user: User = Depends(require_role(["pharmacist", "super_admin"]))
):
    """Pharmacist dispenses medicine and marks the prescription as fulfilled."""
    from app.models.prescription import Prescription
    
    prescription = await Prescription.get(prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    if getattr(prescription, "status", "") == "Dispensed":
        raise HTTPException(status_code=400, detail="Prescription already dispensed")

    prescription.status = "Dispensed"
    await prescription.save()
    
    return {"status": "success", "message": "Medicines dispensed to patient"}


# ==========================================================
# LAB TESTS - PENDING QUEUE
# ==========================================================

@router.get("/lab-tests/pending")
async def get_pending_lab_tests(
    current_user: User = Depends(require_role(["lab_tech", "hospital_admin", "super_admin"]))
):
    """Fetches all lab test orders awaiting processing by technicians."""
    pending_tests = await LabTest.find(LabTest.status == "Requested").to_list()
    return pending_tests


# ==========================================================
# CLINICAL HISTORY - VITALS TRACKING
# ==========================================================

@router.get("/vitals/{patient_id}/history")
async def get_vitals_history(
    patient_id: str,
    current_user: User = Depends(require_role(["nurse", "doctor", "patient", "super_admin"]))
):
    """Retrieves chronological health records of vitals for a specific patient card."""
    from app.models.clinical import Vitals
    
    history = await Vitals.find(Vitals.patient_id == patient_id).to_list()
    return history


# ==========================================================
# PHARMACY - MEDICINE INVENTORY MANAGEMENT
# ==========================================================

class MedicineCreateRequest(BaseModel):
    name: str
    stock_quantity: int
    reorder_level: int

class StockUpdateRequest(BaseModel):
    stock_quantity: int


@router.post("/medicines", status_code=status.HTTP_201_CREATED)
async def create_medicine_item(
    request: MedicineCreateRequest,
    current_user: User = Depends(require_role(["pharmacist", "super_admin", "hospital_admin"]))
):
    """Allows a pharmacist to introduce a new stock item to the pharmacy grid."""
    from app.models.clinical import Medicine
    
    new_medicine = Medicine(
        name=request.name,
        stock_quantity=request.stock_quantity,
        reorder_level=request.reorder_level
    )
    await new_medicine.insert()
    return {"status": "success", "message": "Medicine catalog entry initialized", "id": str(new_medicine.id)}


@router.get("/medicines")
async def get_all_medicines(
    current_user: User = Depends(require_role(["pharmacist", "doctor", "super_admin", "hospital_admin"]))
):
    """Lists every item tracked across the hospital pharmacy inventory."""
    from app.models.clinical import Medicine
    
    medicines = await Medicine.find_all().to_list()
    return medicines


@router.patch("/medicines/{id}")
async def update_medicine_stock(
    id: str,
    request: StockUpdateRequest,
    current_user: User = Depends(require_role(["pharmacist", "super_admin"]))
):
    """Updates the stock counts directly when replenishment orders arrive."""
    from app.models.clinical import Medicine
    
    medicine = await Medicine.get(id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Requested item not found in pharmacy registry")
        
    medicine.stock_quantity = request.stock_quantity
    await medicine.save()
    return {"status": "success", "message": "Inventory tracking ledger modified successfully"}