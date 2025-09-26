from fastapi import APIRouter, Depends, HTTPException, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from .models import GeoZone, LocationEvent, Alert, Tourist, PoliceStation
from .schemas import (
    ZoneCreate, ZoneUpdate, ZoneResponse, ZoneListResponse,
    TouristCreate, TouristUpdate, TouristResponse, TouristListResponse,
    LocationEventCreate, LocationEventResponse,
    AlertResponse, AlertUpdate, AlertListResponse,
    PoliceStationCreate, PoliceStationResponse, PoliceStationListResponse,
    LocationUpdateResponse, ErrorResponse
)
from .database import get_db, check_point_in_polygon, create_or_get_tourist
from .config import API_V1_STR, WEBSOCKET_URL
from .websocket_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix=API_V1_STR)

# Zone Management Routes
@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(zone_data: ZoneCreate, db: AsyncSession = Depends(get_db)):
    """Create a new geo-fence zone"""
    try:
        # Check if zone name already exists
        existing_zone = await db.execute(
            select(GeoZone).where(GeoZone.name == zone_data.name)
        )
        if existing_zone.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Zone with this name already exists"
            )
        
        # Validate WKT polygon
        try:
            # Test if the WKT is valid by creating a geometry
            test_query = text("SELECT ST_GeomFromText(:wkt, 4326)")
            await db.execute(test_query, {"wkt": zone_data.wkt_polygon})
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid WKT polygon format: {str(e)}"
            )
        
        zone = GeoZone(
            name=zone_data.name,
            description=zone_data.description,
            zone_type=zone_data.zone_type.value,
            geom=f"SRID=4326;{zone_data.wkt_polygon}",
            is_active=zone_data.is_active
        )
        
        db.add(zone)
        await db.commit()
        await db.refresh(zone)
        
        logger.info(f"Created zone: {zone.name} ({zone.zone_type})")
        return zone
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating zone: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create zone"
        )

@router.get("/zones", response_model=ZoneListResponse)
async def list_zones(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    zone_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all geo-fence zones with filtering and pagination"""
    try:
        query = select(GeoZone)
        
        # Apply filters
        if zone_type:
            query = query.where(GeoZone.zone_type == zone_type)
        if is_active is not None:
            query = query.where(GeoZone.is_active == is_active)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(GeoZone.created_at.desc())
        
        result = await db.execute(query)
        zones = result.scalars().all()
        
        return ZoneListResponse(
            zones=zones,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing zones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve zones"
        )

# GeoJSON Zones for frontend rendering
@router.get("/zones/geo")
async def list_zones_geo(
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=2000),
    only_active: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Return zones with geometry as GeoJSON for map rendering."""
    try:
        base = "SELECT id, name, description, zone_type, is_active, created_at, updated_at, ST_AsGeoJSON(geom) AS geojson FROM zones"
        where_clauses = []
        params = {}
        if only_active:
            where_clauses.append("is_active = true")
        if where_clauses:
            base += " WHERE " + " AND ".join(where_clauses)
        base += " ORDER BY created_at DESC OFFSET :skip LIMIT :limit"
        params.update({"skip": skip, "limit": limit})

        result = await db.execute(text(base), params)
        rows = result.mappings().all()
        zones = []
        for r in rows:
            try:
                zones.append({
                    "id": r["id"],
                    "name": r["name"],
                    "description": r["description"],
                    "zone_type": r["zone_type"],
                    "is_active": r["is_active"],
                    "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                    "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
                    "geometry": r["geojson"]
                })
            except Exception:
                continue
        return {"zones": zones, "total": len(zones)}
    except Exception as e:
        logger.error(f"Error listing zones geo: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve zones geo")

@router.get("/zones/{zone_id}", response_model=ZoneResponse)
async def get_zone(zone_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific zone by ID"""
    result = await db.execute(select(GeoZone).where(GeoZone.id == zone_id))
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zone not found"
        )
    
    return zone

@router.put("/zones/{zone_id}", response_model=ZoneResponse)
async def update_zone(
    zone_id: int, 
    zone_data: ZoneUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a zone"""
    result = await db.execute(select(GeoZone).where(GeoZone.id == zone_id))
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zone not found"
        )
    
    # Update fields
    update_data = zone_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "wkt_polygon" and value:
            # Validate WKT polygon
            try:
                test_query = text("SELECT ST_GeomFromText(:wkt, 4326)")
                await db.execute(test_query, {"wkt": value})
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid WKT polygon format: {str(e)}"
                )
            # Assign geometry with SRID
            zone.geom = f"SRID=4326;{value}"
        elif hasattr(zone, field):
            setattr(zone, field, value)
    
    zone.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(zone)
    
    logger.info(f"Updated zone: {zone.name}")
    return zone

@router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a zone (soft delete by setting is_active=False)"""
    result = await db.execute(select(GeoZone).where(GeoZone.id == zone_id))
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zone not found"
        )
    
    zone.is_active = False
    zone.updated_at = datetime.utcnow()
    await db.commit()

    logger.info(f"Deleted zone: {zone.name}")
    return {"message": "Zone deleted successfully"}

# Tourist Management Routes
@router.post("/tourists", response_model=TouristResponse, status_code=status.HTTP_201_CREATED)
async def create_tourist(tourist_data: TouristCreate, db: AsyncSession = Depends(get_db)):
    """Create a new tourist"""
    try:
        # Check if tourist_id already exists
        existing_tourist = await db.execute(
            select(Tourist).where(Tourist.tourist_id == tourist_data.tourist_id)
        )
        if existing_tourist.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tourist with this ID already exists"
            )
        
        tourist = Tourist(**tourist_data.dict())
        db.add(tourist)
        await db.commit()
        await db.refresh(tourist)
        
        logger.info(f"Created tourist: {tourist.tourist_id}")
        return tourist
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating tourist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tourist"
        )

@router.get("/tourists", response_model=TouristListResponse)
async def list_tourists(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all tourists with pagination"""
    try:
        query = select(Tourist)
        
        if is_active is not None:
            query = query.where(Tourist.is_active == is_active)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(Tourist.created_at.desc())
        
        result = await db.execute(query)
        tourists = result.scalars().all()
        
        return TouristListResponse(
            tourists=tourists,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing tourists: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tourists"
        )

# Location Tracking Routes
@router.post("/location", response_model=LocationUpdateResponse)
async def update_location(
    location_data: LocationEventCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Update tourist location and perform geo-fence checking"""
    try:
        # Create or get tourist
        tourist = await create_or_get_tourist(
            db, 
            location_data.tourist_id, 
            location_data.tourist_id  # Use tourist_id as name if not provided
        )
        
        # Create location event
        location_event = LocationEvent(
            tourist_id=tourist.id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            altitude=location_data.altitude,
            accuracy=location_data.accuracy,
            speed=location_data.speed,
            heading=location_data.heading,
            geom=f"SRID=4326;POINT({location_data.longitude} {location_data.latitude})"
        )
        
        db.add(location_event)
        await db.commit()
        
        # Perform geo-fence checking
        zones = await check_point_in_polygon(
            db, 
            location_data.latitude, 
            location_data.longitude
        )
        
        alerts = []
        for zone in zones:
            if zone.zone_type != "safe":
                # Determine alert type
                alert_type = "high_priority" if zone.zone_type == "restricted" else "warning"
                
                # Create alert
                alert = Alert(
                    tourist_id=tourist.id,
                    zone_id=zone.id,
                    alert_type=alert_type,
                    message=f"Tourist entered {zone.zone_type} zone: {zone.name}",
                    zone_type=zone.zone_type,
                    zone_name=zone.name,
                    latitude=location_data.latitude,
                    longitude=location_data.longitude,
                    geom=f"SRID=4326;POINT({location_data.longitude} {location_data.latitude})"
                )
                
                db.add(alert)
                alerts.append({
                    "zone_id": zone.id,
                    "zone_name": zone.name,
                    "zone_type": zone.zone_type,
                    "alert_type": alert_type,
                    "message": alert.message
                })
        
        if alerts:
            await db.commit()
            logger.info(f"Created {len(alerts)} alerts for tourist {location_data.tourist_id}")
            
            # Send real-time alerts via WebSocket
            for alert_info in alerts:
                await manager.send_alert({
                    "tourist_id": location_data.tourist_id,
                    "zone_id": alert_info["zone_id"],
                    "zone_name": alert_info["zone_name"],
                    "zone_type": alert_info["zone_type"],
                    "alert_type": alert_info["alert_type"],
                    "message": alert_info["message"],
                    "latitude": location_data.latitude,
                    "longitude": location_data.longitude
                })
        
        return LocationUpdateResponse(
            status="success",
            alerts=alerts,
            message=f"Location updated successfully. Generated {len(alerts)} alerts."
        )
        
    except Exception as e:
        logger.error(f"Error updating location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update location"
        )

@router.get("/location/{tourist_id}", response_model=List[LocationEventResponse])
async def get_tourist_locations(
    tourist_id: str,
    limit: int = Query(50, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get location history for a specific tourist"""
    try:
        # Get tourist
        tourist = await db.execute(
            select(Tourist).where(Tourist.tourist_id == tourist_id)
        )
        tourist_obj = tourist.scalar_one_or_none()
        
        if not tourist_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tourist not found"
            )
        
        # Get location events
        result = await db.execute(
            select(LocationEvent)
            .where(LocationEvent.tourist_id == tourist_obj.id)
            .order_by(LocationEvent.timestamp.desc())
            .limit(limit)
        )
        
        events = result.scalars().all()
        return events
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tourist locations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve location history"
        )

# Alert Management Routes
@router.get("/alerts", response_model=AlertListResponse)
async def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tourist_id: Optional[str] = Query(None),
    alert_type: Optional[str] = Query(None),
    zone_type: Optional[str] = Query(None),
    is_resolved: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List alerts with filtering and pagination"""
    try:
        query = select(Alert).options(
            selectinload(Alert.tourist),
            selectinload(Alert.zone)
        )
        
        # Apply filters
        if tourist_id:
            query = query.join(Tourist).where(Tourist.tourist_id == tourist_id)
        if alert_type:
            query = query.where(Alert.alert_type == alert_type)
        if zone_type:
            query = query.where(Alert.zone_type == zone_type)
        if is_resolved is not None:
            query = query.where(Alert.is_resolved == is_resolved)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(Alert.timestamp.desc())
        
        result = await db.execute(query)
        alerts = result.scalars().all()
        
        return AlertListResponse(
            alerts=alerts,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve alerts"
        )

@router.put("/alerts/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update alert status"""
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Update fields
    update_data = alert_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)
    
    if alert_data.is_resolved and not alert.is_resolved:
        alert.resolved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(alert)
    
    logger.info(f"Updated alert {alert_id}")
    return alert

@router.get("/alerts/stats")
async def get_alert_stats(db: AsyncSession = Depends(get_db)):
    """Get alert statistics"""
    try:
        # Total alerts
        total_result = await db.execute(select(func.count(Alert.id)))
        total_alerts = total_result.scalar()
        
        # Unresolved alerts
        unresolved_result = await db.execute(
            select(func.count(Alert.id)).where(Alert.is_resolved == False)
        )
        unresolved_alerts = unresolved_result.scalar()
        
        # Alerts by type
        type_result = await db.execute(
            select(Alert.alert_type, func.count(Alert.id))
            .group_by(Alert.alert_type)
        )
        alerts_by_type = dict(type_result.fetchall())
        
        # Alerts by zone type
        zone_type_result = await db.execute(
            select(Alert.zone_type, func.count(Alert.id))
            .group_by(Alert.zone_type)
        )
        alerts_by_zone_type = dict(zone_type_result.fetchall())
        
        # Recent alerts (last 24 hours)
        recent_result = await db.execute(
            select(func.count(Alert.id))
            .where(Alert.timestamp >= datetime.utcnow() - timedelta(hours=24))
        )
        recent_alerts = recent_result.scalar()
        
        return {
            "total_alerts": total_alerts,
            "unresolved_alerts": unresolved_alerts,
            "resolved_alerts": total_alerts - unresolved_alerts,
            "alerts_by_type": alerts_by_type,
            "alerts_by_zone_type": alerts_by_zone_type,
            "recent_alerts_24h": recent_alerts
        }
        
    except Exception as e:
        logger.error(f"Error getting alert stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve alert statistics"
        )

# WebSocket Routes
@router.websocket(f"{WEBSOCKET_URL}/alerts")
async def websocket_alerts(websocket: WebSocket, client_type: str = "dashboard"):
    """WebSocket endpoint for real-time alerts"""
    await manager.connect(websocket, client_type)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message from {client_type}: {data}")
            
            # Echo back the message (can be extended for command handling)
            await manager.send_personal_message({
                "type": "echo",
                "data": {"message": f"Echo: {data}"},
                "timestamp": datetime.utcnow().isoformat()
            }, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_type)
        logger.info(f"WebSocket disconnected: {client_type}")

@router.websocket(f"{WEBSOCKET_URL}/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """WebSocket endpoint for dashboard clients"""
    await websocket_alerts(websocket, "dashboard")

@router.websocket(f"{WEBSOCKET_URL}/police")
async def websocket_police(websocket: WebSocket):
    """WebSocket endpoint for police monitoring clients"""
    await websocket_alerts(websocket, "police")

@router.websocket(f"{WEBSOCKET_URL}/admin")
async def websocket_admin(websocket: WebSocket):
    """WebSocket endpoint for admin clients"""
    await websocket_alerts(websocket, "admin")

@router.get("/websocket/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return manager.get_connection_stats()

# Police Station Routes
@router.post("/police_stations", response_model=PoliceStationResponse, status_code=status.HTTP_201_CREATED)
async def create_police_station(station: PoliceStationCreate, db: AsyncSession = Depends(get_db)):
    try:
        ps = PoliceStation(
            name=station.name,
            address=station.address,
            phone=station.phone,
            latitude=station.latitude,
            longitude=station.longitude,
            geom=f"SRID=4326;POINT({station.longitude} {station.latitude})"
        )
        db.add(ps)
        await db.commit()
        await db.refresh(ps)
        return ps
    except Exception as e:
        logger.error(f"Error creating police station: {e}")
        raise HTTPException(status_code=500, detail="Failed to create police station")

@router.get("/police_stations", response_model=PoliceStationListResponse)
async def list_police_stations(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000), db: AsyncSession = Depends(get_db)):
    try:
        count_result = await db.execute(select(func.count(PoliceStation.id)))
        total = count_result.scalar()
        result = await db.execute(
            select(PoliceStation)
            .where(PoliceStation.is_active == True)
            .offset(skip).limit(limit)
            .order_by(PoliceStation.created_at.desc())
        )
        stations = result.scalars().all()
        return PoliceStationListResponse(stations=stations, total=total)
    except Exception as e:
        logger.error(f"Error listing police stations: {e}")
        raise HTTPException(status_code=500, detail="Failed to list police stations")

@router.get("/police_stations/nearest", response_model=PoliceStationListResponse)
async def nearest_police_stations(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    limit: int = Query(5, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text(
            """
            SELECT id, name, address, phone, latitude, longitude,
                   ST_Distance(geom::geography, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography) AS distance
            FROM police_stations
            WHERE is_active = true
            ORDER BY distance ASC
            LIMIT :limit
            """
        )
        result = await db.execute(query, {"lng": longitude, "lat": latitude, "limit": limit})
        rows = result.mappings().all()
        stations = []
        for r in rows:
            stations.append({
                "id": r["id"],
                "name": r["name"],
                "address": r["address"],
                "phone": r["phone"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "created_at": None,
                "updated_at": None,
                "is_active": True
            })
        return {"stations": stations, "total": len(stations)}
    except Exception as e:
        logger.error(f"Error fetching nearest police stations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch nearest police stations")

@router.put("/alerts/{alert_id}/assign", response_model=AlertResponse)
async def assign_alert_to_station(
    alert_id: int,
    station_id: int = Query(..., ge=1),
    db: AsyncSession = Depends(get_db)
):
    try:
        alert_result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert = alert_result.scalar_one_or_none()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        ps_result = await db.execute(select(PoliceStation).where(PoliceStation.id == station_id))
        station = ps_result.scalar_one_or_none()
        if not station:
            raise HTTPException(status_code=404, detail="Police station not found")

        alert.assigned_station_id = station.id
        alert.assigned_station_name = station.name
        await db.commit()
        await db.refresh(alert)
        return alert
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning alert to station: {e}")
        raise HTTPException(status_code=500, detail="Failed to assign alert")
