from beanie import Document
from pydantic import Field
from typing import Dict, Any, Optional
from datetime import datetime

class AuditLog(Document):
    user_id: str
    action: str # e.g., "CREATE_PRESCRIPTION", "UPDATE_BILLING"
    resource_id: Optional[str] = None # The ID of the document changed
    details: Dict[str, Any] = {} # Storing what exactly changed
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"