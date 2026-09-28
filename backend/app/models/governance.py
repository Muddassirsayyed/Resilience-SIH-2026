from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class ReplanningEvent(Base, TimestampMixin):
    __tablename__ = "replanning_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # TRAIN_DELAY, EMERGENCY_DEFECT, RESOURCE_UNAVAILABLE, BLOCK_OVERRUN
    severity = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    source = Column(String(50), default="COA")
    affected_task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=True, index=True)
    affected_train_id = Column(Integer, ForeignKey("trains.id"), nullable=True, index=True)
    affected_block_id = Column(Integer, ForeignKey("block_windows.id"), nullable=True, index=True)
    description = Column(String(500), nullable=True)
    old_plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    new_optimization_run_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=True)
    status = Column(String(20), default="TRIGGERED")  # TRIGGERED, REOPTIMIZED, APPLIED, IGNORED

    optimization_run = relationship("OptimizationRun", back_populates="replanning_events")

class Approval(Base, TimestampMixin):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    user = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # CHIEF_CONTROLLER, TPC, SR_DOM, SECTION_ENGINEER
    action = Column(String(50), nullable=False)  # APPROVE, REJECT, MODIFY
    decision = Column(String(50), default="APPROVED")
    remarks = Column(Text, nullable=True)

    plan = relationship("Plan", back_populates="approvals")

class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(100), nullable=False, index=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    entity = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
