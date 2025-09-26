from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
import uuid

Base = declarative_base()

class GeoZone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    zone_type = Column(String(50), nullable=False)  # safe, risky, restricted
    geom = Column(Geometry("POLYGON", srid=4326), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    alerts = relationship("Alert", back_populates="zone")

class Tourist(Base):
    __tablename__ = "tourists"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tourist_id = Column(String(100), nullable=False, unique=True, index=True)
    name = Column(String(255))
    phone = Column(String(20))
    email = Column(String(255))
    emergency_contact = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    location_events = relationship("LocationEvent", back_populates="tourist")
    alerts = relationship("Alert", back_populates="tourist")

class LocationEvent(Base):
    __tablename__ = "location_events"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(String(36), ForeignKey("tourists.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float)
    accuracy = Column(Float)  # GPS accuracy in meters
    speed = Column(Float)  # Speed in m/s
    heading = Column(Float)  # Direction in degrees
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    tourist = relationship("Tourist", back_populates="location_events")

class PoliceStation(Base):
    __tablename__ = "police_stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    phone = Column(String(50))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_alerts = relationship("Alert", back_populates="assigned_station")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(String(36), ForeignKey("tourists.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)  # warning, high_priority
    message = Column(Text, nullable=False)
    zone_type = Column(String(50), nullable=False)  # risky, restricted
    zone_name = Column(String(255))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(String(255))
    assigned_station_id = Column(Integer, ForeignKey("police_stations.id"), nullable=True)
    assigned_station_name = Column(String(255))
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    tourist = relationship("Tourist", back_populates="alerts")
    zone = relationship("GeoZone", back_populates="alerts")
    assigned_station = relationship("PoliceStation", back_populates="assigned_alerts")