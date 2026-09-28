from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.demo_api import router as demo_router

app = FastAPI(
    title="RAILOPT — AI-Enabled Railway Block Planning API",
    description="Prototype demonstration API for Indian Railways maintenance block planning and optimization.",
    version="1.0.0-demo"
)

# CORS for all local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demo_router)

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "RAILOPT Block Planning API",
        "mode": "DEMO",
        "version": "1.0.0-demo",
        "note": "This is a prototype demonstration. Data is synthetic and does not represent live Indian Railways operations.",
    }
