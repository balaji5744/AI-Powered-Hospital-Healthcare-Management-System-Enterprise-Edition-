from beanie import Document
from pydantic import Field
from app.models.enums import RoomType

class Room(Document):
    room_number: str
    room_type: RoomType
    capacity: int
    current_occupancy: int = 0
    cost_per_day: float
    is_available: bool = True

    class Settings:
        name = "rooms"