from celery import Celery
from app.config import settings




if not settings.REDIS_URL or settings.REDIS_URL.strip() == "":
    print("❌ ERROR: REDIS_URL variable is completely blank or missing from your .env file!")

# Initialize Celery using your Upstash Redis configuration
celery_app = Celery(
    "hospital_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Enterprise configuration parameters
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_pool="solo"  # Required to bypass process-forking issues on Windows machines
)

@celery_app.task(name="app.celery_app.send_appointment_reminder")
def send_appointment_reminder(patient_name: str, appointment_time: str):
    """A background worker task that runs asynchronously outside our FastAPI flow."""
    print(f"\n🔔 [CELERY WORKER] Task started: Processing message queue...")
    print(f"📧 [REMINDER SENT] Hello {patient_name}, this is a reminder for your appointment at {appointment_time}.\n")
    return {"status": "success", "recipient": patient_name}