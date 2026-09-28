# 🚂 AI-Powered Intelligent Maintenance Block Planner

![SIH 2026](https://img.shields.io/badge/Smart_India_Hackathon-2026-blue)
![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)

An AI-driven operational control system designed to optimize railway maintenance blocks. It intelligent bundles maintenance tasks, coordinates with scheduled train movements, and resolves conflicts using advanced constraint satisfaction modeling (OR-Tools) and Machine Learning-based priority scoring.

## 🚀 Live Deployment

**Deployed Link:** [Insert Your Deployed Link Here]

---

## ✨ Key Features

- **🧠 AI Priority Engine**: Dynamically assigns priority scores to maintenance tasks based on critical infrastructure metrics using an integrated Scikit-learn model.
- **⚙️ Constraint-Based Scheduler**: Utilizes Google OR-Tools (CP-SAT) to generate conflict-free maintenance block plans taking into account train routes, durations, and spatial constraints.
- **🛠️ What-If Scenarios**: Simulate multiple block planning strategies and immediately view operational impact without altering live production schedules.
- **📊 Real-time Monitoring**: Full React frontend providing an interactive dashboard, conflict alerts, spatial topologies, and live network impact analysis.
- **📁 CSV Data Ingestion**: Seamlessly upload `tasks.csv` and `trains.csv` through dedicated API endpoints to synchronize backend operations.

---

## 🏗️ Project Architecture

```
Resilience-SIH-2026/
├── backend/                  # FastAPI Application
│   ├── app/                  # Core API logic, models, AI, and optimizers
│   ├── data/                 # Raw data & CSV storage
│   ├── scripts/              # Setup and seeding scripts
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Vite Application
│   ├── src/                  # React components, pages, context, and state
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # UI styling constraints
└── docker-compose.yml        # Docker orchestration
```

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker (optional)

### 1. Using Docker (Recommended)
You can easily spin up the entire application stack using Docker Compose:
```bash
docker-compose up -d
```
- Frontend will be live at: `http://localhost:3000`
- Backend API & Swagger Docs at: `http://localhost:8000/docs`

### 2. Manual Setup

**Backend Configuration:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend Configuration:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 Core API Endpoints

The system relies on several core RESTful APIs. You can view all available APIs in the Swagger UI (`/docs`).

- `GET /api/tasks` - Retrieve maintenance tasks.
- `GET /api/trains` - Retrieve scheduled train movements.
- `POST /api/upload-csv` - Ingest operational `.csv` files.
- `POST /api/plan/generate-plan` - Execute AI optimization & constraint scheduling.
- `POST /api/scenarios` - Create a temporary what-if block plan.

---

## 🤝 Contribution Guidelines
1. Fetch and pull the latest changes from the `main` branch.
2. Resolve any merge conflicts locally before pushing.
3. Make sure both `npm run dev` and `uvicorn` run without critical errors.
4. Push to your respective feature branches.

*Made with ❤️ for Smart India Hackathon 2026.*