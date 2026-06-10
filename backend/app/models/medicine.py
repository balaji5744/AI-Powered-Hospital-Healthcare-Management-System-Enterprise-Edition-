from beanie import Document
from pydantic import Field
from datetime import datetime

class Medicine(Document):
    name: str
    generic_name: str
    manufacturer: str
    supplier: str
    batch_number: str
    unit_price: float
    stock_quantity: int
    expiry_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "medicines"