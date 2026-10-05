from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.incidents import router as incidents_router
from app.routers.responders import router as responders_router
from app.routers.hospitals import router as hospitals_router
from app.routers.authority import router as authority_router
from app.routers.ai import router as ai_router
from app.routers.timeline import router as timeline_router


app = FastAPI(
    title="SAHAY API",
    description="Smart Emergency Response & Assistance API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# SAHAY API Routers
app.include_router(incidents_router)
app.include_router(responders_router)
app.include_router(hospitals_router)
app.include_router(authority_router)
app.include_router(ai_router)
app.include_router(timeline_router)


@app.get("/")
def root():
    return {
        "name": "SAHAY",
        "message": "Smart Emergency Response & Assistance API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sahay-backend",
    }