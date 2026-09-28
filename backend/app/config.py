import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RAILOPT - AI Block Planning & Optimization"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/railopt_db"
    )
    # Fallback to SQLite if PostgreSQL is not available locally during dev/testing
    SQLITE_FALLBACK_URL: str = "sqlite:///./railopt_dev.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
