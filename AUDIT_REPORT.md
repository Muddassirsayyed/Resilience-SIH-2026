# RAILOPT Existing Project Audit

## 1. Executive Summary

**RAILOPT** is an AI-powered decision-support and dynamic maintenance block optimization platform designed for Indian Railways across zones and divisions. It operates as an intelligent advisory layer over existing core railway systems—including Track Management System (TMS), Signal & Track Maintenance Management System (SMMS), Traction Distribution Management System (TDMS), Control Office Application (COA), and Rate Advice & Block System (RBS).

This audit evaluates the existing repository code, files, structure, models, API routes, frontend components, and optimization logic to establish a factual baseline of the current implementation.

### Key Audit Findings:
- **Frontend**: High-fidelity React (Vite + Tailwind CSS) dashboard with interactive components across 8 distinct pages. However, most views rely on static mock data (`mockData.js`) because backend endpoints return empty payloads or stubbed responses.
- **Backend & APIs**: FastAPI application (`backend/app/main.py`) with basic routes. API routes for core resources (`/api/maintenance-tasks`, `/api/block-windows`, `/api/trains`) return empty lists `[]`. Integration routes (`/api/integration/*`) return static dictionary data simulating TMS, SMMS, TDMS, and COA.
- **Database**: **MISSING**. `backend/app/models/base.py` and `backend/app/schemas/schemas.py` are empty boilerplate stubs (`# Base models go here`). No database engine (PostgreSQL/SQLite), ORM models, or migration tools (Alembic) exist.
- **Machine Learning**: **PARTIALLY IMPLEMENTED (Synthetic Only)**. A scikit-learn `RandomForestClassifier` is trained on synthetic data (`dataset_generator.py` -> `maintenance_dataset.csv`) for maintenance priority classification. Asset risk prediction, duration prediction, and train-impact ML models are completely missing.
- **Optimization Engine (OR-Tools / CP-SAT)**: **INCORRECT / NEEDS REDESIGN & MISSING**. `ortools` is not installed or listed in `requirements.txt`. The current block optimizer (`app/optimizer/block_optimizer.py`) is a rudimentary Python string-matching and duration loop. It lacks constraint programming, multi-objective optimization, resource constraints, yard feasibility, and Plan A/B/C generation capabilities.
- **Safety & Railway Constraints**: Rule-based safety validation is limited to a single check preventing ML from downgrading `CRITICAL` tasks. S&T disconnections, power block dependencies (TRD), route relay interlocking (RRI) yard constraints, and crew/machine availability constraints are completely unmodeled.

---

## 2. Current Architecture

```
+-----------------------------------------------------------------------------------+
|                                  FRONTEND UI                                      |
|  React + Vite + Tailwind CSS (Port 5173)                                         |
|  - Dashboard / Map / Priority Center / Block Planner / Conflicts / Reports         |
|  - API Service Layer (`API.js`) with automatic fallback to `mockData.js`          |
+------------------------------------------+----------------------------------------+
                                           | HTTP Requests
                                           v
+-----------------------------------------------------------------------------------+
|                                  BACKEND API                                      |
|  FastAPI Framework (Port 8000)                                                    |
|  - Main Application (`backend/app/main.py`)                                       |
|  - API Routers: `routes.py`, `integration.py`, `planning.py`, `ml.py`             |
+---------------------+--------------------+-------------------+--------------------+
                      |                    |                   |
                      v                    v                   v
        +-----------------------+ +------------------+ +-------------------+
        |  Integration Stubs    | | Priority Engine  | | Block Optimizer   |
        |  - `tms.py` (Track)   | | - Hybrid Rules   | | - Basic Greedy  |
        |  - `smms.py` (S&T)    | | - Scikit ML Model| |   Corridor Loop   |
        |  - `tdms.py` (TRD)    | |   (`predictor`)  | | - Timestamp     |
        |  - `coa.py` (Trains)  | +------------------+ |   Conflict Check  |
        +-----------------------+                      +-------------------+
```

---

## 3. Backend Status

- **Framework**: FastAPI application running with CORS configured for `http://localhost:5173`.
- **Router Modularization**: Endpoints split into `routes.py`, `integration.py`, `planning.py`, and `ml.py`.
- **Implementation Reality**:
  - `GET /api/health`: Functioning health check endpoint.
  - `GET /api/maintenance-tasks`, `/api/block-windows`, `/api/block-plans`, `/api/corridors`, `/api/assets`, `/api/trains`, `/api/conflicts`: Return hardcoded empty lists (`"data": []`) or stubbed JSON responses.
  - `GET /api/integration/*`: Serves in-memory static arrays simulating Indian Railways data sources (TMS, SMMS, TDMS, COA).
  - `POST /api/planning/generate`: Combines simulated integration data, calls `priority_engine.py`, `block_optimizer.py`, and `conflict_detector.py`.
  - `POST /api/ml/predict-priority`: Invokes scikit-learn `priority_model.joblib` to classify task priority.

---

## 4. Frontend Status

- **Framework**: React 18, Vite, Tailwind CSS, Lucide React icons, React Router DOM.
- **Pages Implemented**:
  1. `Dashboard.jsx`: Executive summary of operational status, section health, active blocks, and key metrics.
  2. `LiveRailwayNetwork.jsx`: Interactive SVG schematic map of section topology, section info panels, and live alerts.
  3. `LiveMonitoring.jsx`: Real-time dashboard showing active block progress and train movement statuses.
  4. `AIPriorityCenter.jsx`: Maintenance task table, priority score Breakdown, and live ML priority prediction sidebar.
  5. `BlockPlanning.jsx`: Corridor block request grid, department task combining visualizer, and manual plan generation controls.
  6. `ConflictResolution.jsx`: Detailed train movement vs maintenance window conflict list with resolution option toggles.
  7. `MaintenancePlanner.jsx`: Weekly schedule view, department workload distribution, and overdue task tracker.
  8. `Reports.jsx`: Operational report generator with summary export previews.
- **API Integration**: `API.js` connects to backend when live, but seamlessly falls back to `mockData.js` when endpoints return empty data or error out.

---

## 5. Database Status

- **Status**: **MISSING (0% Implemented)**
- **Findings**:
  - File `backend/app/models/base.py` contains only `# Base models go here`.
  - File `backend/app/schemas/schemas.py` contains only `# Schemas go here`.
  - No database ORM (SQLAlchemy / Tortoise / SQLModel) configuration exists.
  - No database connection strings, pooling, or migrations (Alembic) are set up.
  - All state is strictly ephemeral and re-generated from hardcoded Python lists on every request.

---

## 6. ML Status

- **Status**: **PARTIALLY IMPLEMENTED (Synthetic Priority Model Only)**
- **Existing Files**:
  - `backend/app/ml/dataset_generator.py`: Generates 5,000 synthetic rows of maintenance data using heuristic scoring rules.
  - `backend/app/ml/train.py`: Fits a scikit-learn `RandomForestClassifier` on `dataset_generator.py` output.
  - `backend/app/ml/predictor.py`: Exposes `predict_priority()` function to run inference on input task dicts.
  - `backend/app/ml/evaluate.py`: Evaluates agreement percentage between ML and rule engine.
- **Deficiencies**:
  - **No Asset Risk Prediction**: ML model does not predict asset failure probability or degradation risk.
  - **No Duration Prediction**: Task durations are static inputs rather than ML-predicted distributions based on historical work records.
  - **No Train Impact Prediction**: Operational impact / delay propagation is calculated via simple timestamp overlap rather than predictive ML.
  - **Synthetic Data Reliance**: Trained purely on synthetic data generated by hardcoded rules.

---

## 7. Optimization Status

- **Status**: **INCORRECT / NEEDS REDESIGN (0% OR-Tools CP-SAT)**
- **Existing Files**:
  - `backend/app/optimizer/block_optimizer.py`: Uses a basic Python `for` loop that checks if task estimated duration is less than total block duration on the same corridor string.
  - `backend/app/optimizer/conflict_detector.py`: Checks if scheduled train arrival string falls between block start and end time.
- **Deficiencies**:
  - **No OR-Tools CP-SAT**: Google OR-Tools library is not included in `requirements.txt` or imported anywhere in the codebase.
  - **No Constraint Programming**: Decision variables, integer bounds, linear constraints, and solver objective functions are completely absent.
  - **No Resource Modeling**: Does not model crew gangs, track machines (BCM, CSM, UNIMAT), tower wagons, or equipment constraints.
  - **No Plan A/B/C Generation**: Solver produces only a single greedy assignment recommendation without alternative trade-off plans (e.g. Max Safety, Min Train Delay, Max Maintenance Yield).

---

## 8. Dynamic Replanning Status

- **Status**: **MOCK / DEMO ONLY**
- **Findings**:
  - Frontend contains interactive buttons for "Simulate Delay", "Re-optimize", "Resolve Conflict".
  - Frontend state updates locally in React component memory.
  - Backend has no event streaming (WebSockets, SSE), background worker queue (Celery, ARQ), or reactive event-driven dynamic re-planning engine.

---

## 9. Integration Status

- **Status**: **MOCK / DEMO ONLY**
- **Existing Files**:
  - `backend/app/integration/tms.py`: Hardcoded list of 2 Track maintenance records.
  - `backend/app/integration/smms.py`: Hardcoded list of 2 Signal maintenance records.
  - `backend/app/integration/tdms.py`: Hardcoded list of 2 Traction (OHE) maintenance records.
  - `backend/app/integration/coa.py`: Hardcoded list of 3 Train records and 3 Block Window records.
  - `backend/app/integration/validator.py`: Dict key & value validator.
  - `backend/app/integration/normalizer.py`: Maps input fields into standardized internal dictionaries.
- **Deficiencies**:
  - No real API integrations or database connectors for TMS, SMMS, TDMS, COA, or RBS systems.
  - Schemas are static Python dicts without Pydantic strict typing or external sync interfaces.

---

## 10. Security and Safety Status

- **Status**: **MISSING / WEAK**
- **Findings**:
  - **RBAC / Authentication**: Missing. No user tables, JWT tokens, OAuth2, or role enforcement (e.g., Section Engineer vs Power Controller vs Chief Controller).
  - **Audit Logging**: Missing. No persistent trail of who requested, modified, approved, or rejected a block.
  - **Safety Fail-Safes**: Weak. Only a single Python condition prevents ML from overriding a `CRITICAL` task. No formal verification of interlocking, power isolation, or traffic protection.

---

## 11. Testing Status

- **Status**: **MISSING (0% Test Coverage)**
- **Findings**:
  - No `tests/` directory exists in backend or frontend.
  - No unit tests (`pytest`), API tests (`httpx`/`TestClient`), or frontend component tests (`vitest`/`jest`).
  - Only a single top-level manual test script `test_ml_api.py` exists to ping `localhost:8000/api/ml/predict-priority`.

---

## 12. Complete Capabilities Matrix (1 - 33 Capabilities Audit)

Below is the exhaustive, empirical audit of all 33 specific capabilities required for RAILOPT.

| # | Capability Name | Status | Relevant File(s) | What Works | What Does Not Work / Gaps | Required Changes | Priority |
|---|---|---|---|---|---|---|---|
| **1** | **Frontend** | **B. PARTIALLY IMPLEMENTED** | `frontend/src/*` | 8 complete React pages, rich UI, interactive map, sidebar layout. | Relying on fallback `mockData.js` because backend returns empty lists. | Wire components to real backend APIs; remove reliance on static mock objects. | **P0** |
| **2** | **Backend** | **B. PARTIALLY IMPLEMENTED** | `backend/app/main.py`, `app/api/*` | FastAPI app running with CORS and endpoint routers. | Core CRUD routes return hardcoded `[]` or dummy objects. | Implement complete database services, ORM models, and business logic endpoints. | **P0** |
| **3** | **Database** | **D. MISSING** | `backend/app/models/base.py`, `schemas/schemas.py` | Empty file boilerplate structure. | No ORM models, no DB engine connection, no schema migration scripts. | Implement SQLAlchemy / PostgreSQL schema for Assets, Tasks, Trains, Blocks, Users, and Logs. | **P0** |
| **4** | **Railway Domain Models** | **B. PARTIALLY IMPLEMENTED** | `backend/app/integration/normalizer.py`, `frontend/src/data/mockData.js` | Dict representations of Tasks, Trains, Corridors, and Block Windows. | Missing formal Pydantic / SQLAlchemy schemas for Sections, Yards, Lines, Stations, Crews, and Machines. | Build comprehensive railway domain entities for IR operations. | **P0** |
| **5** | **Maintenance Task Management** | **B. PARTIALLY IMPLEMENTED** | `backend/app/integration/tms.py`, `smms.py`, `tdms.py`, `routes.py` | Static reading and simple normalization of TMS/SMMS/TDMS tasks. | `/api/maintenance-tasks` returns empty data; no CRUD operations or database persistence. | Implement full task lifecycle (Draft, Requested, Prioritized, Scheduled, Execution, Overrun, Completed). | **P0** |
| **6** | **Asset Management** | **C. MOCK/DEMO ONLY** | `frontend/src/data/mockData.js`, `backend/app/api/routes.py` | UI mock reports for asset availability; hardcoded asset IDs in mock files. | Backend `/api/assets` returns `[]`; no asset health history, degradation tracking, or GIS mapping. | Create database schema for Railway Assets (Track, Points, Signals, OHE, Bridges) with degradation history. | **P1** |
| **7** | **Block Request Management** | **B. PARTIALLY IMPLEMENTED** | `backend/app/optimizer/block_optimizer.py`, `frontend/src/pages/BlockPlanning.jsx` | UI allows submitting block request; backend groups tasks by corridor window. | No formal block request workflow (Draft -> Submitting Dept -> Multi-Dept Coordination -> Traffic/Power Review). | Build structured Block Request lifecycle API and database models. | **P0** |
| **8** | **Train Data** | **B. PARTIALLY IMPLEMENTED** | `backend/app/integration/coa.py`, `routes.py` | Static COA train schedule dictionary records. | `/api/trains` returns `[]`; no dynamic delay tracking, train priority weighting, or speed profiles. | Build Train schedule and live status module with precedence/priority rules (Rajdhani, Express, Goods). | **P0** |
| **9** | **Department Management** | **B. PARTIALLY IMPLEMENTED** | `backend/app/integration/normalizer.py` | Normalizes source systems to Engineering, S&T, and Traction departments. | No department user roles, departmental approval requirements, or resource separation. | Add Department entities, permissions, and departmental sign-off requirements. | **P1** |
| **10** | **Resource/Crew/Machine Management** | **D. MISSING** | None | None | Complete absence of track machine (BCM, CSM, DGS), tower wagon, gang, and supervisor roster tracking. | Create Resource, Machine, and Crew availability models & include them in CP-SAT solver constraints. | **P0** |
| **11** | **ML Priority Engine** | **B. PARTIALLY IMPLEMENTED** | `backend/app/ml/predictor.py`, `app/ai/priority_engine.py` | Scikit-learn RandomForest model predicts priority class with confidence score. | Model is trained on purely synthetic rule-generated data (`maintenance_dataset.csv`). | Retrain ML on realistic historical failure data & feature sets; implement continuous model evaluation. | **P1** |
| **12** | **Risk Prediction** | **D. MISSING** | None | None | No machine learning or statistical model predicts asset failure risk probability. | Implement asset risk prediction ML model based on age, tonnage (GMT), defect history, and weather. | **P1** |
| **13** | **Duration Prediction** | **D. MISSING** | None | None | Task durations are hardcoded static numbers. | Build ML regression model to predict actual task duration based on asset condition, resources, & history. | **P1** |
| **14** | **Train-Impact Calculation** | **C. MOCK/DEMO ONLY** | `backend/app/optimizer/conflict_detector.py` | Basic string overlap check between train schedule time and block window. | Does not calculate actual delay minutes, train detention costs, speed restriction slowdowns, or ripple delays. | Implement analytical/heuristic train delay propagation & detention impact calculator. | **P1** |
| **15** | **Multi-Department Compatibility** | **C. MOCK/DEMO ONLY** | `backend/app/optimizer/block_optimizer.py` | Combines tasks on the same corridor if durations fit available window. | Does not enforce safety rules (e.g. S&T disconnection during track geometry correction, power isolation during OHE work). | Build a formal activity matrix defining mandatory, allowed, and prohibited co-located maintenance. | **P0** |
| **16** | **Safety Constraint Engine** | **E. INCORRECT/NEEDS REDESIGN** | `backend/app/ai/priority_engine.py` | Basic check preventing ML from downgrading `CRITICAL` rule priority. | No formal safety constraint engine for block granting, traffic protection, or interlocking rules. | Build a dedicated Safety Rule & Constraint Engine enforcing Indian Railways General & Subsidiary Rules (G&SR). | **P0** |
| **17** | **RRI/Yard Feasibility** | **D. MISSING** | None | None | No modeling of Route Relay Interlocking (RRI), yard line availability, turnaround lines, or point isolation. | Implement Yard & Line topology graph modeling to verify yard block feasibility. | **P2** |
| **18** | **Power/TRD Dependency** | **D. MISSING** | None | None | No modeling of elementary sections, sub-stations, or power block isolation boundaries. | Add TRD Power Isolation section mapping and mandatory OHE shadow block generation. | **P1** |
| **19** | **S&T Dependency** | **D. MISSING** | None | None | No modeling of signal disconnection, track circuit isolation, or point machine locking. | Add S&T Disconnection memo generation and signal protection constraints. | **P1** |
| **20** | **Optimization Engine** | **E. INCORRECT/NEEDS REDESIGN** | `backend/app/optimizer/block_optimizer.py` | Simple Python loop grouping tasks by corridor. | Not an optimization solver; cannot perform multi-variable trade-offs or complex constraint satisfaction. | Redesign completely using Google OR-Tools CP-SAT solver. | **P0** |
| **21** | **OR-Tools / CP-SAT** | **D. MISSING** | None | `ortools` missing from `requirements.txt` and codebase. | Solver logic is missing entirely. | Integrate `ortools.sat.python.cp_model` with decision variables, constraints, and objective function. | **P0** |
| **22** | **Plan A / B / C** | **D. MISSING** | None | Backend returns a single basic recommendation list. | No alternative plan generation (e.g., Plan A: Max Safety, Plan B: Min Delay, Plan C: Balanced Yield). | Configure CP-SAT solver to solve for distinct objective weightings to produce Plan A, B, and C options. | **P0** |
| **23** | **Explainability** | **B. PARTIALLY IMPLEMENTED** | `backend/app/planning/service.py` | Generates text string explanations (`WHAT`, `WHERE`, `WHY`, `WHEN`, `IMPACT`). | Explanations are static string concatenations rather than constraint-solver slack & decision trees. | Implement structured solver-backed explainability detailing why tasks were included/excluded. | **P1** |
| **24** | **Dynamic Re-planning** | **C. MOCK/DEMO ONLY** | `frontend/src/pages/ConflictResolution.jsx` | Frontend UI toggles mock conflict resolution. | No backend engine for real-time schedule disruption handling, block overrun adjustments, or re-solving. | Implement event-driven re-optimization pipeline triggered by delay/emergency events. | **P1** |
| **25** | **Event Simulation** | **C. MOCK/DEMO ONLY** | `frontend/src/pages/LiveMonitoring.jsx` | Mock alerts and train position status updates in UI state. | Backend lacks an event simulator engine for injecting train delays, defects, or machine breakdowns. | Create an Event Simulator module to trigger dynamic re-planning scenarios for testing. | **P2** |
| **26** | **What-if Simulation** | **D. MISSING** | None | None | No capability to simulate hypothetical block durations or train schedule shifts on overall network output. | Build What-If simulation service allowing controllers to test custom block window parameters. | **P2** |
| **27** | **GIS / Map** | **C. MOCK/DEMO ONLY** | `frontend/src/components/network/RailwayNetworkMap.jsx` | Clean SVG schematic diagram of Kanpur-Tundla corridor. | Not a real GIS map (Leaflet/Mapbox/OpenLayers); hardcoded static SVG coordinates. | Integrate Leaflet / Mapbox with geospatial coordinates for IR tracks, stations, and assets. | **P2** |
| **28** | **Human Approval Workflow** | **C. MOCK/DEMO ONLY** | `frontend/src/pages/BlockPlanning.jsx`, `ConflictResolution.jsx` | UI buttons for "Approve", "Reject", "Controller Review". | Action buttons only change local React component state; no backend approval state or digital signatures. | Implement backend Human-in-the-Loop workflow with state machine persistence & controller audit logs. | **P0** |
| **29** | **RBAC (Role-Based Access Control)** | **D. MISSING** | None | None | No authentication, route guards, token validation, or role differentiation. | Implement OAuth2 / JWT authentication with roles: Section Engineer, SrDOM, TPC, Test Controller, Admin. | **P0** |
| **30** | **Audit Logging** | **D. MISSING** | None | None | No audit trail table or logging interceptor for system decisions and human overrides. | Create database audit logging schema tracking every plan generation, approval, override, and rejection. | **P1** |
| **31** | **Testing** | **D. MISSING** | `test_ml_api.py` | Single manual HTTP request script for ML endpoint. | Zero unit tests, zero integration tests, zero frontend tests. | Implement `pytest` test suite covering API routes, ML inference, CP-SAT solver, and constraint rules. | **P1** |
| **32** | **Deployment Readiness** | **D. MISSING** | `backend/.env.example`, `frontend/.env.example` | Basic `.env.example` files containing dummy keys. | No Dockerfile, Docker Compose, CI/CD pipeline, production WSGI config, or security hardening. | Create Dockerfiles, `docker-compose.yml`, production environment configs, and health monitoring. | **P2** |
| **33** | **End-to-End Workflow** | **C. MOCK/DEMO ONLY** | `frontend/src/*`, `backend/app/*` | User can navigate through UI screens and trigger mock actions. | Broken between frontend and backend due to missing DB, stubbed backend routes, and missing solver. | Connect full pipeline: Integration -> DB -> ML Priority -> CP-SAT Solver -> Plan A/B/C UI -> Human Approval. | **P0** |

---

## 13. Detailed Categorization Breakdown

### 13.1 Complete Features (A)
- *None*. (All current functional components have gaps, rely on mock data, or require backend persistence).

### 13.2 Partially Implemented Features (B)
- **Frontend UI Framework**: Complete 8-page React dashboard structure with rich components, navigating smoothly via React Router DOM (`frontend/src/App.jsx`).
- **FastAPI Infrastructure**: Functional web server setup (`backend/app/main.py`) with CORS middleware and API routers.
- **ML Priority Classifier**: Working scikit-learn RandomForest model (`backend/app/ml/predictor.py`), though trained on synthetic data.
- **Data Ingestion & Normalization Stubs**: Data ingestion pipelines (`backend/app/integration/*`) capable of validating and normalizing incoming JSON payload structures.
- **Basic Explainability Structure**: Preliminary string formatter (`backend/app/planning/service.py`) generating human-readable `WHAT`, `WHERE`, `WHY`, `WHEN`, `IMPACT` summaries.

### 13.3 Mock/Demo Features (C)
- **Integration Data Sources**: Hardcoded Python list data for TMS, SMMS, TDMS, and COA (`backend/app/integration/*.py`).
- **Frontend Mock State**: All 8 frontend pages rely on `mockData.js` (926 lines of mock data) for interactive display.
- **Train Impact & Delay**: Simple timestamp range overlap detection (`backend/app/optimizer/conflict_detector.py`).
- **Human Approval & Decision Workflow**: Frontend buttons ("Approve Block", "Reject", "Modify") that mutate local React state without persisting backend changes.
- **Network Map**: Static SVG layout (`RailwayNetworkMap.jsx`) representing Kanpur Central to Mathura section.

### 13.4 Missing Features (D)
- **Database Layer**: SQLAlchemy models, PostgreSQL connection, Pydantic schemas, and Alembic migrations.
- **OR-Tools CP-SAT Optimization Engine**: Mathematical constraint solver engine for maintenance block scheduling.
- **Plan A / B / C Generation**: Automated multi-objective optimization producing distinct plan alternatives.
- **Resource & Crew Management**: Models and constraints for track machines, tower wagons, gangs, and supervisors.
- **Asset Risk & Duration ML Models**: Machine learning models for asset degradation risk and maintenance duration estimation.
- **Yard & Interlocking Feasibility (RRI)**: Yard topology graphs and route locking constraints.
- **Power (TRD) & Signal (S&T) Disconnection Dependencies**: Power section boundaries and signal isolation memo workflows.
- **Role-Based Access Control (RBAC)**: User authentication, JWT tokens, and departmental access control.
- **Audit Logging**: Immutable audit logs for safety compliance and controller actions.
- **Automated Testing Suite**: Unit and integration test suites (`pytest`, `vitest`).
- **Deployment Infrastructure**: Docker containers, orchestration scripts, and production configurations.

### 13.5 Incorrect / Weak Implementations (E)
- **Block Optimizer (`backend/app/optimizer/block_optimizer.py`)**: Currently implemented as a simple Python string-matching loop. Must be completely replaced with OR-Tools CP-SAT solver.
- **Safety Constraint Handling (`backend/app/ai/priority_engine.py`)**: Limited to a simple priority boost check. Requires a dedicated, formal Safety Rule Engine enforcing Indian Railways G&SR rules.

---

## 14. Recommended Target Architecture

To transition RAILOPT from a UI prototype into a production-grade Indian Railways Optimization & Decision Support Platform:

```
+-----------------------------------------------------------------------------------+
|                                  REACT FRONTEND                                   |
|  - Real-time Dashboard, GIS Network Map (Leaflet), CP-SAT Plan A/B/C Workbench    |
|  - Human-in-the-Loop Controller Sign-off & Audit Log Inspection                   |
+------------------------------------------+----------------------------------------+
                                           | REST API / WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                                 FASTAPI BACKEND                                   |
|  +-----------------------+ +------------------------+ +------------------------+  |
|  | REST API Controllers  | | Auth & RBAC (OAuth2)   | | Event Stream / WS    |  |
|  +-----------+-----------+ +-----------+------------+ +-----------+------------+  |
|              |                         |                      |                   |
|              v                         v                      v                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             SERVICES LAYER                                  |  |
|  |  +-------------------+  +---------------------+  +-----------------------+  |  |
|  |  |  Task Service     |  | Asset Risk ML Model |  | Safety Rule Engine    |  |  |
|  |  +-------------------+  +---------------------+  +-----------------------+  |  |
|  |  +-------------------+  +---------------------+  +-----------------------+  |  |
|  |  |  Train Service    |  | Duration ML Model   |  | OR-Tools CP-SAT Engine|  |  |
|  |  +-------------------+  +---------------------+  +-----------------------+  |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | ORM / Driver
                                         v
+-----------------------------------------------------------------------------------+
|                               POSTGRESQL DATABASE                                 |
|  - Tables: assets, tasks, trains, block_windows, plan_proposals, resources,       |
|    users, audit_logs, safety_rules                                                |
+-----------------------------------------------------------------------------------+
```

---

## 15. Implementation Roadmap

### Phase 1: Core Foundation & Database Infrastructure (Weeks 1 - 2)
1. **Database Schema & ORM Setup**: Implement PostgreSQL database models using SQLAlchemy/SQLModel for Assets, Tasks, Trains, Block Windows, Resources, Users, and Plan Proposals.
2. **Backend API Refactoring**: Replace hardcoded `[]` endpoint returns in `routes.py` with real database CRUD queries.
3. **Pydantic Schemas**: Define comprehensive request/response models in `schemas/schemas.py`.

### Phase 2: OR-Tools CP-SAT Optimization Engine (Weeks 3 - 4)
1. **OR-Tools Integration**: Add `ortools` to `requirements.txt` and build a mathematical constraint optimization model (`cp_sat_solver.py`).
2. **Constraint Enforcement**:
   - Time window boundaries and corridor availability.
   - Task duration & machine setup times.
   - Resource & crew gang availability.
   - Safety disconnections (TRD power block & S&T signal protection).
   - Multi-department co-location compatibility rules.
3. **Plan A / B / C Multi-Objective Engine**:
   - **Plan A (Max Maintenance Yield / Asset Reliability)**.
   - **Plan B (Min Train Delay / Traffic Impact)**.
   - **Plan C (Balanced / Optimal Operational Trade-off)**.

### Phase 3: ML Intelligence Enhancement (Weeks 5 - 6)
1. **Asset Risk Prediction Model**: Train ML model to predict failure risk score based on asset age, GMT tonnage, defect history, and weather.
2. **Maintenance Duration Predictor**: Build regression model for task duration estimation.
3. **Hybrid Priority Engine Refactoring**: Integrate ML Risk and Rule Engine priorities safely with strict non-downgrade safety overrides.

### Phase 4: Human-in-the-Loop & Dynamic Replanning (Weeks 7 - 8)
1. **Controller Approval Workflow**: Build backend state machine (`DRAFT` -> `PROPOSED` -> `CONTROLLER_APPROVED` -> `GRANTED` -> `COMPLETED` / `OVERRUN`).
2. **Dynamic Event Engine**: Handle live train delays, emergency track defects, and block overrun events with automatic re-optimization prompts.
3. **Audit Trail**: Record all plan decisions, overrides, and digital signatures.

### Phase 5: Testing, Hardening & Deployment (Weeks 9 - 10)
1. **Testing Suite**: Implement backend unit/integration tests (`pytest`) covering solver constraints, safety rules, and API endpoints.
2. **Containerization**: Create production Docker containers and `docker-compose.yml`.
3. **Frontend Integration**: Connect all React pages to live backend APIs, replacing mock fallback logic.

---

## 16. Priority Order Summary

| Priority | Task Description | Target Area |
|---|---|---|
| **P0** | Install OR-Tools & Build CP-SAT Constraint Optimization Solver | Backend / Optimizer |
| **P0** | Generate Plan A / B / C Multi-Objective Proposals | Backend / Optimizer |
| **P0** | Implement PostgreSQL Database Engine, SQLAlchemy Models & Schemas | Backend / DB |
| **P0** | Implement Machine, Crew Gang & Resource Constraints | Backend / Domain |
| **P0** | Connect React Frontend to Live API Routes & Remove Mock Fallbacks | Frontend / API |
| **P0** | Implement Controller Human-in-the-Loop Approval State Machine | Backend / Workflow |
| **P1** | Develop Asset Risk Prediction & Duration Estimation ML Models | Backend / ML |
| **P1** | Implement TRD Power Isolation & S&T Disconnection Safety Dependencies | Backend / Safety |
| **P1** | Build Train Delay & Speed Restriction Detention Impact Engine | Backend / Analytics |
| **P1** | Implement Immutable Audit Logging System | Backend / Security |
| **P1** | Build Pytest Test Suite for Solver, Rules, and APIs | Backend / Testing |
| **P2** | Implement Yard & Line Topology Graph for RRI Feasibility | Backend / Domain |
| **P2** | Build Dynamic Event Simulator & What-If Planning Workbench | Backend / Simulation |
| **P2** | Integrate Real GIS Mapping (Leaflet/Mapbox) for Indian Railways Topology | Frontend / GIS |
| **P2** | Dockerization, CI/CD Pipeline & Production Hardening | DevOps / Deployment |

---
*Report generated automatically following comprehensive code and architectural inspection of the RAILOPT project repository.*
