import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin@localhost:5432/geofencing")

# API configuration
API_V1_STR = "/api/v1"
PROJECT_NAME = "Geofencing Tourist Safety API"

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# WebSocket configuration
WEBSOCKET_URL = "/ws"

# Alert configuration
ALERT_RETENTION_DAYS = 30
MAX_ALERTS_PER_TOURIST = 1000

# Zone configuration
MAX_ZONES_PER_TYPE = 100
