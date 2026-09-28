from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Resilience-SIH-2026" in data["service"]


def test_get_plan_endpoint():
    # First reset state
    client.post("/api/plan/reset")

    response = client.get("/api/plan")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert isinstance(data["data"], list)
    assert data["total"] == len(data["data"])
    assert data["total"] > 0

    # Verify first plan schema
    first_plan = data["data"][0]
    expected_keys = {"id", "location", "start_time", "end_time", "assigned_tasks", "status", "section_code", "priority"}
    assert expected_keys.issubset(first_plan.keys())


def test_get_conflicts_endpoint():
    # First reset state
    client.post("/api/plan/reset")

    response = client.get("/api/conflicts")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert isinstance(data["data"], list)
    assert data["total"] == len(data["data"])
    assert data["total"] > 0

    # Verify first conflict schema
    first_conflict = data["data"][0]
    expected_keys = {"id", "task", "train", "location", "overlap_start", "overlap_end", "conflict_type", "severity", "impact", "status"}
    assert expected_keys.issubset(first_conflict.keys())


def test_generate_and_reset_plan_flow():
    # Reset
    reset_resp = client.post("/api/plan/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["success"] is True

    # Generate plan
    gen_resp = client.post("/api/plan/generate-plan")
    assert gen_resp.status_code == 200
    gen_data = gen_resp.json()
    assert gen_data["success"] is True
    assert "conflicts_resolved" in gen_data
    assert "optimization_score" in gen_data
    assert "generated_at" in gen_data

    # Check conflicts after generation (should be 0)
    conflicts_resp = client.get("/api/conflicts")
    assert conflicts_resp.status_code == 200
    assert conflicts_resp.json()["total"] == 0

    # Reset again
    reset_resp2 = client.post("/api/plan/reset")
    assert reset_resp2.status_code == 200

    # Check conflicts restored
    conflicts_resp2 = client.get("/api/conflicts")
    assert conflicts_resp2.status_code == 200
    assert conflicts_resp2.json()["total"] > 0


def test_get_prioritized_tasks_endpoint():
    response = client.get("/api/prioritized-tasks")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "total" in data
    assert data["total"] == len(data["data"])
    assert data["total"] > 0

    # Verify descending priority sort
    scores = [task["priority_score"] for task in data["data"]]
    assert scores == sorted(scores, reverse=True)

    # Verify task fields
    first_task = data["data"][0]
    expected_fields = {
        "id", "title", "location", "department", "duration_hours",
        "criticality", "safety", "overdue", "train_impact", "asset_impact",
        "priority_score", "status"
    }
    assert expected_fields.issubset(first_task.keys())

    # Verify grouped clustering
    assert "grouped" in data
    grouped = data["grouped"]
    assert isinstance(grouped, dict)
    assert len(grouped.keys()) > 0
    # Check that location contains department dicts
    for loc, depts in grouped.items():
        assert isinstance(depts, dict)
        for dept, tasks in depts.items():
            assert isinstance(tasks, list)
            assert len(tasks) > 0
