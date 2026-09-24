import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from .database import init_db, check_db_connection
from .services.ml_service import ml_service
from .routes import prediction, history, analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("uvicorn.error")

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager:
    - Loads the ML model once at startup into memory
    - Initializes MySQL database tables
    """
    logger.info("Initializing AI Health Prediction & Analytics Backend...")

    # 1. Verify ML Model
    try:
        if ml_service.is_ready:
            logger.info("ML Model and Scaler verified and loaded.")
    except Exception as e:
        logger.error(f"Failed to load ML artifacts at startup: {e}")

    # 2. Verify / Initialize Database
    try:
        init_db()
        db_ok = check_db_connection()
        if db_ok:
            logger.info("Successfully connected to MySQL database.")
        else:
            logger.warning(
                "MySQL database is currently unreachable. "
                "Ensure MySQL server is running and credentials in .env are correct."
            )
    except Exception as e:
        logger.warning(f"Database initialization notice: {e}")

    yield

    logger.info("Shutting down AI Health Prediction Backend...")

app = FastAPI(
    title="AI Health Prediction & Analytics API",
    description=(
        "Production-grade REST API for Machine Learning-powered diabetes risk assessment, "
        "MySQL historical records management, and real-time clinical analytics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration - allow localhost and any LAN IP address (e.g. 10.x.x.x, 192.168.x.x)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers to never expose raw stack traces
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field_name = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Invalid value")
        errors.append(f"{field_name}: {msg}" if field_name else msg)
    
    error_summary = "; ".join(errors) if errors else "Please verify the health indicators."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": f"Input validation failed: {error_summary}",
            "details": errors
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing request {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request. Please try again later."
        }
    )

# Include Routers
app.include_router(prediction.router)
app.include_router(history.router)
app.include_router(analytics.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "title": "AI Health Prediction & Analytics Platform API",
        "version": "1.0.0",
        "status": "online",
        "ml_model_loaded": ml_service.is_ready,
        "database_connected": check_db_connection(),
        "disclaimer": "Educational and informational demonstration only. Not a medical diagnosis.",
        "documentation": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    db_status = check_db_connection()
    return {
        "status": "healthy" if ml_service.is_ready and db_status else "degraded",
        "ml_service": "ready" if ml_service.is_ready else "error",
        "database": "connected" if db_status else "unreachable"
    }
