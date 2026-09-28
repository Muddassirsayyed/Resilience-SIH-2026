"""
Application Configuration Service.

Centralizes environment variables and deployment parameters with safe defaults
for production, staging, and local hackathon demonstration environments.
"""

import os
from pydantic import BaseModel


class AppConfig(BaseModel):
    app_name: str = "Resilience-SIH-2026 Railway Maintenance Planner"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "production")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    scheduler_mode: str = os.getenv("SCHEDULER_MODE", "cp_sat")
    clearance_buffer_minutes: int = int(os.getenv("CLEARANCE_BUFFER_MINUTES", "15"))
    max_solver_seconds: float = float(os.getenv("MAX_SOLVER_SECONDS", "10.0"))


# Global configuration singleton
config = AppConfig()
