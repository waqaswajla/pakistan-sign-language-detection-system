from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    KEYPOINTS_DIR: str = "Keypoints"
    DATA_DIR: str = "PSL/data"
    SPEECH_DIR: str = "data/speech"
    CAMERA_INDEX: int = 0

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "wow.992du@gmail.com"
    SMTP_PASS: str = ""
    CONTACT_TO: str = "wow.992du@gmail.com"

    class Config:
        env_file = ".env"

settings = Settings()
