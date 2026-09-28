from enum import Enum

class DepartmentEnum(str, Enum):
    OPERATING = "OPERATING"
    ENGINEERING = "ENGINEERING"
    TRD = "TRD"
    S_AND_T = "S_AND_T"
    SAFETY = "SAFETY"
    COMMERCIAL = "COMMERCIAL"
    IT_CRIS = "IT_CRIS"

class TaskStatusEnum(str, Enum):
    PLANNED = "PLANNED"
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    BLOCKED = "BLOCKED"

class CriticalityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class BlockStatusEnum(str, Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SCHEDULED = "SCHEDULED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ResourceTypeEnum(str, Enum):
    CREW = "CREW"
    MACHINE = "MACHINE"
    EQUIPMENT = "EQUIPMENT"

class ResourceStatusEnum(str, Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    BUSY = "BUSY"
    MAINTENANCE = "MAINTENANCE"
    UNAVAILABLE = "UNAVAILABLE"

class TrainTypeEnum(str, Enum):
    PASSENGER = "PASSENGER"
    EXPRESS = "EXPRESS"
    FREIGHT = "FREIGHT"
    SPECIAL = "SPECIAL"
