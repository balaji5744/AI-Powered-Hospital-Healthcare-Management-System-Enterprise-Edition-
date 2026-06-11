from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str
    
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # ✉️ Mail Configuration Fields (Added to resolve the validation errors)
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    
    GROQ_API_KEY: str

    class Config:
        env_file = ".env"
        # Safe-guard: Tell Pydantic to ignore any other unexpected system environment variables
        extra = "ignore" 
        
settings = Settings()