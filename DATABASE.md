# RAILOPT Relational Database Architecture

## 1. Overview
RAILOPT uses a scalable, production-grade relational database architecture (SQLAlchemy 2.x + PostgreSQL with SQLite dev fallback) designed for Indian Railways operations across zones, divisions, and corridors.

The schema strictly separates:
- **Geography & Asset Inventory**: Zones, Divisions, Corridors, Stations, Assets.
- **Maintenance Operations**: Maintenance Tasks, Block Requests, Block Windows, Block Allocations.
- **Train Traffic**: Trains, Train Movements.
- **Resources**: Resource, Crew, Machine rosters and allocations.
- **Safety & Hard Constraints**: Safety Constraints, Power Block Requirements (TRD), S&T Dependencies, RRI/Yard Constraints.
- **Optimization Output**: Optimization Runs, Plan proposals (Plan A, Plan B, Plan C), Plan Tasks.
- **Governance & Audit**: Dynamic Replanning Events, Approvals, Audit Logs.

---

## 2. Entity-Relationship Overview

```
Zone (1) ----> (*) Division (1) ----> (*) Corridor (1) ----> (*) Station (1) ----> (*) Asset
                                           |                                           |
                                           v                                           v
                                      BlockWindow                               MaintenanceTask
                                           |                                    /      |      \
                                           v                                   /       |       \
                                    TrainMovement                 BlockRequest   Safety  ResourceAllocation
                                                                       |
                                                                       v
                                                                BlockAllocation
```

---

## 3. Database Table Matrix

| Table Name | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|
| `zones` | `id` | - | Indian Railways Zonal Railway administrative units (CR, WR, NR, ECR, etc.) |
| `divisions` | `id` | `zone_id` | Zonal division administrative boundaries (BSL, BB, DLI, etc.) |
| `corridors` | `id` | `division_id` | Operational track corridors connecting stations |
| `stations` | `id` | `corridor_id` | Stations, yards, and junction locations |
| `assets` | `id` | `station_id`, `corridor_id` | Track sections, signals, OHE catenary, points, bridges |
| `departments` | `id` | - | Engineering, TRD, S&T, Operating, Safety departments |
| `maintenance_tasks` | `id` | `asset_id`, `department_id` | Defect and preventive maintenance task records |
| `block_requests` | `id` | `task_id`, `department_id` | Departmental requests for corridor block possession |
| `block_windows` | `id` | `corridor_id` | Available traffic block time windows |
| `block_allocations` | `id` | `block_request_id`, `block_window_id` | Assigned block windows for requested maintenance tasks |
| `trains` | `id` | - | Scheduled trains (Rajdhani, Express, Goods, Special) |
| `train_movements` | `id` | `train_id`, `corridor_id`, `station_id` | Sectional train arrival/departure timestamps |
| `resources` | `id` | - | Gangs, track machines, tower wagons, equipment |
| `crews` | `id` | `resource_id`, `department_id` | Maintenance gang size and supervisor rosters |
| `machines` | `id` | `resource_id` | Heavy track machinery (BCM, CSM, UNIMAT, Tower Wagon) |
| `resource_allocations` | `id` | `resource_id`, `task_id` | Resource assignments to maintenance tasks |
| `safety_constraints` | `id` | `task_id` | Traffic protection and speed restriction rules |
| `power_block_requirements` | `id` | `task_id` | TRD OHE power isolation and PTW requirements |
| `snt_dependencies` | `id` | `task_id` | Signal disconnection memos and point machine isolation |
| `rri_constraints` | `id` | `block_window_id` | Route Relay Interlocking & yard line locking rules |
| `optimization_runs` | `id` | - | Historical optimization run executions |
| `plans` | `id` | `optimization_run_id` | Solver generated plans (Plan A: Max Yield, Plan B: Min Delay, Plan C: Balanced) |
| `plan_tasks` | `id` | `plan_id`, `task_id` | Individual task schedules within a specific proposal plan |
| `replanning_events` | `id` | `affected_task_id`, `affected_train_id` | Operational disruption events triggering dynamic re-solves |
| `approvals` | `id` | `plan_id` | Controller sign-off, approval decisions, and digital signatures |
| `audit_logs` | `id` | - | Immutable audit trail for human actions and safety decisions |

---

## 4. Migration & Management Commands

### Run Database Initial Migration
```bash
cd backend
alembic upgrade head
```

### Autogenerate Migration after Model Changes
```bash
cd backend
alembic revision --autogenerate -m "describe_change"
```

### Seed Development Database
```bash
cd backend
python scripts/seed_db.py
```

### Run Database Unit Tests
```bash
cd backend
pytest tests/test_database.py
```

---

## 5. Environment Variables

| Variable Name | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/railopt_db` | Primary PostgreSQL database connection string |
| `SQLITE_FALLBACK_URL` | `sqlite:///./railopt_dev.db` | Local SQLite fallback connection string for dev testing |
| `ENVIRONMENT` | `development` | Deployment environment (development, staging, production) |
