# Location Tracking Implementation

This document explains how the location tracking feature works in the mobile app.

## Overview

The app automatically sends dummy location data to the backend server every 5 seconds when the user is authenticated and on the main app screens (MainTabs). The tracking stops when the user logs out or navigates to authentication screens.

## Implementation Details

### Location Tracking Service

The `LocationTrackingService` (`src/services/locationTrackingService.js`) is a singleton class that handles:

- Starting/stopping location tracking
- Sending dummy location data every 5 seconds
- Error handling and retry logic
- User data retrieval for tourist ID

### Navigation Integration

The `AppNavigator` (`src/navigation/AppNavigator.js`) automatically:

- Starts location tracking when user is authenticated and on MainTabs
- Stops location tracking when user is not authenticated or on Auth screens
- Handles cleanup on app unmount

### API Integration

The location data is sent via POST request to:
```
POST {{baseUrl}}/location
```

With the following payload:
```json
{
  "tourist_id": "user-id-or-demo-tourist-001",
  "latitude": 13.3439,
  "longitude": 74.7475,
  "accuracy": 5,
  "speed": 0,
  "heading": 0
}
```

## Configuration

### Base URL
The default base URL is `http://10.20.57.131:5000`. This can be updated by calling:
```javascript
LocationTrackingService.setBaseUrl('your-new-url');
```

### Tracking Interval
Currently set to 5 seconds. This is hardcoded in the service but can be easily modified.

## Usage

The location tracking is automatically managed by the navigation system. No manual intervention is required.

### Manual Control (if needed)

```javascript
import LocationTrackingService from './src/services/locationTrackingService';

// Start tracking
await LocationTrackingService.startTracking();

// Stop tracking
LocationTrackingService.stopTracking();

// Check if currently tracking
const isTracking = LocationTrackingService.isCurrentlyTracking();
```

## Error Handling

The service includes:
- Network error handling
- Retry logic (currently disabled but can be enabled)
- Detailed logging for debugging
- Graceful fallback to default tourist ID

## Testing

Run the tests with:
```bash
npm test locationTrackingService.test.js
```

## Logs

The service logs detailed information to the console:
- When tracking starts/stops
- Each location send attempt
- Success/failure responses
- Error details

Look for logs prefixed with "Location tracking" or "Dummy location" in the console.
