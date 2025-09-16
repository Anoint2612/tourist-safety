#!/usr/bin/env python3
"""
Test script to verify the Geofencing Tourist Safety API system
"""

import requests
import time
import json
from typing import Dict, List

API_BASE_URL = "http://localhost:8000"
API_V1_URL = f"{API_BASE_URL}/api/v1"

def test_health_check():
    """Test if the API is running"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_create_zones():
    """Test zone creation"""
    print("\n🏗️ Testing zone creation...")
    
    zones = [
        {
            "name": "Test Safe Zone",
            "description": "A safe area for testing",
            "zone_type": "safe",
            "wkt_polygon": "POLYGON((91.9 25.6, 92.0 25.6, 92.0 25.7, 91.9 25.7, 91.9 25.6))",
            "is_active": True
        },
        {
            "name": "Test Risky Zone",
            "description": "A risky area for testing",
            "zone_type": "risky",
            "wkt_polygon": "POLYGON((91.95 25.65, 92.05 25.65, 92.05 25.75, 91.95 25.75, 91.95 25.65))",
            "is_active": True
        },
        {
            "name": "Test Restricted Zone",
            "description": "A restricted area for testing",
            "zone_type": "restricted",
            "wkt_polygon": "POLYGON((91.85 25.5, 91.95 25.5, 91.95 25.6, 91.85 25.6, 91.85 25.5))",
            "is_active": True
        }
    ]
    
    created_zones = []
    for zone in zones:
        try:
            response = requests.post(f"{API_V1_URL}/zones", json=zone)
            if response.status_code == 201:
                created_zone = response.json()
                created_zones.append(created_zone)
                print(f"✅ Created zone: {zone['name']} (ID: {created_zone['id']})")
            else:
                print(f"❌ Failed to create zone {zone['name']}: {response.text}")
        except Exception as e:
            print(f"❌ Exception creating zone {zone['name']}: {e}")
    
    return created_zones

def test_list_zones():
    """Test zone listing"""
    print("\n📋 Testing zone listing...")
    try:
        response = requests.get(f"{API_V1_URL}/zones")
        if response.status_code == 200:
            data = response.json()
            zones = data.get('zones', [])
            print(f"✅ Listed {len(zones)} zones")
            for zone in zones:
                print(f"   - {zone['name']} ({zone['zone_type']})")
            return zones
        else:
            print(f"❌ Failed to list zones: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Exception listing zones: {e}")
        return []

def test_create_tourist():
    """Test tourist creation"""
    print("\n👤 Testing tourist creation...")
    
    tourist_data = {
        "tourist_id": "test_tourist_001",
        "name": "Test Tourist",
        "phone": "+1234567890",
        "email": "test@example.com",
        "emergency_contact": "+1234567891"
    }
    
    try:
        response = requests.post(f"{API_V1_URL}/tourists", json=tourist_data)
        if response.status_code == 201:
            tourist = response.json()
            print(f"✅ Created tourist: {tourist['tourist_id']}")
            return tourist
        else:
            print(f"❌ Failed to create tourist: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception creating tourist: {e}")
        return None

def test_location_updates():
    """Test location updates and alert generation"""
    print("\n📍 Testing location updates...")
    
    # Test safe location (should not generate alerts)
    print("Testing safe location...")
    safe_location = {
        "tourist_id": "test_tourist_001",
        "latitude": 25.65,  # Inside safe zone
        "longitude": 91.95,
        "accuracy": 10.0,
        "speed": 1.5,
        "heading": 90.0
    }
    
    try:
        response = requests.post(f"{API_V1_URL}/location", json=safe_location)
        if response.status_code == 200:
            data = response.json()
            alerts = data.get('alerts', [])
            if not alerts:
                print("✅ Safe location - no alerts generated")
            else:
                print(f"⚠️ Safe location generated {len(alerts)} alerts (unexpected)")
        else:
            print(f"❌ Failed to update safe location: {response.text}")
    except Exception as e:
        print(f"❌ Exception updating safe location: {e}")
    
    # Test risky location (should generate warning alert)
    print("Testing risky location...")
    risky_location = {
        "tourist_id": "test_tourist_001",
        "latitude": 25.7,  # Inside risky zone
        "longitude": 92.0,
        "accuracy": 8.0,
        "speed": 2.0,
        "heading": 180.0
    }
    
    try:
        response = requests.post(f"{API_V1_URL}/location", json=risky_location)
        if response.status_code == 200:
            data = response.json()
            alerts = data.get('alerts', [])
            if alerts:
                print(f"✅ Risky location generated {len(alerts)} alerts:")
                for alert in alerts:
                    print(f"   - {alert['alert_type'].upper()}: {alert['message']}")
            else:
                print("⚠️ Risky location generated no alerts (unexpected)")
        else:
            print(f"❌ Failed to update risky location: {response.text}")
    except Exception as e:
        print(f"❌ Exception updating risky location: {e}")
    
    # Test restricted location (should generate high-priority alert)
    print("Testing restricted location...")
    restricted_location = {
        "tourist_id": "test_tourist_001",
        "latitude": 25.55,  # Inside restricted zone
        "longitude": 91.9,
        "accuracy": 12.0,
        "speed": 0.5,
        "heading": 270.0
    }
    
    try:
        response = requests.post(f"{API_V1_URL}/location", json=restricted_location)
        if response.status_code == 200:
            data = response.json()
            alerts = data.get('alerts', [])
            if alerts:
                print(f"✅ Restricted location generated {len(alerts)} alerts:")
                for alert in alerts:
                    print(f"   - {alert['alert_type'].upper()}: {alert['message']}")
            else:
                print("⚠️ Restricted location generated no alerts (unexpected)")
        else:
            print(f"❌ Failed to update restricted location: {response.text}")
    except Exception as e:
        print(f"❌ Exception updating restricted location: {e}")

def test_alert_listing():
    """Test alert listing"""
    print("\n🚨 Testing alert listing...")
    try:
        response = requests.get(f"{API_V1_URL}/alerts")
        if response.status_code == 200:
            data = response.json()
            alerts = data.get('alerts', [])
            print(f"✅ Listed {len(alerts)} alerts")
            for alert in alerts[:3]:  # Show first 3 alerts
                print(f"   - Alert {alert['id']}: {alert['message']}")
            return alerts
        else:
            print(f"❌ Failed to list alerts: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Exception listing alerts: {e}")
        return []

def test_alert_stats():
    """Test alert statistics"""
    print("\n📊 Testing alert statistics...")
    try:
        response = requests.get(f"{API_V1_URL}/alerts/stats")
        if response.status_code == 200:
            stats = response.json()
            print("✅ Alert statistics:")
            print(f"   - Total alerts: {stats.get('total_alerts', 0)}")
            print(f"   - Unresolved alerts: {stats.get('unresolved_alerts', 0)}")
            print(f"   - Recent alerts (24h): {stats.get('recent_alerts_24h', 0)}")
            print(f"   - Alerts by type: {stats.get('alerts_by_type', {})}")
            print(f"   - Alerts by zone type: {stats.get('alerts_by_zone_type', {})}")
            return stats
        else:
            print(f"❌ Failed to get alert stats: {response.text}")
            return {}
    except Exception as e:
        print(f"❌ Exception getting alert stats: {e}")
        return {}

def test_websocket_stats():
    """Test WebSocket connection statistics"""
    print("\n🔌 Testing WebSocket stats...")
    try:
        response = requests.get(f"{API_V1_URL}/websocket/stats")
        if response.status_code == 200:
            stats = response.json()
            print("✅ WebSocket statistics:")
            print(f"   - Total connections: {stats.get('total', 0)}")
            for client_type, count in stats.items():
                if client_type != 'total':
                    print(f"   - {client_type}: {count}")
            return stats
        else:
            print(f"❌ Failed to get WebSocket stats: {response.text}")
            return {}
    except Exception as e:
        print(f"❌ Exception getting WebSocket stats: {e}")
        return {}

def main():
    """Run all tests"""
    print("🧪 Starting Geofencing Tourist Safety API Tests")
    print("=" * 60)
    
    # Wait for API to be ready
    print("⏳ Waiting for API to be ready...")
    max_retries = 30
    for i in range(max_retries):
        if test_health_check():
            break
        if i == max_retries - 1:
            print("❌ API not ready after maximum retries")
            return
        time.sleep(2)
    
    print("\n🚀 Running comprehensive tests...")
    
    # Run tests
    test_create_zones()
    test_list_zones()
    test_create_tourist()
    test_location_updates()
    test_alert_listing()
    test_alert_stats()
    test_websocket_stats()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\n📖 Next steps:")
    print("1. Visit http://localhost:8000/docs for interactive API documentation")
    print("2. Connect to ws://localhost:8000/ws/alerts for real-time alerts")
    print("3. Check docker-compose logs for detailed system logs")
    print("4. Run the simulator to see live tourist movement simulation")

if __name__ == "__main__":
    main()
