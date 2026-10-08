"""
FastAPI Entry Point - Money Trail Hunter
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, APP_VERSION

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Graph-based Fraud & Mule Account Investigation Platform API"
)

# CORS middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "online",
        "service": APP_NAME,
        "version": APP_VERSION,
        "environment": "development"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
