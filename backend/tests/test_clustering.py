from services.clustering import cluster_tasks, DeterministicClusterer


def test_clustering_location_and_department():
    """Verify tasks are deterministically grouped by location -> department -> tasks."""
    tasks = [
        {"id": "T1", "location": "Mumbai", "department": "Electrical", "desc": "Wire fix"},
        {"id": "T2", "location": "Mumbai", "department": "Mechanical", "desc": "Wheel lathe"},
        {"id": "T3", "location": "Mumbai", "department": "Electrical", "desc": "Transformer check"},
        {"id": "T4", "location": "Delhi", "department": "Civil", "desc": "Track alignment"},
        {"id": "T5", "location": "Delhi", "department": "Civil", "desc": "Bridge test"},
    ]

    grouped = cluster_tasks(tasks)

    # Location grouping check
    assert "Mumbai" in grouped
    assert "Delhi" in grouped
    assert len(grouped.keys()) == 2

    # Department grouping under Mumbai
    assert "Electrical" in grouped["Mumbai"]
    assert "Mechanical" in grouped["Mumbai"]
    assert len(grouped["Mumbai"]["Electrical"]) == 2
    assert len(grouped["Mumbai"]["Mechanical"]) == 1

    # Department grouping under Delhi
    assert "Civil" in grouped["Delhi"]
    assert len(grouped["Delhi"]["Civil"]) == 2

    # Confirm task items preserved
    mumbai_elec_ids = [t["id"] for t in grouped["Mumbai"]["Electrical"]]
    assert "T1" in mumbai_elec_ids
    assert "T3" in mumbai_elec_ids


def test_clustering_missing_location_and_department():
    """Verify fallback handling when location or department is missing/None/empty."""
    tasks = [
        {"id": "T_NO_LOC", "department": "Signaling"},
        {"id": "T_NO_DEPT", "location": "Kolkata"},
        {"id": "T_EMPTY", "location": "   ", "department": ""},
    ]

    grouped = cluster_tasks(tasks)

    # T_NO_LOC defaults to Unknown location
    assert "Unknown" in grouped
    assert "Signaling" in grouped["Unknown"]
    assert grouped["Unknown"]["Signaling"][0]["id"] == "T_NO_LOC"

    # T_NO_DEPT defaults to General department under Kolkata
    assert "Kolkata" in grouped
    assert "General" in grouped["Kolkata"]
    assert grouped["Kolkata"]["General"][0]["id"] == "T_NO_DEPT"

    # T_EMPTY defaults to Unknown location and General department
    assert "General" in grouped["Unknown"]
    assert any(t["id"] == "T_EMPTY" for t in grouped["Unknown"]["General"])


def test_clustering_empty_tasks():
    """Verify empty input returns empty dictionary."""
    assert cluster_tasks([]) == {}
    assert cluster_tasks(None) == {}


def test_custom_clusterer_extension():
    """Verify that a custom clusterer implementation can be plugged into cluster_tasks."""
    class CustomClusterer:
        def cluster(self, tasks):
            return {"CUSTOM_CLUSTER": {"ALL": list(tasks)}}

    tasks = [{"id": "T1"}]
    res = cluster_tasks(tasks, clusterer=CustomClusterer())
    assert "CUSTOM_CLUSTER" in res
    assert res["CUSTOM_CLUSTER"]["ALL"] == tasks
