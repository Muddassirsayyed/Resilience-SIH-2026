from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class SafetyConstraint(Base, TimestampMixin):
    __tablename__ = "safety_constraints"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False, index=True)
    constraint_type = Column(String(100), nullable=False)  # TRAFFIC_PROTECTION, SPEED_RESTRICTION, ISOLATION
    description = Column(String(500), nullable=True)
    mandatory = Column(Boolean, default=True, nullable=False)
    buffer_duration_minutes = Column(Integer, default=15)
    applicable_department = Column(String(50), nullable=True)
    applicable_location = Column(String(100), nullable=True)

    task = relationship("MaintenanceTask", back_populates="safety_constraints")

class PowerBlockRequirement(Base, TimestampMixin):
    __tablename__ = "power_block_requirements"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False, unique=True, index=True)
    affected_section = Column(String(100), nullable=False)
    affected_tracks = Column(String(100), nullable=True)
    isolation_required = Column(Boolean, default=True, nullable=False)
    isolation_duration_minutes = Column(Integer, default=15)
    restoration_duration_minutes = Column(Integer, default=15)
    safety_requirement_description = Column(String(500), nullable=True)

    task = relationship("MaintenanceTask", back_populates="power_block_requirement")

class SNTDependency(Base, TimestampMixin):
    __tablename__ = "snt_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False, unique=True, index=True)
    equipment = Column(String(100), nullable=False)
    affected_route = Column(String(100), nullable=True)
    disconnection_required = Column(Boolean, default=True, nullable=False)
    disconnection_duration_minutes = Column(Integer, default=20)
    restoration_duration_minutes = Column(Integer, default=20)
    dependency_description = Column(String(500), nullable=True)

    task = relationship("MaintenanceTask", back_populates="snt_dependency")

class RRIConstraint(Base, TimestampMixin):
    __tablename__ = "rri_constraints"

    id = Column(Integer, primary_key=True, index=True)
    block_window_id = Column(Integer, ForeignKey("block_windows.id"), nullable=False, index=True)
    location = Column(String(100), nullable=False)
    route = Column(String(100), nullable=True)
    conflicting_movement = Column(String(200), nullable=True)
    restriction_type = Column(String(100), nullable=False)  # POINT_LOCK, ROUTE_LOCK, YARD_LINE_BLOCKED
    active_time_window = Column(String(50), nullable=True)
    description = Column(String(500), nullable=True)

    block_window = relationship("BlockWindow", back_populates="rri_constraints")
