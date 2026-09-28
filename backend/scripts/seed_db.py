import os
import sys
import logging
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal, init_db
from app.models import (
    Department, DepartmentEnum, Zone, Division, Corridor, Station, Asset,
    MaintenanceTask, TaskStatusEnum, CriticalityEnum, BlockRequest, BlockStatusEnum,
    BlockWindow, Train, TrainTypeEnum, TrainMovement, Resource, ResourceTypeEnum,
    ResourceStatusEnum, Crew, Machine, SafetyConstraint, PowerBlockRequirement, SNTDependency
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("railopt.seed")

def seed_database():
    logger.info("Initializing database tables...")
    init_db()
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Zone).first():
            logger.info("Database already contains seed data. Skipping seed process.")
            return

        logger.info("Seeding Indian Railways Synthetic Operational Domain Data...")
        # NOTICE: Synthetic demo data for development/testing only.

        # 1. Departments
        depts = [
            Department(code="ENGG", name="Engineering (Track)", type=DepartmentEnum.ENGINEERING),
            Department(code="TRD", name="Traction Distribution (OHE)", type=DepartmentEnum.TRD),
            Department(code="SNT", name="Signal & Telecommunication", type=DepartmentEnum.S_AND_T),
            Department(code="OPTG", name="Operating", type=DepartmentEnum.OPERATING),
            Department(code="SAFETY", name="Safety", type=DepartmentEnum.SAFETY),
        ]
        db.add_all(depts)
        db.commit()

        engg_dept = db.query(Department).filter_by(code="ENGG").first()
        trd_dept = db.query(Department).filter_by(code="TRD").first()
        snt_dept = db.query(Department).filter_by(code="SNT").first()

        # 2. Zones
        zones = [
            Zone(code="CR", name="Central Railway", headquarters="CSMT Mumbai"),
            Zone(code="WR", name="Western Railway", headquarters="Churchgate Mumbai"),
            Zone(code="NR", name="Northern Railway", headquarters="New Delhi"),
            Zone(code="ECR", name="East Central Railway", headquarters="Hajipur"),
        ]
        db.add_all(zones)
        db.commit()

        cr_zone = db.query(Zone).filter_by(code="CR").first()
        nr_zone = db.query(Zone).filter_by(code="NR").first()

        # 3. Divisions
        divisions = [
            Division(zone_id=cr_zone.id, code="BSL", name="Bhusawal Division"),
            Division(zone_id=cr_zone.id, code="BB", name="Mumbai Division"),
            Division(zone_id=nr_zone.id, code="DLI", name="Delhi Division"),
        ]
        db.add_all(divisions)
        db.commit()

        bsl_div = db.query(Division).filter_by(code="BSL").first()
        dli_div = db.query(Division).filter_by(code="DLI").first()

        # 4. Corridors
        corridors = [
            Corridor(division_id=dli_div.id, code="KNP-04", name="Kanpur-Etawah Section", from_station="CNB", to_station="ETW", distance_km=137.0, max_speed_kmph=130),
            Corridor(division_id=dli_div.id, code="KNP-07", name="Kanpur-Unnao Section", from_station="CNB", to_station="UNO", distance_km=18.0, max_speed_kmph=80),
            Corridor(division_id=bsl_div.id, code="BSL-01", name="Bhusawal-Jalgaon Section", from_station="BSL", to_station="JL", distance_km=24.0, max_speed_kmph=110),
        ]
        db.add_all(corridors)
        db.commit()

        knp04_corr = db.query(Corridor).filter_by(code="KNP-04").first()
        knp07_corr = db.query(Corridor).filter_by(code="KNP-07").first()

        # 5. Stations
        stations = [
            Station(corridor_id=knp04_corr.id, code="CNB", name="Kanpur Central", latitude=26.4542, longitude=80.3500, line_count=10),
            Station(corridor_id=knp04_corr.id, code="ETW", name="Etawah", latitude=26.7769, longitude=79.0239, line_count=4),
            Station(corridor_id=knp07_corr.id, code="UNO", name="Unnao Junction", latitude=26.5393, longitude=80.4878, line_count=5),
        ]
        db.add_all(stations)
        db.commit()

        cnb_stn = db.query(Station).filter_by(code="CNB").first()

        # 6. Assets
        assets = [
            Asset(station_id=cnb_stn.id, corridor_id=knp04_corr.id, asset_code="TRK-KNP-04", asset_type="TRACK", location="Km 1024/10-12 UP Line", condition="DEGRADED", line_number="UP"),
            Asset(station_id=cnb_stn.id, corridor_id=knp07_corr.id, asset_code="SIG-KNP-07", asset_type="SIGNAL", location="Signal S-14 Unnao Yard", condition="DEGRADED", line_number="DN"),
            Asset(station_id=cnb_stn.id, corridor_id=knp04_corr.id, asset_code="OHE-KNP-04", asset_type="OHE", location="Catenary Wire Anchor 45", condition="MAINTENANCE_DUE", line_number="UP"),
        ]
        db.add_all(assets)
        db.commit()

        trk_asset = db.query(Asset).filter_by(asset_code="TRK-KNP-04").first()
        sig_asset = db.query(Asset).filter_by(asset_code="SIG-KNP-07").first()
        ohe_asset = db.query(Asset).filter_by(asset_code="OHE-KNP-04").first()

        # 7. Maintenance Tasks
        now = datetime.utcnow()
        tasks = [
            MaintenanceTask(
                task_id="DEF-T-1042",
                asset_id=trk_asset.id,
                department_id=engg_dept.id,
                task_type="TRACK_GEOMETRY_CORRECTION",
                description="Deep screening and track tamping due to geometry defect",
                location="KNP-04 Km 1024",
                criticality=CriticalityEnum.CRITICAL,
                urgency="HIGH",
                safety_critical=True,
                overdue=True,
                due_date=now - timedelta(days=2),
                estimated_duration_minutes=120,
                required_crew_count=8,
                required_machine_type="CSM",
                status=TaskStatusEnum.PENDING
            ),
            MaintenanceTask(
                task_id="DEF-S-2041",
                asset_id=sig_asset.id,
                department_id=snt_dept.id,
                task_type="POINT_MACHINE_OVERHAUL",
                description="Point machine locking mechanism overhaul",
                location="KNP-07 Unnao Yard",
                criticality=CriticalityEnum.HIGH,
                urgency="HIGH",
                safety_critical=True,
                overdue=False,
                due_date=now + timedelta(days=1),
                estimated_duration_minutes=60,
                required_crew_count=4,
                required_machine_type=None,
                status=TaskStatusEnum.PENDING
            ),
            MaintenanceTask(
                task_id="DEF-O-3012",
                asset_id=ohe_asset.id,
                department_id=trd_dept.id,
                task_type="OHE_CANTILEVER_REPLACEMENT",
                description="OHE Cantilever insulator replacement under power block",
                location="KNP-04 Km 1026",
                criticality=CriticalityEnum.CRITICAL,
                urgency="HIGH",
                safety_critical=True,
                overdue=False,
                due_date=now + timedelta(hours=12),
                estimated_duration_minutes=180,
                required_crew_count=6,
                required_machine_type="TOWER_WAGON",
                status=TaskStatusEnum.PENDING
            )
        ]
        db.add_all(tasks)
        db.commit()

        t1 = db.query(MaintenanceTask).filter_by(task_id="DEF-T-1042").first()
        t2 = db.query(MaintenanceTask).filter_by(task_id="DEF-S-2041").first()
        t3 = db.query(MaintenanceTask).filter_by(task_id="DEF-O-3012").first()

        # 8. Block Requests
        requests = [
            BlockRequest(
                request_id="REQ-ENGG-101",
                task_id=t1.id,
                department_id=engg_dept.id,
                requested_start=now + timedelta(hours=4),
                requested_end=now + timedelta(hours=6),
                requested_duration_minutes=120,
                block_type="INTEGRATED_CORRIDOR",
                power_block_required=False,
                signal_disconnection_required=False,
                status=BlockStatusEnum.REQUESTED,
                priority="HIGH",
                remarks="Urgent track tamping required"
            ),
            BlockRequest(
                request_id="REQ-TRD-102",
                task_id=t3.id,
                department_id=trd_dept.id,
                requested_start=now + timedelta(hours=4),
                requested_end=now + timedelta(hours=7),
                requested_duration_minutes=180,
                block_type="POWER_AND_TRAFFIC",
                power_block_required=True,
                signal_disconnection_required=False,
                status=BlockStatusEnum.REQUESTED,
                priority="CRITICAL",
                remarks="Requires OHE power shut off"
            )
        ]
        db.add_all(requests)
        db.commit()

        # 9. Block Windows
        windows = [
            BlockWindow(
                window_code="WIN-KNP04-NIGHT",
                corridor_id=knp04_corr.id,
                start_time="22:00",
                end_time="03:00",
                duration_minutes=300,
                maintenance_allowed=True,
                status=BlockStatusEnum.SCHEDULED
            ),
            BlockWindow(
                window_code="WIN-KNP07-NIGHT",
                corridor_id=knp07_corr.id,
                start_time="00:30",
                end_time="04:30",
                duration_minutes=240,
                maintenance_allowed=True,
                status=BlockStatusEnum.SCHEDULED
            )
        ]
        db.add_all(windows)
        db.commit()

        # 10. Trains & Movements
        trains = [
            Train(train_number="12904", name="Golden Temple Mail", train_type=TrainTypeEnum.EXPRESS, priority=2, origin="NZM", destination="MMCT"),
            Train(train_number="12311", name="Netaji Express", train_type=TrainTypeEnum.EXPRESS, priority=2, origin="HWH", destination="KLK"),
            Train(train_number="G/7821", name="Coal Rake Freight", train_type=TrainTypeEnum.FREIGHT, priority=4, origin="DHN", destination="NDLS"),
        ]
        db.add_all(trains)
        db.commit()

        tr1 = db.query(Train).filter_by(train_number="12904").first()
        tr2 = db.query(Train).filter_by(train_number="12311").first()

        w1 = db.query(BlockWindow).filter_by(window_code="WIN-KNP04-NIGHT").first()

        movements = [
            TrainMovement(train_id=tr1.id, corridor_id=knp04_corr.id, station_id=cnb_stn.id, scheduled_arrival="22:00", scheduled_departure="22:15", direction="UP", line_number="UP Main", status="ON_TIME", block_window_id=w1.id),
            TrainMovement(train_id=tr2.id, corridor_id=knp07_corr.id, station_id=cnb_stn.id, scheduled_arrival="23:50", scheduled_departure="23:55", direction="DOWN", line_number="DN Main", status="DELAYED", delay_minutes=25),
        ]
        db.add_all(movements)
        db.commit()

        # 11. Resources (Crews & Machines)
        res_crew = Resource(resource_code="GANG-ENGG-04", name="Senior Track Gang CNB-04", type=ResourceTypeEnum.CREW, status=ResourceStatusEnum.AVAILABLE, current_location="Kanpur Central", capacity=10)
        res_mach = Resource(resource_code="MACH-CSM-901", name="Continuous Surface Tamper CSM-901", type=ResourceTypeEnum.MACHINE, status=ResourceStatusEnum.AVAILABLE, current_location="Etawah Yard", capacity=1)

        db.add_all([res_crew, res_mach])
        db.commit()

        crew = Crew(resource_id=res_crew.id, department_id=engg_dept.id, gang_code="GANG-04", size=10, supervisor_name="S. K. Sharma")
        machine = Machine(resource_id=res_mach.id, machine_type="CSM", home_shed="Kanpur Depot", max_output_per_hour="1.2 km/h")
        db.add_all([crew, machine])
        db.commit()

        # 12. Safety & Dependencies
        safety_c = SafetyConstraint(task_id=t1.id, constraint_type="TRAFFIC_PROTECTION", description="Lookout man and banner flag protection required", mandatory=True, buffer_duration_minutes=15)
        pwr_req = PowerBlockRequirement(task_id=t3.id, affected_section="KNP-04 UP Track", isolation_required=True, isolation_duration_minutes=15, restoration_duration_minutes=15, safety_requirement_description="Permit to Work (PTW) required from TPC")
        snt_dep = SNTDependency(task_id=t2.id, equipment="Point Machine 104-B", affected_route="Unnao Up Main Route", disconnection_required=True, disconnection_duration_minutes=20, restoration_duration_minutes=20, dependency_description="Signal disconnection memo to be issued by ESM")

        db.add_all([safety_c, pwr_req, snt_dep])
        db.commit()

        logger.info("Database seeding completed successfully! All domain objects created.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
