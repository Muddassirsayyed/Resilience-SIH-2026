"""
Resource Data Model for Multi-Crew and Machinery Allocation.
Provides lightweight, extensible models for track maintenance crews and machinery inventory.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CrewResource(BaseModel):
    """Represents a specialized maintenance workforce unit."""
    crew_id: str
    crew_type: str = Field(..., description="e.g. track, electrical, civil, signaling, general")
    capacity: int = Field(default=1, description="Number of parallel teams or workers available")


class MachineResource(BaseModel):
    """Represents heavy track equipment or machinery inventory."""
    machine_id: str
    machine_type: str = Field(..., description="e.g. tamping_machine, tower_wagon, usfd_tester, crane")
    capacity: int = Field(default=1, description="Number of machines available for simultaneous operation")


class ResourcePool:
    """
    Manages regional or depot-level resource pools for maintenance block scheduling.
    """

    def __init__(
        self,
        crews: Optional[List[CrewResource]] = None,
        machines: Optional[List[MachineResource]] = None,
    ):
        self.crews: Dict[str, CrewResource] = {}
        if crews:
            for c in crews:
                self.crews[c.crew_type.lower()] = c

        self.machines: Dict[str, MachineResource] = {}
        if machines:
            for m in machines:
                self.machines[m.machine_type.lower()] = m

    def get_crew_capacity(self, crew_type: str, default: int = 10) -> int:
        """Get capacity for a crew type. Defaults to ample capacity if unconstrained."""
        c = self.crews.get(crew_type.lower())
        return c.capacity if c else default

    def get_machine_capacity(self, machine_type: str, default: int = 10) -> int:
        """Get capacity for a machine type. Defaults to ample capacity if unconstrained."""
        m = self.machines.get(machine_type.lower())
        return m.capacity if m else default

    @classmethod
    def default_railway_pool(cls) -> "ResourcePool":
        """
        Sensible default resource pool for standard Indian Railways corridor operations.
        """
        crews = [
            CrewResource(crew_id="CREW-TRK-01", crew_type="track", capacity=4),
            CrewResource(crew_id="CREW-TRD-01", crew_type="electrical", capacity=3),
            CrewResource(crew_id="CREW-BRG-01", crew_type="civil", capacity=2),
            CrewResource(crew_id="CREW-SIG-01", crew_type="signaling", capacity=3),
            CrewResource(crew_id="CREW-GEN-01", crew_type="general", capacity=5),
        ]
        machines = [
            MachineResource(machine_id="MCH-TMP-01", machine_type="tamping_machine", capacity=1),
            MachineResource(machine_id="MCH-TWR-01", machine_type="tower_wagon", capacity=2),
            MachineResource(machine_id="MCH-UFD-01", machine_type="usfd_tester", capacity=2),
            MachineResource(machine_id="MCH-CRN-01", machine_type="crane", capacity=1),
        ]
        return cls(crews=crews, machines=machines)
