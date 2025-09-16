import requests
import time
import random
import datetime
import json
import math
from typing import List, Dict, Tuple

# Configuration
API_BASE_URL = "http://backend:8000"
LOCATION_ENDPOINT = f"{API_BASE_URL}/api/v1/location"
ZONE_ENDPOINT = f"{API_BASE_URL}/api/v1/zones"

# Tourist configurations
TOURISTS = [
    {
        "id": "tourist_001",
        "name": "Alice Johnson",
        "phone": "+1234567890",
        "email": "alice@example.com",
        "emergency_contact": "+1234567891",
        "start_lat": 25.6,
        "start_lng": 91.9,
        "movement_pattern": "random_walk",
        "speed": 0.0001,  # degrees per update
        "update_interval": 5
    },
    {
        "id": "tourist_002", 
        "name": "Bob Smith",
        "phone": "+1234567892",
        "email": "bob@example.com",
        "emergency_contact": "+1234567893",
        "start_lat": 25.65,
        "start_lng": 91.95,
        "movement_pattern": "linear_path",
        "speed": 0.0002,
        "update_interval": 3
    },
    {
        "id": "tourist_003",
        "name": "Carol Davis",
        "phone": "+1234567894", 
        "email": "carol@example.com",
        "emergency_contact": "+1234567895",
        "start_lat": 25.55,
        "start_lng": 91.85,
        "movement_pattern": "circular",
        "speed": 0.00015,
        "update_interval": 4
    },
    {
        "id": "tourist_004",
        "name": "David Wilson",
        "phone": "+1234567896",
        "email": "david@example.com", 
        "emergency_contact": "+1234567897",
        "start_lat": 25.7,
        "start_lng": 92.0,
        "movement_pattern": "random_walk",
        "speed": 0.00008,
        "update_interval": 6
    },
    {
        "id": "tourist_005",
        "name": "Eva Brown",
        "phone": "+1234567898",
        "email": "eva@example.com",
        "emergency_contact": "+1234567899", 
        "start_lat": 25.5,
        "start_lng": 92.05,
        "movement_pattern": "linear_path",
        "speed": 0.00012,
        "update_interval": 7
    }
]

class TouristSimulator:
    def __init__(self, tourist_config: Dict):
        self.config = tourist_config
        self.current_lat = tourist_config["start_lat"]
        self.current_lng = tourist_config["start_lng"]
        self.direction = random.uniform(0, 2 * math.pi)
        self.path_progress = 0.0
        self.circle_center_lat = tourist_config["start_lat"]
        self.circle_center_lng = tourist_config["start_lng"]
        self.circle_radius = 0.01  # degrees
        self.circle_angle = 0.0
        
    def update_position(self) -> Tuple[float, float]:
        """Update tourist position based on movement pattern"""
        if self.config["movement_pattern"] == "random_walk":
            return self._random_walk()
        elif self.config["movement_pattern"] == "linear_path":
            return self._linear_path()
        elif self.config["movement_pattern"] == "circular":
            return self._circular_movement()
        else:
            return self._random_walk()
    
    def _random_walk(self) -> Tuple[float, float]:
        """Random walk movement pattern"""
        # Random direction change
        if random.random() < 0.3:  # 30% chance to change direction
            self.direction += random.uniform(-math.pi/4, math.pi/4)
        
        # Move in current direction
        distance = self.config["speed"] * random.uniform(0.5, 1.5)
        self.current_lat += distance * math.cos(self.direction)
        self.current_lng += distance * math.sin(self.direction)
        
        # Add some randomness
        self.current_lat += random.uniform(-0.0001, 0.0001)
        self.current_lng += random.uniform(-0.0001, 0.0001)
        
        return self.current_lat, self.current_lng
    
    def _linear_path(self) -> Tuple[float, float]:
        """Linear path movement pattern"""
        # Move along a straight line
        self.path_progress += self.config["speed"]
        
        # Define path endpoints
        start_lat, start_lng = self.config["start_lat"], self.config["start_lng"]
        end_lat = start_lat + 0.02
        end_lng = start_lng + 0.02
        
        # Interpolate position
        progress = min(self.path_progress / 0.1, 1.0)  # Normalize progress
        if progress >= 1.0:
            # Reset to start
            self.path_progress = 0.0
            progress = 0.0
        
        self.current_lat = start_lat + (end_lat - start_lat) * progress
        self.current_lng = start_lng + (end_lng - start_lng) * progress
        
        return self.current_lat, self.current_lng
    
    def _circular_movement(self) -> Tuple[float, float]:
        """Circular movement pattern"""
        self.circle_angle += self.config["speed"] * 10  # Convert to angle increment
        
        # Calculate position on circle
        self.current_lat = self.circle_center_lat + self.circle_radius * math.cos(self.circle_angle)
        self.current_lng = self.circle_center_lng + self.circle_radius * math.sin(self.circle_angle)
        
        return self.current_lat, self.current_lng
    
    def send_location_update(self) -> bool:
        """Send location update to API"""
        lat, lng = self.update_position()
        
        payload = {
            "tourist_id": self.config["id"],
            "latitude": lat,
            "longitude": lng,
            "accuracy": random.uniform(5, 15),  # GPS accuracy in meters
            "speed": random.uniform(0, 5),  # Speed in m/s
            "heading": random.uniform(0, 360)  # Direction in degrees
        }
        
        try:
            response = requests.post(LOCATION_ENDPOINT, json=payload)
            if response.status_code == 200:
                data = response.json()
                alerts = data.get("alerts", [])
                if alerts:
                    print(f"🚨 {self.config['name']} ({self.config['id']}) generated {len(alerts)} alerts:")
                    for alert in alerts:
                        print(f"   - {alert['alert_type'].upper()}: {alert['message']}")
                else:
                    print(f"✅ {self.config['name']} ({self.config['id']}) at ({lat:.6f}, {lng:.6f}) - Safe")
                return True
            else:
                print(f"❌ Error for {self.config['name']}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Exception for {self.config['name']}: {e}")
            return False

def create_sample_zones():
    """Create sample zones for testing"""
    zones = [
        {
            "name": "Safe Tourist Area",
            "description": "Main tourist area with shops and restaurants",
            "zone_type": "safe",
            "wkt_polygon": "POLYGON((91.9 25.6, 92.0 25.6, 92.0 25.7, 91.9 25.7, 91.9 25.6))",
            "is_active": True
        },
        {
            "name": "Risky Construction Zone",
            "description": "Construction area with potential hazards",
            "zone_type": "risky", 
            "wkt_polygon": "POLYGON((91.95 25.65, 92.05 25.65, 92.05 25.75, 91.95 25.75, 91.95 25.65))",
            "is_active": True
        },
        {
            "name": "Restricted Military Area",
            "description": "Off-limits military installation",
            "zone_type": "restricted",
            "wkt_polygon": "POLYGON((91.85 25.5, 91.95 25.5, 91.95 25.6, 91.85 25.6, 91.85 25.5))",
            "is_active": True
        },
        {
            "name": "Emergency Zone",
            "description": "High-risk emergency area",
            "zone_type": "restricted",
            "wkt_polygon": "POLYGON((92.0 25.5, 92.1 25.5, 92.1 25.6, 92.0 25.6, 92.0 25.5))",
            "is_active": True
        }
    ]
    
    print("🏗️ Creating sample zones...")
    for zone in zones:
        try:
            response = requests.post(f"{ZONE_ENDPOINT}", json=zone)
            if response.status_code == 201:
                print(f"✅ Created zone: {zone['name']} ({zone['zone_type']})")
            else:
                print(f"❌ Failed to create zone {zone['name']}: {response.text}")
        except Exception as e:
            print(f"❌ Exception creating zone {zone['name']}: {e}")

def main():
    """Main simulation loop"""
    print("🚀 Starting Tourist Location Simulator")
    print("=" * 50)
    
    # Wait for backend to be ready
    print("⏳ Waiting for backend to be ready...")
    max_retries = 30
    for i in range(max_retries):
        try:
            response = requests.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                print("✅ Backend is ready!")
                break
        except Exception as e:
            if i == max_retries - 1:
                print(f"❌ Backend not ready after {max_retries} retries: {e}")
                return
            time.sleep(2)
    
    # Create sample zones
    create_sample_zones()
    print()
    
    # Initialize tourist simulators
    simulators = [TouristSimulator(tourist) for tourist in TOURISTS]
    
    print(f"👥 Starting simulation for {len(simulators)} tourists...")
    print("Press Ctrl+C to stop the simulation")
    print("=" * 50)
    
    try:
        while True:
            for simulator in simulators:
                simulator.send_location_update()
                time.sleep(simulator.config["update_interval"])
            
            print("-" * 30)
            time.sleep(2)  # Brief pause between rounds
            
    except KeyboardInterrupt:
        print("\n🛑 Simulation stopped by user")
    except Exception as e:
        print(f"\n❌ Simulation error: {e}")

if __name__ == "__main__":
    main()
