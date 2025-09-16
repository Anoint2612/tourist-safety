from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
import logging
import uvicorn

from .config import PROJECT_NAME, API_V1_STR
from .database import init_db, close_db
from .routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    description="""
    ## Geofencing Tourist Safety API
    
    A comprehensive API for managing geo-fence zones, tracking tourist locations, 
    and generating real-time alerts for tourist safety.
    
    ### Features:
    - **Zone Management**: Create, update, and manage geo-fence zones (safe, risky, restricted)
    - **Tourist Tracking**: Real-time location tracking with PostGIS spatial queries
    - **Alert System**: Automatic alert generation when tourists enter restricted zones
    - **WebSocket Support**: Real-time notifications for dashboards and police monitoring
    - **RESTful API**: Complete CRUD operations with proper validation
    
    ### Zone Types:
    - **Safe**: No alerts generated
    - **Risky**: Warning alerts generated
    - **Restricted**: High-priority alerts generated
    
    ### WebSocket Endpoints:
    - `/ws/dashboard` - For dashboard clients
    - `/ws/police` - For police monitoring systems
    - `/ws/admin` - For administrative interfaces
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and other startup tasks"""
    logger.info("Starting up Geofencing Tourist Safety API...")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Geofencing Tourist Safety API...")
    await close_db()
    logger.info("Shutdown complete")

# Include API routes
app.include_router(router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": PROJECT_NAME,
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {PROJECT_NAME}",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "websocket": "/ws/alerts"
    }

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=PROJECT_NAME,
        version="1.0.0",
        description=app.description,
        routes=app.routes,
    )
    
    # Add WebSocket endpoints to OpenAPI schema
    openapi_schema["paths"]["/ws/alerts"] = {
        "get": {
            "summary": "WebSocket endpoint for real-time alerts",
            "description": "Connect to receive real-time alerts and notifications",
            "parameters": [
                {
                    "name": "client_type",
                    "in": "query",
                    "required": False,
                    "schema": {"type": "string", "default": "dashboard"},
                    "description": "Type of client connecting (dashboard, police, admin)"
                }
            ],
            "responses": {
                "101": {
                    "description": "Switching Protocols - WebSocket connection established"
                }
            }
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
