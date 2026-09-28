"""
RAILOPT Phase 2A – Constraint Engine Tests.

IMPORTANT: All data is synthetic and created for testing only.
These tests do NOT represent actual Indian Railways operational rules.

Covers:
1.  Feasible candidate
2.  Train conflict
3.  Resource conflict – crew unavailable
4.  Machine unavailable
5.  TRD power-block mismatch
6.  S&T dependency mismatch (insufficient window)
7.  RRI/Yard conflict
8.  Insufficient block duration
9.  Mandatory safety constraint violated (context override)
10. Missing task data
11. Missing block window data
12. Multiple simultaneous violations
13. Feasible with warnings
14. Multi-department compatible tasks
15. Multi-department incompatible tasks
16. Candidate window generation
"""
import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal, init_db
from app.models import (
    Department, DepartmentEnum, Zone, Division, Corridor, Station, Asset,
    MaintenanceTask, BlockWindow, BlockStatusEnum, CriticalityEnum, TaskStatusEnum,
    Train, TrainTypeEnum, TrainMovement, Resource, ResourceTypeEnum, ResourceStatusEnum,
    Crew, Machine, SafetyConstraint, PowerBlockRequirement, SNTDependency, RRIConstraint
)
from app.constraints.engine import RailwayConstraintEngine, constraint_engine
from app.constraints.models import FeasibilityStatusEnum, ConstraintSeverityEnum
from app.constraints.compatibility import compatibility_evaluator
from app.constraints.candidate_generator import candidate_window_generator


# ------------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------------

@pytest.fixture(scope="module")
def db():
    init_db()
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def test_objects(db):
    """Create minimal synthetic domain objects for all constraint tests.

    This fixture is idempotent: it wipes any stale test rows (identified by
    ``T_`` prefixed codes) before inserting fresh ones so the test suite can
    be executed repeatedly against the same persistent SQLite file.
    """

    # ------------------------------------------------------------------ #
    # Teardown helper – delete objects in FK-safe order
    # ------------------------------------------------------------------ #
    def _cleanup():
        try:
            # ---- 1. Deepest leaf tables ----
            # Safety / power / SNT are children of MaintenanceTask
            for code in ["T_TASK_FEASIBLE", "T_TASK_TRD", "T_TASK_SNT",
                         "T_TASK_NO_ASSET", "T_TASK_WRONG_LOC",
                         "T_TASK_BIG_CREW", "T_TASK_CSM", "T_TASK_COMPAT_B"]:
                t = db.query(MaintenanceTask).filter_by(task_id=code).first()
                if t:
                    db.query(SafetyConstraint).filter_by(task_id=t.id).delete()
                    db.query(PowerBlockRequirement).filter_by(task_id=t.id).delete()
                    db.query(SNTDependency).filter_by(task_id=t.id).delete()
                    db.delete(t)
            db.flush()

            # ---- 2. TrainMovements (reference Trains AND BlockWindows) ----
            tr = db.query(Train).filter_by(train_number="T_EXP_999").first()
            if tr:
                db.query(TrainMovement).filter_by(train_id=tr.id).delete()
                db.delete(tr)
            db.flush()

            # ---- 3. BlockWindows + their RRI children ----
            for code in ["T_WIN_OK", "T_WIN_SHORT", "T_WIN_ISOLATED",
                         "T_WIN_CREW_TEST", "T_WIN_MACH_TEST", "T_WIN_TRD_TEST",
                         "T_WIN_SAFETY_TEST", "T_WIN_WARN_TEST",
                         "T_WIN_COMPAT_OK", "T_WIN_INCOMPAT"]:
                w = db.query(BlockWindow).filter_by(window_code=code).first()
                if w:
                    db.query(RRIConstraint).filter_by(block_window_id=w.id).delete()
                    db.delete(w)
            db.flush()

            # ---- 4. Resources (Crew / Machine are children of Resource) ----
            for code in ["T_GANG_01", "T_MACH_TW", "T_MACH_CSM_BUSY"]:
                r = db.query(Resource).filter_by(resource_code=code).first()
                if r:
                    db.query(Crew).filter_by(resource_id=r.id).delete()
                    db.query(Machine).filter_by(resource_id=r.id).delete()
                    db.delete(r)
            db.flush()

            # ---- 5. Geography – deepest to root ----
            # Asset references Station + Corridor → delete before both
            db.query(Asset).filter(Asset.asset_code.like("T_%")).delete(synchronize_session=False)
            db.flush()
            # Station references Corridor → delete before Corridor
            db.query(Station).filter(Station.code.like("T_%")).delete(synchronize_session=False)
            db.flush()
            db.query(Corridor).filter(Corridor.code.like("T_%")).delete(synchronize_session=False)
            db.flush()
            db.query(Division).filter(Division.code.like("T_%")).delete(synchronize_session=False)
            db.flush()
            db.query(Zone).filter(Zone.code.like("T_%")).delete(synchronize_session=False)
            db.flush()
            db.query(Department).filter(Department.code.like("T_%")).delete(synchronize_session=False)
            db.flush()

            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[fixture cleanup warning] {e}")

    # Run cleanup BEFORE setup so stale rows from prior runs are gone
    _cleanup()

    # ------------------------------------------------------------------ #
    # Fresh data setup
    # ------------------------------------------------------------------ #
    dept_engg = Department(code="T_ENGG", name="Test Engineering", type=DepartmentEnum.ENGINEERING)
    dept_trd = Department(code="T_TRD", name="Test TRD", type=DepartmentEnum.TRD)
    dept_snt = Department(code="T_SNT", name="Test S&T", type=DepartmentEnum.S_AND_T)
    db.add_all([dept_engg, dept_trd, dept_snt])
    db.commit()


    zone = Zone(code="T_Z1", name="Test Zone 1")
    db.add(zone)
    db.commit()

    div = Division(zone_id=zone.id, code="T_D1", name="Test Division 1")
    db.add(div)
    db.commit()

    corridor = Corridor(division_id=div.id, code="T_CORR_01", name="Test Corridor A–B",
                        from_station="TA", to_station="TB", distance_km=50.0, max_speed_kmph=110)
    db.add(corridor)
    db.commit()

    station = Station(corridor_id=corridor.id, code="T_STA", name="Test Station A",
                      latitude=20.0, longitude=75.0, line_count=4)
    db.add(station)
    db.commit()

    asset = Asset(station_id=station.id, corridor_id=corridor.id,
                  asset_code="T_TRK_01", asset_type="TRACK",
                  location="T_CORR_01 Km 10-12", condition="DEGRADED", line_number="UP")
    db.add(asset)
    db.commit()

    # Normal block window – long enough (300 min)
    window_ok = BlockWindow(window_code="T_WIN_OK", corridor_id=corridor.id,
                            start_time="22:00", end_time="03:00",
                            duration_minutes=300, maintenance_allowed=True,
                            status=BlockStatusEnum.SCHEDULED)
    # Short block window – only 30 min (too short)
    window_short = BlockWindow(window_code="T_WIN_SHORT", corridor_id=corridor.id,
                               start_time="06:00", end_time="06:30",
                               duration_minutes=30, maintenance_allowed=True,
                               status=BlockStatusEnum.SCHEDULED)
    db.add_all([window_ok, window_short])
    db.commit()

    # A standard Engineering task that should be FEASIBLE
    task_feasible = MaintenanceTask(
        task_id="T_TASK_FEASIBLE",
        asset_id=asset.id,
        department_id=dept_engg.id,
        task_type="TRACK_INSPECTION",
        description="Routine track inspection",
        location="T_CORR_01 Km 10",
        criticality=CriticalityEnum.MEDIUM,
        urgency="NORMAL",
        safety_critical=False,
        overdue=False,
        estimated_duration_minutes=60,
        required_crew_count=4,
        required_machine_type=None,
        status=TaskStatusEnum.PENDING
    )

    # A TRD task needing a power block
    task_trd = MaintenanceTask(
        task_id="T_TASK_TRD",
        asset_id=asset.id,
        department_id=dept_trd.id,
        task_type="OHE_INSPECTION",
        description="OHE catenary inspection",
        location="T_CORR_01 Km 11",
        criticality=CriticalityEnum.HIGH,
        urgency="HIGH",
        safety_critical=True,
        overdue=False,
        estimated_duration_minutes=120,
        required_crew_count=6,
        required_machine_type="TOWER_WAGON",
        status=TaskStatusEnum.PENDING
    )

    # A S&T task needing signal disconnection
    task_snt = MaintenanceTask(
        task_id="T_TASK_SNT",
        asset_id=asset.id,
        department_id=dept_snt.id,
        task_type="POINT_MACHINE_REPAIR",
        description="Point machine repair",
        location="T_CORR_01 Km 10",
        criticality=CriticalityEnum.HIGH,
        urgency="HIGH",
        safety_critical=True,
        overdue=False,
        estimated_duration_minutes=60,
        required_crew_count=3,
        required_machine_type=None,
        status=TaskStatusEnum.PENDING
    )

    # Task with no asset (data quality test)
    task_no_asset = MaintenanceTask(
        task_id="T_TASK_NO_ASSET",
        asset_id=None,
        department_id=dept_engg.id,
        task_type="TRACK_PATROLLING",
        location="T_CORR_01 Km 15",
        criticality=CriticalityEnum.LOW,
        estimated_duration_minutes=30,
        required_crew_count=2,
        status=TaskStatusEnum.PENDING
    )

    # Task in a DIFFERENT corridor (location mismatch)
    task_wrong_location = MaintenanceTask(
        task_id="T_TASK_WRONG_LOC",
        asset_id=None,
        department_id=dept_engg.id,
        task_type="RAIL_FRACTURE_REPAIR",
        location="DIFFERENT_CORR_ZZ Km 55",
        criticality=CriticalityEnum.CRITICAL,
        estimated_duration_minutes=90,
        required_crew_count=8,
        status=TaskStatusEnum.PENDING
    )

    db.add_all([task_feasible, task_trd, task_snt, task_no_asset, task_wrong_location])
    db.commit()

    # Safety constraint on TRD task
    safety_c = SafetyConstraint(
        task_id=task_trd.id,
        constraint_type="TRAFFIC_PROTECTION",
        description="Lookout required for OHE work",
        mandatory=True,
        buffer_duration_minutes=15
    )
    db.add(safety_c)

    # PowerBlockRequirement for TRD task
    pwr_req = PowerBlockRequirement(
        task_id=task_trd.id,
        affected_section="T_CORR_01 UP Track",
        isolation_required=True,
        isolation_duration_minutes=15,
        restoration_duration_minutes=15,
        safety_requirement_description="PTW required"
    )
    db.add(pwr_req)

    # SNTDependency for SNT task – needs 20+20=40 extra minutes
    snt_dep = SNTDependency(
        task_id=task_snt.id,
        equipment="Point Machine T-104",
        affected_route="T_CORR_01 UP Route",
        disconnection_required=True,
        disconnection_duration_minutes=20,
        restoration_duration_minutes=20,
        dependency_description="Signal disconnection memo required"
    )
    db.add(snt_dep)
    db.commit()

    # Train + movement that conflicts with window_ok (22:00-03:00)
    train_conflict = Train(
        train_number="T_EXP_999",
        name="Test Express",
        train_type=TrainTypeEnum.EXPRESS,
        priority=2,
        origin="TA",
        destination="TB"
    )
    db.add(train_conflict)
    db.commit()

    movement_conflict = TrainMovement(
        train_id=train_conflict.id,
        corridor_id=corridor.id,
        scheduled_arrival="22:30",
        scheduled_departure="22:35",
        direction="UP",
        line_number="UP Main",
        status="ON_TIME",
        block_window_id=window_ok.id
    )
    db.add(movement_conflict)
    db.commit()

    # Available crew resource (for feasible task)
    res_crew = Resource(
        resource_code="T_GANG_01",
        name="Test Track Gang 01",
        type=ResourceTypeEnum.CREW,
        status=ResourceStatusEnum.AVAILABLE,
        current_location="T_CORR_01",
        capacity=10
    )
    db.add(res_crew)
    db.commit()

    crew = Crew(
        resource_id=res_crew.id,
        department_id=dept_engg.id,
        gang_code="T-GANG-01",
        size=10,
        supervisor_name="Test Supervisor"
    )
    db.add(crew)
    db.commit()

    # Machine: TOWER_WAGON available
    res_mach = Resource(
        resource_code="T_MACH_TW",
        name="Test Tower Wagon 01",
        type=ResourceTypeEnum.MACHINE,
        status=ResourceStatusEnum.AVAILABLE,
        current_location="T_CORR_01",
        capacity=1
    )
    db.add(res_mach)
    db.commit()

    machine = Machine(
        resource_id=res_mach.id,
        machine_type="TOWER_WAGON",
        home_shed="Test Depot",
        max_output_per_hour="N/A"
    )
    db.add(machine)
    db.commit()

    # Machine: CSM but BUSY
    res_csm_busy = Resource(
        resource_code="T_MACH_CSM_BUSY",
        name="Test CSM (Busy)",
        type=ResourceTypeEnum.MACHINE,
        status=ResourceStatusEnum.BUSY,
        current_location="OTHER_YARD",
        capacity=1
    )
    db.add(res_csm_busy)
    db.commit()

    machine_busy = Machine(
        resource_id=res_csm_busy.id,
        machine_type="CSM",
        home_shed="Other Depot",
        max_output_per_hour="1.0 km/h"
    )
    db.add(machine_busy)
    db.commit()

    # RRI constraint on window_ok
    rri = RRIConstraint(
        block_window_id=window_ok.id,
        location="T Station Yard",
        route="T_CORR_01 UP",
        conflicting_movement="Loco reversal at 22:15",
        restriction_type="YARD_LINE_BLOCKED",
        active_time_window="22:00-23:00",
        description="Yard line blocked for loco reversal"
    )
    db.add(rri)
    db.commit()

    return {
        "dept_engg": dept_engg,
        "dept_trd": dept_trd,
        "dept_snt": dept_snt,
        "corridor": corridor,
        "station": station,
        "asset": asset,
        "window_ok": window_ok,
        "window_short": window_short,
        "task_feasible": task_feasible,
        "task_trd": task_trd,
        "task_snt": task_snt,
        "task_no_asset": task_no_asset,
        "task_wrong_location": task_wrong_location,
        "train_conflict": train_conflict,
        "movement_conflict": movement_conflict,
        "rri": rri,
    }


# ------------------------------------------------------------------
# Helper
# ------------------------------------------------------------------

def engine_for_test():
    """Return a fresh engine instance (no side effects)."""
    return RailwayConstraintEngine()


# ==================================================================
# 1. Feasible candidate
# ==================================================================
def test_01_feasible_candidate(test_objects, db):
    """A properly configured task with sufficient window and no conflicts should be FEASIBLE or FEASIBLE_WITH_WARNINGS."""
    task = test_objects["task_feasible"]
    # Use a DIFFERENT window that has NO train/RRI conflicts
    # window_ok has RRI + train conflict injected; create an isolated one
    isolated_window = BlockWindow(
        window_code="T_WIN_ISOLATED",
        corridor_id=test_objects["corridor"].id,
        start_time="02:00",
        end_time="05:00",
        duration_minutes=180,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    result = engine_for_test().check_candidate(task, isolated_window, db)
    assert result.feasible is True, f"Expected FEASIBLE but got {result.status}: {[v.message for v in result.violations]}"

    # Cleanup
    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 2. Train conflict
# ==================================================================
def test_02_train_conflict_detected(test_objects, db):
    """window_ok has a train movement at 22:30 – should produce TRAIN_CONFLICT violation."""
    task = test_objects["task_feasible"]
    window = test_objects["window_ok"]

    result = engine_for_test().check_candidate(task, window, db)
    conflict_codes = [v.constraint_code for v in result.violations + result.warnings]
    assert any("TRAIN" in c for c in conflict_codes), (
        f"Expected TRAIN conflict but got violations: {conflict_codes}"
    )


# ==================================================================
# 3. Resource conflict – crew unavailable (task requires 50 crew)
# ==================================================================
def test_03_crew_unavailable(test_objects, db):
    """A task requiring 50 crew when only 10 capacity exists should flag INSUFFICIENT_CREW."""
    # Create an isolated window with no train/RRI conflicts
    isolated_window = BlockWindow(
        window_code="T_WIN_CREW_TEST",
        corridor_id=test_objects["corridor"].id,
        start_time="03:30",
        end_time="05:00",
        duration_minutes=90,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    # Create task requiring 50 crew
    big_task = MaintenanceTask(
        task_id="T_TASK_BIG_CREW",
        asset_id=test_objects["asset"].id,
        department_id=test_objects["dept_engg"].id,
        task_type="MAJOR_TRACK_RENEWAL",
        location="T_CORR_01 Km 10",
        criticality=CriticalityEnum.HIGH,
        estimated_duration_minutes=60,
        required_crew_count=50,
        status=TaskStatusEnum.PENDING
    )
    db.add(big_task)
    db.commit()

    result = engine_for_test().check_candidate(big_task, isolated_window, db)
    crew_codes = [v.constraint_code for v in result.violations + result.warnings]
    assert any("CREW" in c for c in crew_codes), f"Expected INSUFFICIENT_CREW but got: {crew_codes}"

    # Cleanup
    db.delete(big_task)
    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 4. Machine unavailable (task requires CSM, only BUSY CSM exists)
# ==================================================================
def test_04_machine_unavailable(test_objects, db):
    """Task requiring CSM (only BUSY one available) should flag MACHINE_UNAVAILABLE."""
    isolated_window = BlockWindow(
        window_code="T_WIN_MACH_TEST",
        corridor_id=test_objects["corridor"].id,
        start_time="04:00",
        end_time="06:00",
        duration_minutes=120,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    task_csm = MaintenanceTask(
        task_id="T_TASK_CSM",
        asset_id=test_objects["asset"].id,
        department_id=test_objects["dept_engg"].id,
        task_type="TRACK_TAMPING",
        location="T_CORR_01 Km 10",
        criticality=CriticalityEnum.HIGH,
        estimated_duration_minutes=90,
        required_crew_count=3,
        required_machine_type="CSM",
        status=TaskStatusEnum.PENDING
    )
    db.add(task_csm)
    db.commit()
    db.refresh(task_csm)

    # Mark ALL CSM resources BUSY so the validator finds zero available CSMs.
    # This ensures we test the MACHINE_UNAVAILABLE path regardless of seed data.
    csm_resources = (
        db.query(Resource)
        .join(Machine, Machine.resource_id == Resource.id)
        .filter(Machine.machine_type == "CSM")
        .all()
    )
    original_statuses = {r.id: r.status for r in csm_resources}
    for r in csm_resources:
        r.status = ResourceStatusEnum.BUSY
    db.commit()

    try:
        result = engine_for_test().check_candidate(task_csm, isolated_window, db)
        machine_codes = [v.constraint_code for v in result.violations + result.warnings]
        assert any("MACHINE" in c for c in machine_codes), (
            f"Expected MACHINE_UNAVAILABLE but got codes: {machine_codes}. "
            f"All violations: {[v.constraint_code for v in result.violations]}, "
            f"warnings: {[v.constraint_code for v in result.warnings]}"
        )
    finally:
        # Restore original statuses
        for r in csm_resources:
            db.refresh(r)
            r.status = original_statuses[r.id]
        db.commit()
        # Cleanup test objects
        db.refresh(task_csm)
        db.delete(task_csm)
        db.refresh(isolated_window)
        db.delete(isolated_window)
        db.commit()


# ==================================================================
# 5. TRD power-block context mismatch
# ==================================================================
def test_05_trd_power_block_unsupported(test_objects, db):
    """TRD task with power block requirement, context says no power isolation supported."""
    isolated_window = BlockWindow(
        window_code="T_WIN_TRD_TEST",
        corridor_id=test_objects["corridor"].id,
        start_time="01:00",
        end_time="04:00",
        duration_minutes=180,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    task = test_objects["task_trd"]
    result = engine_for_test().check_candidate(task, isolated_window, db, context={"supports_power_isolation": False})

    trd_codes = [v.constraint_code for v in result.violations]
    assert any("TRD" in c for c in trd_codes), f"Expected TRD_POWER violation but got: {trd_codes}"

    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 6. S&T dependency – window too short
# ==================================================================
def test_06_snt_dependency_timeout(test_objects, db):
    """S&T task with 60m work + 40m S&T overhead = 100m total; 30m window should fail."""
    task = test_objects["task_snt"]
    window_short = test_objects["window_short"]

    result = engine_for_test().check_candidate(task, window_short, db)
    snt_codes = [v.constraint_code for v in result.violations]
    assert "SNT_DISCONNECTION_TIMEOUT" in snt_codes, f"Expected SNT_DISCONNECTION_TIMEOUT but got: {snt_codes}"


# ==================================================================
# 7. RRI / Yard conflict
# ==================================================================
def test_07_rri_yard_conflict(test_objects, db):
    """window_ok has a YARD_LINE_BLOCKED RRI constraint – should flag as ERROR."""
    task = test_objects["task_feasible"]
    window = test_objects["window_ok"]

    result = engine_for_test().check_candidate(task, window, db)
    rri_codes = [v.constraint_code for v in result.violations + result.warnings]
    assert any("RRI" in c for c in rri_codes), f"Expected RRI violation but got: {rri_codes}"


# ==================================================================
# 8. Insufficient block duration
# ==================================================================
def test_08_insufficient_block_duration(test_objects, db):
    """Short 30m window vs 60m task + safety/prep buffers should flag BLOCK_DURATION_INSUFFICIENT."""
    task = test_objects["task_feasible"]
    window_short = test_objects["window_short"]

    result = engine_for_test().check_candidate(task, window_short, db)
    dur_codes = [v.constraint_code for v in result.violations]
    assert "BLOCK_DURATION_INSUFFICIENT" in dur_codes, (
        f"Expected BLOCK_DURATION_INSUFFICIENT but got violations: {dur_codes}"
    )


# ==================================================================
# 9. Mandatory safety constraint context violation
# ==================================================================
def test_09_safety_constraint_violation(test_objects, db):
    """Passing context flag no_traffic_protection=True should trigger SAFETY error."""
    isolated_window = BlockWindow(
        window_code="T_WIN_SAFETY_TEST",
        corridor_id=test_objects["corridor"].id,
        start_time="01:00",
        end_time="05:00",
        duration_minutes=240,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    task = test_objects["task_trd"]
    result = engine_for_test().check_candidate(task, isolated_window, db, context={"no_traffic_protection": True})

    safety_codes = [v.constraint_code for v in result.violations + result.warnings]
    assert any("SAFETY" in c for c in safety_codes), (
        f"Expected SAFETY violation but got: {safety_codes}"
    )

    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 10. Missing task – None input
# ==================================================================
def test_10_missing_task(test_objects, db):
    """Passing None task should produce DATA_QUALITY ERROR."""
    window = test_objects["window_ok"]
    result = engine_for_test().check_candidate(None, window, db)
    assert result.feasible is False
    assert any(v.constraint_code == "DQ_MISSING_TASK" for v in result.violations), (
        f"Expected DQ_MISSING_TASK but got: {[v.constraint_code for v in result.violations]}"
    )


# ==================================================================
# 11. Missing block window – None input
# ==================================================================
def test_11_missing_block_window(test_objects, db):
    """Passing None block window should produce DATA_QUALITY ERROR."""
    task = test_objects["task_feasible"]
    result = engine_for_test().check_candidate(task, None, db)
    assert result.feasible is False
    assert any(v.constraint_code == "DQ_MISSING_BLOCK_WINDOW" for v in result.violations), (
        f"Expected DQ_MISSING_BLOCK_WINDOW but got: {[v.constraint_code for v in result.violations]}"
    )


# ==================================================================
# 12. Multiple simultaneous violations
# ==================================================================
def test_12_multiple_violations(test_objects, db):
    """window_ok causes train conflict + RRI for task_feasible – should have >= 2 violations."""
    task = test_objects["task_feasible"]
    window = test_objects["window_ok"]

    result = engine_for_test().check_candidate(task, window, db)
    all_errors = [v for v in result.violations if v.severity == ConstraintSeverityEnum.ERROR]
    assert len(all_errors) >= 2, (
        f"Expected >= 2 hard violations but got {len(all_errors)}: {[e.constraint_code for e in all_errors]}"
    )


# ==================================================================
# 13. Feasible with warnings (asset missing – DQ warning only)
# ==================================================================
def test_13_feasible_with_warnings(test_objects, db):
    """task_no_asset should still be feasible but produce DQ warning about missing asset."""
    isolated_window = BlockWindow(
        window_code="T_WIN_WARN_TEST",
        corridor_id=test_objects["corridor"].id,
        start_time="03:00",
        end_time="05:00",
        duration_minutes=120,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    task = test_objects["task_no_asset"]
    result = engine_for_test().check_candidate(task, isolated_window, db, context={"bypass_location_check": True})

    warning_codes = [w.constraint_code for w in result.warnings]
    assert "DQ_MISSING_ASSET" in warning_codes, (
        f"Expected DQ_MISSING_ASSET warning but got warnings: {warning_codes}"
    )

    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 14. Multi-department compatible tasks
# ==================================================================
def test_14_multi_dept_compatible(test_objects, db):
    """Two tasks on the same corridor + sufficient window should be COMPATIBLE."""
    isolated_window = BlockWindow(
        window_code="T_WIN_COMPAT_OK",
        corridor_id=test_objects["corridor"].id,
        start_time="02:00",
        end_time="06:00",
        duration_minutes=240,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    task_a = test_objects["task_feasible"]
    task_b = MaintenanceTask(
        task_id="T_TASK_COMPAT_B",
        asset_id=test_objects["asset"].id,
        department_id=test_objects["dept_engg"].id,
        task_type="TRACK_PAINTING",
        location="T_CORR_01 Km 11",
        criticality=CriticalityEnum.LOW,
        estimated_duration_minutes=40,
        required_crew_count=2,
        status=TaskStatusEnum.PENDING
    )
    db.add(task_b)
    db.commit()

    result = compatibility_evaluator.evaluate_tasks_compatibility([task_a, task_b], isolated_window, db,
                                                                  context={"bypass_location_check": True})
    assert result.compatible is True, f"Expected COMPATIBLE but got reasons: {result.reasons}"

    db.delete(task_b)
    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 15. Multi-department incompatible tasks (wrong corridor)
# ==================================================================
def test_15_multi_dept_incompatible(test_objects, db):
    """Task on wrong corridor + ok window should be INCOMPATIBLE."""
    isolated_window = BlockWindow(
        window_code="T_WIN_INCOMPAT",
        corridor_id=test_objects["corridor"].id,
        start_time="02:00",
        end_time="05:00",
        duration_minutes=180,
        maintenance_allowed=True,
        status=BlockStatusEnum.SCHEDULED
    )
    db.add(isolated_window)
    db.commit()

    wrong_task = test_objects["task_wrong_location"]
    result = compatibility_evaluator.evaluate_tasks_compatibility([wrong_task], isolated_window, db)
    assert result.compatible is False, f"Expected INCOMPATIBLE but got COMPATIBLE with reasons: {result.reasons}"

    db.delete(isolated_window)
    db.commit()


# ==================================================================
# 16. Candidate window generation
# ==================================================================
def test_16_candidate_window_generation(test_objects, db):
    """Candidate generator should return windows matching the task's corridor and duration."""
    task = test_objects["task_feasible"]
    candidates = candidate_window_generator.generate_candidate_windows(task, db)

    assert isinstance(candidates, list), "Expected a list of candidate windows"
    for c in candidates:
        assert c.duration_minutes >= task.estimated_duration_minutes, (
            f"Candidate window {c.window_code} duration {c.duration_minutes} < "
            f"required {task.estimated_duration_minutes}"
        )
