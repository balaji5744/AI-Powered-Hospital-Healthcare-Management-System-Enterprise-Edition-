import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.config import settings

# Initialize Cloudinary configuration
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_file(file: UploadFile, folder: str = "hospital_records") -> str:
    """
    Uploads a FastAPI UploadFile to Cloudinary and returns the secure URL.
    """
    try:
        # We read the file content directly into Cloudinary's uploader
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type="auto" # Automatically detects image vs raw PDF
        )
        return result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary Upload Failed: {str(e)}")