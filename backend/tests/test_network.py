"""
Phase 9 Multi-Corridor Network Synchronization & Deployment Hardening Test Suite.

Validates:
1. test_network_topology_loads_correctly: loads nodes/corridors/sections from JSON
2. test_corridor_lookup: retrieves corridor by ID and verifies sections list
3. test_section_lookup: retrieves section by ID and validates attributes
4. test_adjacent_sections_lookup: verifies bidirectional adjacency
5. test_network_path_finding: verifies BFS path finding across corridors
6. test_same_section_conflict_detection: conflict when task/train overlap on same section
7. test_adjacent_section_ripple_impact: ripple impact accurately identifies neighbor sections
8. test_independent_corridors_non_conflict: events on isolated sections don't cause spurious conflicts
9. test_network_impact_api_endpoint: POST /api/network/impact returns correct schema and impact analysis
10. test_emergency_blockage_network_integration: scenario engine emergency blockage with corridor_id/section_id
11. test_base_data_immutability_under_network_operations: base datasets remain strictly unmodified
12. test_health_endpoint: GET /api/health returns healthy status and system metrics
"""

import copy
import pytest
from fastapi.testclient import TestClient

from main import (
    app,
    INITIAL_MAINTENANCE_TASKS,
    TRAIN_MOVEMENTS,
    REGENERATED_BLOCK_PLANS,
)
from services.network import network_graph
from services.network_sync import network_sync_service, NetworkImpactRequest
from services.scenario import (
    ScenarioEngine,
    ScenarioCreateRequest,
    EmergencyBlockageDisruption,
)


@pytest.fixture
def client():
    return TestClient(app)


def test_network_topology_loads_correctly():
    """1. Network topology loads correctly from network.json."""
    topology = network_graph.get_topology()
    assert topology is not None
    assert len(topology.corridors) >= 2
    corridor_ids = [c.corridor_id for c in topology.corridors]
    assert "COR-NCR-01" in corridor_ids
    assert "COR-NCR-02" in corridor_ids
    assert len(network_graph.sections) >= 5


def test_corridor_lookup():
    """2. Corridor lookup by ID."""
    corridor = network_graph.get_corridor("COR-NCR-01")
    assert corridor is not None
    assert corridor.corridor_id == "COR-NCR-01"
    assert len(corridor.sections) >= 3
    section_ids = [s.section_id for s in corridor.sections]
    assert "NDLS-GZB-L3" in section_ids
    assert "MTJ-NY-L1" in section_ids
    assert "AGC-TDL-UP" in section_ids

    # Non-existent corridor
    assert network_graph.get_corridor("NON-EXISTENT") is None


def test_section_lookup():
    """3. Section lookup by ID."""
    section = network_graph.get_section("MTJ-NY-L1")
    assert section is not None
    assert section.section_id == "MTJ-NY-L1"
    assert section.corridor_id == "COR-NCR-01"
    assert section.electrified is True
    assert section.tracks >= 2

    # Non-existent section
    assert network_graph.get_section("INVALID-SECTION") is None


def test_adjacent_sections_lookup():
    """4. Bidirectional adjacency graph lookups."""
    neighbors_mtj = [s.section_id for s in network_graph.get_neighboring_sections("MTJ-NY-L1")]
    assert "NDLS-GZB-L3" in neighbors_mtj
    assert "AGC-TDL-UP" in neighbors_mtj

    neighbors_ndls = [s.section_id for s in network_graph.get_neighboring_sections("NDLS-GZB-L3")]
    assert "MTJ-NY-L1" in neighbors_ndls


def test_network_path_finding():
    """5. Network path finding across corridors via junction."""
    # From NDLS-GZB-L3 to CNB-WY-L4 via AGC-TDL-UP junction
    path = network_graph.find_path("NDLS-GZB-L3", "CNB-WY-L4")
    assert path is not None
    assert path[0] == "NDLS-GZB-L3"
    assert path[-1] == "CNB-WY-L4"
    assert "MTJ-NY-L1" in path
    assert "AGC-TDL-UP" in path

    # Same section path
    assert network_graph.find_path("MTJ-NY-L1", "MTJ-NY-L1") == ["MTJ-NY-L1"]

    # Non-connected or non-existent section
    assert network_graph.find_path("MTJ-NY-L1", "NON-EXISTENT") is None


def test_same_section_conflict_detection():
    """6. Same-section conflict detection between task and train."""
    cor_id, sec_id = network_graph.map_task_to_network({
        "section_code": "MTJ-NY-L1",
        "location": "Mathura Junction North Yard (KM 142-145)"
    })
    assert sec_id == "MTJ-NY-L1"
    assert cor_id == "COR-NCR-01"

    # Verify impact calculation identifies conflicting tasks on that section
    req = NetworkImpactRequest(
        section_id="MTJ-NY-L1",
        start_time="2026-09-28T04:00:00Z",
        end_time="2026-09-28T06:00:00Z",
        include_adjacent=False,
    )
    impact = network_sync_service.calculate_impact(
        req=req,
        tasks=INITIAL_MAINTENANCE_TASKS,
        train_movements=TRAIN_MOVEMENTS,
        block_plans=REGENERATED_BLOCK_PLANS,
    )
    assert impact.section_id == "MTJ-NY-L1"
    assert impact.total_impacted_tasks > 0


def test_adjacent_section_ripple_impact():
    """7. Adjacent section ripple impact within specified hops."""
    req = NetworkImpactRequest(
        section_id="MTJ-NY-L1",
        start_time="2026-09-28T04:00:00Z",
        end_time="2026-09-28T06:00:00Z",
        include_adjacent=True,
    )
    impact = network_sync_service.calculate_impact(
        req=req,
        tasks=INITIAL_MAINTENANCE_TASKS,
        train_movements=TRAIN_MOVEMENTS,
        block_plans=REGENERATED_BLOCK_PLANS,
    )
    adjacent_ids = [s.section_id for s in impact.adjacent_sections]
    assert "NDLS-GZB-L3" in adjacent_ids
    assert "AGC-TDL-UP" in adjacent_ids


def test_independent_corridors_non_conflict():
    """8. Independent corridor sections do not create spurious ripple impacts."""
    req = NetworkImpactRequest(
        section_id="CNB-LKO-D1",
        start_time="2026-09-28T04:00:00Z",
        end_time="2026-09-28T06:00:00Z",
        include_adjacent=True,
    )
    impact = network_sync_service.calculate_impact(
        req=req,
        tasks=INITIAL_MAINTENANCE_TASKS,
        train_movements=TRAIN_MOVEMENTS,
        block_plans=REGENERATED_BLOCK_PLANS,
    )
    adjacent_ids = [s.section_id for s in impact.adjacent_sections]
    assert "NDLS-GZB-L3" not in adjacent_ids
    assert "MTJ-NY-L1" not in adjacent_ids


def test_network_impact_api_endpoint(client):
    """9. POST /api/network/impact returns correct HTTP 200 and schema."""
    payload = {
        "section_id": "AGC-TDL-UP",
        "start_time": "2026-09-28T04:00:00Z",
        "end_time": "2026-09-28T06:00:00Z",
        "include_adjacent": True,
    }
    resp = client.post("/api/network/impact", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["section_id"] == "AGC-TDL-UP"
    assert "adjacent_sections" in data
    assert "total_impacted_tasks" in data
    assert "total_impacted_trains" in data


def test_emergency_blockage_network_integration():
    """10. Scenario engine emergency blockage disruption with corridor_id/section_id."""
    engine = ScenarioEngine()
    req = ScenarioCreateRequest(
        name="Network Blockage Test",
        description="Testing emergency blockage with section_id",
        disruptions=[
            EmergencyBlockageDisruption(
                type="emergency_blockage",
                section_code="MTJ-NY-L1",
                corridor_id="COR-NCR-01",
                section_id="MTJ-NY-L1",
                location="Mathura Junction North Yard (KM 142-145)",
                start_time="2026-09-28T04:00:00Z",
                end_time="2026-09-28T06:00:00Z",
            )
        ],
    )
    scenario = engine.create_scenario(req)
    assert scenario.status == "CREATED"
    comparison = engine.run_scenario(
        scenario.scenario_id,
        INITIAL_MAINTENANCE_TASKS,
        TRAIN_MOVEMENTS,
        REGENERATED_BLOCK_PLANS,
    )
    assert comparison is not None
    assert comparison.tasks_scheduled_scenario >= 0
    saved = engine.get_scenario(scenario.scenario_id)
    assert saved is not None
    assert len(saved.disruptions) == 1
    assert saved.disruptions[0]["section_id"] == "MTJ-NY-L1"
    assert saved.disruptions[0]["corridor_id"] == "COR-NCR-01"


def test_base_data_immutability_under_network_operations(client):
    """11. Base datasets remain untouched after network API calls and scenario executions."""
    initial_tasks_copy = copy.deepcopy(INITIAL_MAINTENANCE_TASKS)
    initial_trains_copy = copy.deepcopy(TRAIN_MOVEMENTS)
    initial_plans_copy = copy.deepcopy(REGENERATED_BLOCK_PLANS)

    # Invoke network endpoints
    client.get("/api/network")
    client.get("/api/network/corridors/COR-NCR-01")
    client.get("/api/network/sections/MTJ-NY-L1")
    client.post(
        "/api/network/impact",
        json={
            "section_id": "MTJ-NY-L1",
            "start_time": "2026-09-28T04:00:00Z",
            "end_time": "2026-09-28T06:00:00Z",
            "include_adjacent": True,
        },
    )

    # Verify in-memory datasets are bitwise identical
    assert INITIAL_MAINTENANCE_TASKS == initial_tasks_copy
    assert TRAIN_MOVEMENTS == initial_trains_copy
    assert REGENERATED_BLOCK_PLANS == initial_plans_copy


def test_health_endpoint(client):
    """12. GET /api/health returns healthy status and system metrics."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "environment" in body
    assert "scheduler" in body
    assert "fallback_available" in body
    assert body["fallback_available"] is True
