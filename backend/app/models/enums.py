from enum import Enum

class AppointmentStatus(str, Enum):
    REQUESTED = "Requested"
    CONFIRMED = "Confirmed"
    IN_CONSULTATION = "In Consultation"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class LabTestStatus(str, Enum):
    REQUESTED = "Requested"
    SAMPLE_COLLECTED = "Sample Collection"
    TESTING = "Testing"
    REPORT_GENERATED = "Report Generation"
    REVIEWED = "Doctor Review"

class PaymentMethod(str, Enum):
    UPI = "UPI"
    CARD = "Card"
    CASH = "Cash"
    
class PaymentStatus(str, Enum):
    PENDING = "Pending"
    PAID = "Paid"
    FAILED = "Failed"
    REFUNDED = "Refunded"

class RoomType(str, Enum):
    GENERAL_WARD = "General Ward"
    PRIVATE_ROOM = "Private Room"
    ICU = "ICU"
    EMERGENCY = "Emergency"

class AdmissionStatus(str, Enum):
    ADMITTED = "Admitted"
    DISCHARGED = "Discharged"
    TRANSFERRED = "Transferred"