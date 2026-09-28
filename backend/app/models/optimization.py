from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class OptimizationRun(Base, TimestampMixin):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), unique=True, nullable=False, index=True)
    trigger_source = Column(String(50), default="MANUAL")  # MANUAL, SCHEDULED, DYNAMIC_REPLAN
    status = Column(String(20), default="COMPLETED")  # PENDING, RUNNING, COMPLETED, FAILED
    execution_time_seconds = Column(Float, nullable=True)

    plans = relationship("Plan", back_populates="optimization_run", cascade="all, delete-orphan")
    replanning_events = relationship("ReplanningEvent", back_populates="optimization_run")

class Plan(Base, TimestampMixin):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    optimization_run_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=False, index=True)
    plan_type = Column(String(50), nullable=False, index=True)  # PLAN_A, PLAN_B, PLAN_C
    name = Column(String(100), nullable=True)
    objective_score = Column(Float, nullable=True)
    train_impact_score = Column(Float, nullable=True)
    maintenance_coverage_percentage = Column(Float, nullable=True)
    resource_utilization_percentage = Column(Float, nullable=True)
    block_utilization_percentage = Column(Float, nullable=True)
    feasibility_status = Column(String(20), default="FEASIBLE")  # FEASIBLE, INFEASIBLE
    explanation_text = Column(Text, nullable=True)

    optimization_run = relationship("OptimizationRun", back_populates="plans")
    plan_tasks = relationship("PlanTask", back_populates="plan", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="plan")

class PlanTask(Base, TimestampMixin):
    __tablename__ = "plan_tasks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False, index=True)
    scheduled_start = Column(String(30), nullable=True)
    scheduled_end = Column(String(30), nullable=True)
    assigned_corridor = Column(String(50), nullable=True)
    priority_rank = Column(Integer, default=1)
    train_conflicts_count = Column(Integer, default=0)

    plan = relationship("Plan", back_populates="plan_tasks")
    task = relationship("MaintenanceTask")
