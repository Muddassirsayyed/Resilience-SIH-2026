import os
import sys
import pytest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal, init_db
from app.models import (
    Zone, Division, Corridor, Station, Asset, Department, DepartmentEnum,
    MaintenanceTask, TaskStatusEnum, CriticalityEnum, Train, TrainTypeEnum,
    Resource, ResourceTypeEnum, ResourceStatusEnum
)

@pytest.fixture(scope="module")
def db_session():
    init_db()
    session = SessionLocal()
    yield session
    session.close()

def test_database_connection(db_session):
    """Test that database session can execute raw query."""
    result = db_session.execute(Zone.__table__.select()).fetchall()
    assert result is not None

def test_department_model_crud(db_session):
    """Test CRUD operations on Department model."""
    test_dept = Department(
        code="TEST_DEPT",
        name="Test Department",
        type=DepartmentEnum.SAFETY
    )
    db_session.add(test_dept)
    db_session.commit()

    fetched = db_session.query(Department).filter_by(code="TEST_DEPT").first()
    assert fetched is not None
    assert fetched.name == "Test Department"

    # Cleanup
    db_session.delete(fetched)
    db_session.commit()

def test_foreign_key_relationships(db_session):
    """Test Zone -> Division -> Corridor relationships."""
    zone = Zone(code="TEST_Z", name="Test Zone")
    db_session.add(zone)
    db_session.commit()

    div = Division(zone_id=zone.id, code="TEST_DIV", name="Test Division")
    db_session.add(div)
    db_session.commit()

    corridor = Corridor(division_id=div.id, code="TEST_CORR", name="Test Corridor")
    db_session.add(corridor)
    db_session.commit()

    # Query via relationship
    fetched_zone = db_session.query(Zone).filter_by(code="TEST_Z").first()
    assert len(fetched_zone.divisions) == 1
    assert fetched_zone.divisions[0].code == "TEST_DIV"

    # Cleanup
    db_session.delete(zone)
    db_session.commit()

def test_maintenance_task_creation(db_session):
    """Test creating a MaintenanceTask."""
    dept = db_session.query(Department).first()
    if not dept:
        dept = Department(code="TEST_ENGG", name="Test Engg", type=DepartmentEnum.ENGINEERING)
        db_session.add(dept)
        db_session.commit()

    task = MaintenanceTask(
        task_id="TEST-TASK-001",
        department_id=dept.id,
        task_type="RAIL_FRACTURE_REPAIR",
        criticality=CriticalityEnum.CRITICAL,
        estimated_duration_minutes=90,
        status=TaskStatusEnum.PENDING
    )
    db_session.add(task)
    db_session.commit()

    fetched = db_session.query(MaintenanceTask).filter_by(task_id="TEST-TASK-001").first()
    assert fetched is not None
    assert fetched.estimated_duration_minutes == 90
    assert fetched.criticality == CriticalityEnum.CRITICAL

    # Cleanup
    db_session.delete(fetched)
    db_session.commit()
