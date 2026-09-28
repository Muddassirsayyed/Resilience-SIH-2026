from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.enums import (
    DepartmentEnum, TaskStatusEnum, CriticalityEnum, 
    BlockStatusEnum, ResourceTypeEnum, ResourceStatusEnum, TrainTypeEnum
)

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Geography & Assets
# -------------------------------------------------------------
class ZoneRead(BaseSchema):
    id: int
    code: str
    name: str
    headquarters: Optional[str] = None

class DivisionRead(BaseSchema):
    id: int
    zone_id: int
    code: str
    name: str

class CorridorRead(BaseSchema):
    id: int
    division_id: int
    code: str
    name: str
    from_station: Optional[str] = None
    to_station: Optional[str] = None
    distance_km: Optional[float] = None
    max_speed_kmph: Optional[int] = None

class StationRead(BaseSchema):
    id: int
    corridor_id: int
    code: str
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    line_count: int = 2

class AssetRead(BaseSchema):
    id: int
    asset_code: str
    asset_type: str
    location: Optional[str] = None
    condition: str = "FAIR"
    line_number: Optional[str] = None
    station_id: Optional[int] = None
    corridor_id: Optional[int] = None

# -------------------------------------------------------------
# Department
# -------------------------------------------------------------
class DepartmentRead(BaseSchema):
    id: int
    code: str
    name: str
    type: DepartmentEnum

# -------------------------------------------------------------
# Maintenance Task
# -------------------------------------------------------------
class MaintenanceTaskCreate(BaseModel):
    task_id: str
    asset_id: Optional[int] = None
    department_id: int
    task_type: str
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    criticality: CriticalityEnum = CriticalityEnum.MEDIUM
    urgency: str = "NORMAL"
    safety_critical: bool = False
    overdue: bool = False
    due_date: Optional[datetime] = None
    estimated_duration_minutes: int = 60
    required_crew_count: int = 2
    required_machine_type: Optional[str] = None

class MaintenanceTaskRead(BaseSchema):
    id: int
    task_id: str
    asset_id: Optional[int] = None
    department_id: int
    task_type: str
    description: Optional[str] = None
    location: Optional[str] = None
    criticality: CriticalityEnum
    urgency: str
    safety_critical: bool
    overdue: bool
    estimated_duration_minutes: int
    required_crew_count: int
    required_machine_type: Optional[str] = None
    status: TaskStatusEnum
    created_at: datetime
    updated_at: datetime

# -------------------------------------------------------------
# Block Request & Window
# -------------------------------------------------------------
class BlockRequestCreate(BaseModel):
    request_id: str
    task_id: int
    department_id: int
    requested_start: Optional[datetime] = None
    requested_end: Optional[datetime] = None
    requested_duration_minutes: int
    block_type: str = "CORRIDOR_MAINTENANCE"
    power_block_required: bool = False
    signal_disconnection_required: bool = False
    priority: str = "MEDIUM"
    remarks: Optional[str] = None

class BlockRequestRead(BaseSchema):
    id: int
    request_id: str
    task_id: int
    department_id: int
    requested_duration_minutes: int
    block_type: str
    power_block_required: bool
    signal_disconnection_required: bool
    status: BlockStatusEnum
    priority: str
    remarks: Optional[str] = None
    created_at: datetime

class BlockWindowRead(BaseSchema):
    id: int
    window_code: str
    corridor_id: int
    start_time: str
    end_time: str
    duration_minutes: int
    maintenance_allowed: bool
    status: BlockStatusEnum

# -------------------------------------------------------------
# Trains
# -------------------------------------------------------------
class TrainRead(BaseSchema):
    id: int
    train_number: str
    name: Optional[str] = None
    train_type: TrainTypeEnum
    priority: int
    origin: Optional[str] = None
    destination: Optional[str] = None

class TrainMovementRead(BaseSchema):
    id: int
    train_id: int
    corridor_id: Optional[int] = None
    station_id: Optional[int] = None
    scheduled_arrival: Optional[str] = None
    scheduled_departure: Optional[str] = None
    direction: str
    status: str
    delay_minutes: int

# -------------------------------------------------------------
# Resources
# -------------------------------------------------------------
class ResourceRead(BaseSchema):
    id: int
    resource_code: str
    name: str
    type: ResourceTypeEnum
    status: ResourceStatusEnum
    current_location: Optional[str] = None
    capacity: int

# -------------------------------------------------------------
# Safety Constraints
# -------------------------------------------------------------
class SafetyConstraintRead(BaseSchema):
    id: int
    task_id: int
    constraint_type: str
    description: Optional[str] = None
    mandatory: bool
    buffer_duration_minutes: int
