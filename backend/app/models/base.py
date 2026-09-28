import datetime
from sqlalchemy import Column, DateTime
from app.db.session import Base

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        onupdate=datetime.datetime.utcnow, 
        nullable=False
    )
