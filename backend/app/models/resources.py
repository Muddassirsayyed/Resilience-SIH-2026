from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin
from app.models.enums import ResourceTypeEnum, ResourceStatusEnum

class Resource(Base, TimestampMixin):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(SQLEnum(ResourceTypeEnum), nullable=False)
    status = Column(SQLEnum(ResourceStatusEnum), default=ResourceStatusEnum.AVAILABLE, nullable=False)
    current_location = Column(String(100), nullable=True)
    availability_window_start = Column(DateTime, nullable=True)
    availability_window_end = Column(DateTime, nullable=True)
    capacity = Column(Integer, default=1)

    crew_details = relationship("Crew", back_populates="resource", uselist=False, cascade="all, delete-orphan")
    machine_details = relationship("Machine", back_populates="resource", uselist=False, cascade="all, delete-orphan")
    allocations = relationship("ResourceAllocation", back_populates="resource")

class Crew(Base, TimestampMixin):
    __tablename__ = "crews"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, unique=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    gang_code = Column(String(50), nullable=False, index=True)
    size = Column(Integer, default=5)
    supervisor_name = Column(String(100), nullable=True)

    resource = relationship("Resource", back_populates="crew_details")
    department = relationship("Department")

class Machine(Base, TimestampMixin):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, unique=True, index=True)
    machine_type = Column(String(50), nullable=False, index=True)  # BCM, CSM, DGS, UNIMAT, TOWER_WAGON
    home_shed = Column(String(50), nullable=True)
    max_output_per_hour = Column(String(50), nullable=True)

    resource = relationship("Resource", back_populates="machine_details")

class ResourceAllocation(Base, TimestampMixin):
    __tablename__ = "resource_allocations"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False, index=True)
    assigned_start = Column(DateTime, nullable=True)
    assigned_end = Column(DateTime, nullable=True)
    status = Column(SQLEnum(ResourceStatusEnum), default=ResourceStatusEnum.ASSIGNED)

    resource = relationship("Resource", back_populates="allocations")
    task = relationship("MaintenanceTask", back_populates="resource_allocations")
