from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin
from app.models.enums import TaskStatusEnum, CriticalityEnum, BlockStatusEnum

class MaintenanceTask(Base, TimestampMixin):
    __tablename__ = "maintenance_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(50), unique=True, nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    task_type = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    location = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    criticality = Column(SQLEnum(CriticalityEnum), default=CriticalityEnum.MEDIUM, nullable=False)
    urgency = Column(String(20), default="NORMAL")
    safety_critical = Column(Boolean, default=False)
    overdue = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    estimated_duration_minutes = Column(Integer, default=60, nullable=False)
    required_crew_count = Column(Integer, default=2)
    required_machine_type = Column(String(50), nullable=True)
    status = Column(SQLEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING, nullable=False)

    asset = relationship("Asset", back_populates="maintenance_tasks")
    department = relationship("Department", back_populates="tasks")
    block_request = relationship("BlockRequest", back_populates="task", uselist=False)
    safety_constraints = relationship("SafetyConstraint", back_populates="task")
    power_block_requirement = relationship("PowerBlockRequirement", back_populates="task", uselist=False)
    snt_dependency = relationship("SNTDependency", back_populates="task", uselist=False)
    resource_allocations = relationship("ResourceAllocation", back_populates="task")

class BlockRequest(Base, TimestampMixin):
    __tablename__ = "block_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    requested_start = Column(DateTime, nullable=True)
    requested_end = Column(DateTime, nullable=True)
    requested_duration_minutes = Column(Integer, nullable=False)
    block_type = Column(String(50), default="CORRIDOR_MAINTENANCE")
    power_block_required = Column(Boolean, default=False)
    signal_disconnection_required = Column(Boolean, default=False)
    status = Column(SQLEnum(BlockStatusEnum), default=BlockStatusEnum.REQUESTED, nullable=False)
    priority = Column(String(20), default="MEDIUM")
    remarks = Column(String(500), nullable=True)

    task = relationship("MaintenanceTask", back_populates="block_request")
    department = relationship("Department")
    allocations = relationship("BlockAllocation", back_populates="block_request")

class BlockWindow(Base, TimestampMixin):
    __tablename__ = "block_windows"

    id = Column(Integer, primary_key=True, index=True)
    window_code = Column(String(50), unique=True, nullable=False, index=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=False, index=True)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    maintenance_allowed = Column(Boolean, default=True)
    status = Column(SQLEnum(BlockStatusEnum), default=BlockStatusEnum.SCHEDULED)

    corridor = relationship("Corridor")
    allocations = relationship("BlockAllocation", back_populates="block_window")
    affected_train_movements = relationship("TrainMovement", back_populates="block_window")
    rri_constraints = relationship("RRIConstraint", back_populates="block_window")

class BlockAllocation(Base, TimestampMixin):
    __tablename__ = "block_allocations"

    id = Column(Integer, primary_key=True, index=True)
    block_request_id = Column(Integer, ForeignKey("block_requests.id"), nullable=False, index=True)
    block_window_id = Column(Integer, ForeignKey("block_windows.id"), nullable=False, index=True)
    allocated_start = Column(DateTime, nullable=True)
    allocated_end = Column(DateTime, nullable=True)
    status = Column(SQLEnum(BlockStatusEnum), default=BlockStatusEnum.SCHEDULED)

    block_request = relationship("BlockRequest", back_populates="allocations")
    block_window = relationship("BlockWindow", back_populates="allocations")
