from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging
from datetime import datetime
from .schemas import WebSocketMessage

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections by client type
        self.active_connections: Dict[str, List[WebSocket]] = {
            "dashboard": [],
            "police": [],
            "admin": []
        }
    
    async def connect(self, websocket: WebSocket, client_type: str = "dashboard"):
        """Accept a WebSocket connection"""
        await websocket.accept()
        if client_type not in self.active_connections:
            client_type = "dashboard"
        
        self.active_connections[client_type].append(websocket)
        logger.info(f"WebSocket connected: {client_type} (total: {len(self.active_connections[client_type])})")
        
        # Send welcome message
        welcome_msg = WebSocketMessage(
            type="connection",
            data={
                "message": f"Connected as {client_type}",
                "client_type": client_type,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        await self.send_personal_message(welcome_msg.dict(), websocket)
    
    def disconnect(self, websocket: WebSocket, client_type: str = "dashboard"):
        """Remove a WebSocket connection"""
        if client_type in self.active_connections:
            try:
                self.active_connections[client_type].remove(websocket)
                logger.info(f"WebSocket disconnected: {client_type} (total: {len(self.active_connections[client_type])})")
            except ValueError:
                pass
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_type(self, message: dict, client_type: str):
        """Broadcast a message to all connections of a specific type"""
        if client_type not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[client_type]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to {client_type}: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.active_connections[client_type].remove(connection)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected clients"""
        for client_type in self.active_connections:
            await self.broadcast_to_type(message, client_type)
    
    async def send_alert(self, alert_data: dict):
        """Send an alert to all connected clients"""
        message = WebSocketMessage(
            type="alert",
            data={
                "alert": alert_data,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # Send to all client types
        await self.broadcast_to_all(message.dict())
        logger.info(f"Alert broadcasted to all clients: {alert_data.get('message', 'Unknown alert')}")
    
    async def send_zone_update(self, zone_data: dict):
        """Send zone update to admin clients"""
        message = WebSocketMessage(
            type="zone_update",
            data={
                "zone": zone_data,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        await self.broadcast_to_type(message.dict(), "admin")
        logger.info(f"Zone update sent to admin clients: {zone_data.get('name', 'Unknown zone')}")
    
    async def send_location_update(self, location_data: dict):
        """Send location update to dashboard clients"""
        message = WebSocketMessage(
            type="location_update",
            data={
                "location": location_data,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        await self.broadcast_to_type(message.dict(), "dashboard")
    
    def get_connection_stats(self) -> dict:
        """Get statistics about active connections"""
        stats = {}
        total_connections = 0
        
        for client_type, connections in self.active_connections.items():
            count = len(connections)
            stats[client_type] = count
            total_connections += count
        
        stats["total"] = total_connections
        return stats

# Global connection manager instance
manager = ConnectionManager()
