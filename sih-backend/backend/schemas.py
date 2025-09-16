from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ZoneType(str, Enum):
    SAFE = "safe"
    RISKY = "risky"
    RESTRICTED = "restricted"

class AlertType(str, Enum):
    WARNING = "warning"
    HIGH_PRIORITY = "high_priority"

# Zone Schemas
class ZoneBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    zone_type: ZoneType
    wkt_polygon: str = Field(..., description="WKT polygon string (e.g., 'POLYGON((91.9 25.6, 92.0 25.6, 92.0 25.7, 91.9 25.7, 91.9 25.6))')")
    is_active: bool = True

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    zone_type: Optional[ZoneType] = None
    wkt_polygon: Optional[str] = None
    is_active: Optional[bool] = None

class ZoneResponse(ZoneBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Tourist Schemas
class TouristBase(BaseModel):
    tourist_id: str = Field(..., min_length=1, max_length=100)
    name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    emergency_contact: Optional[str] = Field(None, max_length=20)

class TouristCreate(TouristBase):
    pass

class TouristUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    emergency_contact: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None

class TouristResponse(TouristBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Location Event Schemas
class LocationEventBase(BaseModel):
    tourist_id: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None
    accuracy: Optional[float] = Field(None, ge=0)
    speed: Optional[float] = Field(None, ge=0)
    heading: Optional[float] = Field(None, ge=0, le=360)

class LocationEventCreate(LocationEventBase):
    pass

class LocationEventResponse(LocationEventBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    tourist_id: str
    zone_type: ZoneType
    zone_name: Optional[str] = None
    latitude: float
    longitude: float
    message: str

class AlertResponse(AlertBase):
    id: int
    zone_id: Optional[int]
    alert_type: AlertType
    is_resolved: bool
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None
    resolved_by: Optional[str] = Field(None, max_length=255)

# Response Schemas
class LocationUpdateResponse(BaseModel):
    status: str
    alerts: List[dict] = []
    message: str = "Location updated successfully"

class ZoneListResponse(BaseModel):
    zones: List[ZoneResponse]
    total: int
    page: int
    size: int

class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int
    page: int
    size: int

class TouristListResponse(BaseModel):
    tourists: List[TouristResponse]
    total: int
    page: int
    size: int

# Error Schemas
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# WebSocket Schemas
class WebSocketMessage(BaseModel):
    type: str
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
