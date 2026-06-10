import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Check for a real Redis URL, default to None for offline testing
REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    # Safe offline mode: executes background tasks immediately in-process
    celery_app = Celery("hms_tasks")
    celery_app.conf.update(
        task_always_eager=True,
        task_eager_propagates=True
    )
else:
    # Cloud mode for staging/production
    celery_app = Celery("hms_tasks", broker=REDIS_URL, backend=REDIS_URL)
    celery_app.conf.update(
        broker_connection_retry_on_startup=True,
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json"
    )

@celery_app.task(name="tasks.send_appointment_reminder")
def send_appointment_reminder(email: str, appointment_details: str):
    print(f"\n--- [BACKGROUND WORKER] ---")
    print(f"Sending automated notification to: {email}")
    print(f"Details: {appointment_details}")
    print(f"---------------------------\n")
    return {"status": "executed_locally", "recipient": email}