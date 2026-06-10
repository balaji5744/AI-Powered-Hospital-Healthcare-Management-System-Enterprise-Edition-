from beanie import Document
from pydantic import Field
from datetime import datetime

class Notification(Document):
    user_id: str
    title: str
    message: str
    notification_type: str # e.g., "APPOINTMENT_REMINDER", "REPORT_READY"
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"