"""
Railway Network Topology & Graph Service.

Models multi-corridor railway track sections, junctions, adjacency graphs,
and spatial connectivity without external GIS or graph dependencies.
"""

from collections import deque
import json
import logging
import os
from typing import Any, Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
NETWORK_JSON_PATH = os.path.join(DATA_DIR, "network.json")


class SectionModel(BaseModel):
    """Represents an individual physical track corridor section."""
    section_id: str
    section_name: str
    corridor_id: str
    location: str
    sequence: int = 1
    adjacent_sections: List[str] = Field(default_factory=list)
    electrified: bool = True
    tracks: int = 2


class CorridorModel(BaseModel):
    """Represents a major railway traffic corridor comprising ordered sections."""
    corridor_id: str
    name: str
    description: Optional[str] = ""
    sections: List[SectionModel] = Field(default_factory=list)


class NetworkTopologyModel(BaseModel):
    """Encapsulates the complete multi-corridor regional network."""
    corridors: List[CorridorModel] = Field(default_factory=list)


class NetworkGraph:
    """
    Lightweight adjacency graph and query engine for railway network topology.
    """

    def __init__(self, topology_path: Optional[str] = None):
        self.topology_path = topology_path or NETWORK_JSON_PATH
        self.corridors: Dict[str, CorridorModel] = {}
        self.sections: Dict[str, SectionModel] = {}
        self.adjacency: Dict[str, Set[str]] = {}
        self._load_topology()

    def _load_topology(self) -> None:
        if not os.path.exists(self.topology_path):
            logger.warning("Network topology file not found at '%s'. Using empty graph.", self.topology_path)
            return

        try:
            with open(self.topology_path, mode="r", encoding="utf-8") as f:
                data = json.load(f)

            for c_data in data.get("corridors", []):
                sections_list: List[SectionModel] = []
                for s_data in c_data.get("sections", []):
                    sec = SectionModel(**s_data)
                    sections_list.append(sec)
                    self.sections[sec.section_id] = sec

                    # Populate adjacency graph
                    if sec.section_id not in self.adjacency:
                        self.adjacency[sec.section_id] = set()
                    for adj in sec.adjacent_sections:
                        self.adjacency[sec.section_id].add(adj)
                        if adj not in self.adjacency:
                            self.adjacency[adj] = set()
                        self.adjacency[adj].add(sec.section_id)

                corridor = CorridorModel(
                    corridor_id=c_data["corridor_id"],
                    name=c_data["name"],
                    description=c_data.get("description", ""),
                    sections=sections_list,
                )
                self.corridors[corridor.corridor_id] = corridor

        except Exception as exc:
            logger.error("Failed to load network topology from '%s': %s", self.topology_path, exc)

    def get_topology(self) -> NetworkTopologyModel:
        return NetworkTopologyModel(corridors=list(self.corridors.values()))

    def get_corridor(self, corridor_id: str) -> Optional[CorridorModel]:
        return self.corridors.get(corridor_id)

    def get_section(self, section_id: str) -> Optional[SectionModel]:
        return self.sections.get(section_id)

    def get_neighboring_sections(self, section_id: str) -> List[SectionModel]:
        """Return direct adjacent section models for a given section."""
        adj_ids = self.adjacency.get(section_id, set())
        return [self.sections[s_id] for s_id in adj_ids if s_id in self.sections]

    def get_corridors_for_section(self, section_id: str) -> List[CorridorModel]:
        """Find all corridors containing a specific section (e.g. junction sections)."""
        matching: List[CorridorModel] = []
        for c in self.corridors.values():
            if any(s.section_id == section_id for s in c.sections):
                matching.append(c)
        return matching

    def is_connected(self, start_section: str, end_section: str) -> bool:
        """Check if two sections are connected in the network graph."""
        return self.find_path(start_section, end_section) is not None

    def find_path(self, start_section: str, end_section: str) -> Optional[List[str]]:
        """
        Find shortest section path between two stations/yards using BFS.
        """
        if start_section == end_section:
            return [start_section]
        if start_section not in self.adjacency or end_section not in self.adjacency:
            return None

        visited: Set[str] = {start_section}
        queue: deque = deque([(start_section, [start_section])])

        while queue:
            curr, path = queue.popleft()
            for neighbor in self.adjacency.get(curr, set()):
                if neighbor == end_section:
                    return path + [neighbor]
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))

        return None

    def map_location_to_section(self, location_str: str) -> Optional[str]:
        """
        Map a descriptive location or station name to a canonical section code.
        """
        if not location_str:
            return None
        loc_clean = location_str.strip().lower()

        # Direct section code check
        for sec_id in self.sections:
            if sec_id.lower() in loc_clean:
                return sec_id

        # Location name matching
        for sec in self.sections.values():
            if sec.location.lower() in loc_clean or loc_clean in sec.location.lower():
                return sec.section_id
            if sec.section_name.lower() in loc_clean or loc_clean in sec.section_name.lower():
                return sec.section_id

        return None

    def map_task_to_network(self, task: Dict[str, Any]) -> Tuple[Optional[str], Optional[str]]:
        """
        Extract or infer (corridor_id, section_id) for a maintenance task.
        """
        sec_id = task.get("section_id") or self.map_location_to_section(task.get("section_code", "")) or self.map_location_to_section(task.get("location", ""))
        cor_id = task.get("corridor_id")
        if sec_id and not cor_id:
            sec = self.get_section(sec_id)
            if sec:
                cor_id = sec.corridor_id
        return cor_id, sec_id

    def map_train_to_network(self, train: Dict[str, Any]) -> Tuple[Optional[str], Optional[str]]:
        """
        Extract or infer (corridor_id, section_id) for a scheduled train movement.
        """
        sec_id = train.get("section_id") or self.map_location_to_section(train.get("section_code", "")) or self.map_location_to_section(train.get("location", ""))
        cor_id = train.get("corridor_id")
        if sec_id and not cor_id:
            sec = self.get_section(sec_id)
            if sec:
                cor_id = sec.corridor_id
        return cor_id, sec_id


# Global network graph singleton
network_graph = NetworkGraph()
