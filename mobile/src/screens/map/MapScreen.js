import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, Circle, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, Text, useTheme, Card, Title, FAB, Chip } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentLocation, setTrackingStatus, addAlert } from '../../store/reducers/locationReducer';
import Geolocation from '@react-native-community/geolocation';
import { addAlert as addAlertAction } from '../../store/reducers/alertReducer';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  
  const { currentLocation, isTracking, locationHistory, geofences, accuracy, speed, heading, lastUpdateTime } = useSelector(state => state.location);
  const { user } = useSelector(state => state.auth);

  // Log location data when it changes
  useEffect(() => {
    console.log('Current Location:', {
      coords: currentLocation,
      accuracy,
      speed,
      heading,
      lastUpdateTime,
      isTracking
    });
    
    if (locationHistory.length > 0) {
      console.log('Last 5 location history entries:', 
        locationHistory.slice(-5).map(entry => ({
          coords: { latitude: entry.latitude, longitude: entry.longitude },
          timestamp: entry.timestamp
        }))
      );
    }
    
    console.log('Geofences:', geofences);
  }, [currentLocation, locationHistory, geofences, accuracy, speed, heading, lastUpdateTime, isTracking]);
  
  const [region, setRegion] = useState({
    latitude: 26.2006, // Center of Assam
    longitude: 92.9376,
    latitudeDelta: 2.0, // Wider view to see more of Assam
    longitudeDelta: 2.0,
  });
  const [showGeofences, setShowGeofences] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Sample geofences data around Assam
  const sampleGeofences = [
    {
      id: '1',
      name: 'High Risk Area - Guwahati City Center',
      coordinates: [
        { latitude: 26.1880, longitude: 91.7450 }, // NW
        { latitude: 26.1880, longitude: 91.7850 }, // NE
        { latitude: 26.1580, longitude: 91.7850 }, // SE
        { latitude: 26.1580, longitude: 91.7450 }, // SW
      ],
      riskLevel: 'high',
      color: '#FF5722',
    },
    {
      id: '2',
      name: 'Medium Risk Area - Jorhat',
      coordinates: [
        { latitude: 26.7600, longitude: 94.2000 }, // NW
        { latitude: 26.7600, longitude: 94.2400 }, // NE
        { latitude: 26.7200, longitude: 94.2400 }, // SE
        { latitude: 26.7200, longitude: 94.2000 }, // SW
      ],
      riskLevel: 'medium',
      color: '#FF9800',
    },
    {
      id: '3',
      name: 'Low Risk Area - Kaziranga',
      coordinates: [
        { latitude: 26.4000, longitude: 93.2500 }, // NW
        { latitude: 26.4000, longitude: 93.3500 }, // NE
        { latitude: 26.3000, longitude: 93.3500 }, // SE
        { latitude: 26.3000, longitude: 93.2500 }, // SW
      ],
      riskLevel: 'low',
      color: '#4CAF50',
    }
  ];

  // Safety spots data (police stations, hospitals, etc.)
  const safetySpots = [
    // Police Stations
    {
      id: 'ps1',
      type: 'police',
      name: 'Guwahati Police Station',
      coordinate: { latitude: 26.1445, longitude: 91.7362 },
      description: '24/7 Emergency Services',
      contact: '0361-2540135'
    },
    {
      id: 'ps2',
      type: 'police',
      name: 'Dispur Police Station',
      coordinate: { latitude: 26.1399, longitude: 91.7905 },
      description: 'Women Safety Cell',
      contact: '0361-2220280'
    },
    // Hospitals
    {
      id: 'h1',
      type: 'hospital',
      name: 'Gauhati Medical College',
      coordinate: { latitude: 26.1459, longitude: 91.7352 },
      description: '24/7 Emergency & Trauma Care',
      contact: '0361-2529463'
    },
    {
      id: 'h2',
      type: 'hospital',
      name: 'Hayat Hospital',
      coordinate: { latitude: 26.0863, longitude: 91.5757 },
      description: 'Multi-specialty Hospital',
      contact: '0361-7120000'
    },
    // Tourist Police
    {
      id: 'tp1',
      type: 'tourist_police',
      name: 'Kaziranga Tourist Police',
      coordinate: { latitude: 26.5739, longitude: 93.1735 },
      description: 'Tourist Assistance Center',
      contact: '0361-2540135'
    },
    // Fire Stations
    {
      id: 'fs1',
      type: 'fire_station',
      name: 'Guwahati Fire Station',
      coordinate: { latitude: 26.1829, longitude: 91.7462 },
      description: 'Emergency Fire Services',
      contact: '101'
    }
  ];
  
  // Log the geofence details
  useEffect(() => {
    console.log('Geofences initialized:', sampleGeofences.map(fence => ({
      id: fence.id,
      name: fence.name,
      bounds: {
        minLat: Math.min(...fence.coordinates.map(c => c.latitude)),
        maxLat: Math.max(...fence.coordinates.map(c => c.latitude)),
        minLng: Math.min(...fence.coordinates.map(c => c.longitude)),
        maxLng: Math.max(...fence.coordinates.map(c => c.longitude))
      },
      area: calculateArea(fence.coordinates) + ' km²'
    })));
  }, []);
  
  // Helper function to calculate area of a polygon in square kilometers
  const calculateArea = (coordinates) => {
    if (coordinates.length < 3) return 0;
    
    // Convert coordinates to radians
    const coords = coordinates.map(coord => ({
      lat: (coord.latitude * Math.PI) / 180,
      lng: (coord.longitude * Math.PI) / 180
    }));
    
    // Calculate area using spherical excess formula
    let area = 0;
    const R = 6371; // Earth's radius in km
    
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += (coords[j].lng - coords[i].lng) * 
              (2 + Math.sin(coords[i].lat) + Math.sin(coords[j].lat));
    }
    
    area = Math.abs(area * R * R / 2);
    return area.toFixed(2);
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (permissionGranted && isTracking) {
      startLocationTracking();
    }
  }, [permissionGranted, isTracking]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide safety features.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
        } else {
          Alert.alert('Permission Denied', 'Location permission is required for safety features.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  const startLocationTracking = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: new Date().toISOString(),
        };

        dispatch(setCurrentLocation(locationData));
        console.log("Location : ", locationData);

        // Update map region
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Check geofences
        checkGeofences(latitude, longitude);

        // Animate to new location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000,
      }
    );

    return watchId;
  };

  const checkGeofences = (latitude, longitude) => {
    sampleGeofences.forEach(geofence => {
      if (isPointInPolygon(latitude, longitude, geofence.coordinates)) {
        // User entered a geofenced area
        const alertData = {
          type: 'geofence',
          message: `You have entered a ${geofence.riskLevel} risk area: ${geofence.name}`,
          location: { latitude, longitude },
          geofenceId: geofence.id,
          riskLevel: geofence.riskLevel,
          timestamp: new Date().toISOString(),
          priority: geofence.riskLevel === 'high' ? 'high' : 'medium',
        };

        dispatch(addAlert(alertData));
        dispatch(addAlertAction(alertData));

        // Show alert
        Alert.alert(
          'Geofence Alert',
          `You have entered a ${geofence.riskLevel} risk area: ${geofence.name}`,
          [
            { text: 'OK' },
            { 
              text: 'Panic', 
              style: 'destructive',
              onPress: () => navigation.navigate('Panic')
            }
          ]
        );
      }
    });
  };

  const isPointInPolygon = (lat, lng, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].longitude > lng !== polygon[j].longitude > lng &&
        lat < ((polygon[j].latitude - polygon[i].latitude) * (lng - polygon[i].longitude)) / (polygon[j].longitude - polygon[i].longitude) + polygon[i].latitude
      ) {
        inside = !inside;
      }
    }
    return inside;
  };

  const toggleTracking = () => {
    dispatch(setTrackingStatus(!isTracking));
  };

  const centerOnUser = () => {
    console.log("currentLocation :", currentLocation);
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={setRegion}
      >
        {/* User Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            description={`Accuracy: ${currentLocation.accuracy?.toFixed(0)}m`}
            pinColor={isTracking ? '#4CAF50' : '#2196F3'}
          />
        )}

        {/* Location History Trail */}
        {showHistory && locationHistory.map((location, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor="#9E9E9E"
            title={`Location ${index + 1}`}
            description={new Date(location.timestamp).toLocaleTimeString()}
          />
        ))}

        {/* Geofences */}
        {showGeofences && sampleGeofences.map((geofence) => (
          <Polygon
            key={geofence.id}
            coordinates={geofence.coordinates}
            fillColor={`${getRiskColor(geofence.riskLevel)}30`}
            strokeColor={getRiskColor(geofence.riskLevel)}
            strokeWidth={2}
          />
        ))}

        {/* Safety Spots */}
        {safetySpots.map(spot => (
          <Marker
            key={spot.id}
            coordinate={spot.coordinate}
            title={spot.name}
            description={spot.description}
            pinColor={{
              police: '#2196F3',
              hospital: '#4CAF50',
              tourist_police: '#9C27B0',
              fire_station: '#FF5722'
            }[spot.type] || '#607D8B'}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.markerBubble,
                { 
                  backgroundColor: {
                    police: '#2196F3',
                    hospital: '#4CAF50',
                    tourist_police: '#9C27B0',
                    fire_station: '#FF5722'
                  }[spot.type] || '#607D8B'
                }
              ]}>
                <Text style={styles.markerText}>
                  {spot.type === 'police' ? '👮' : 
                   spot.type === 'hospital' ? '🏥' :
                   spot.type === 'tourist_police' ? '👮‍♂️' :
                   '🚒'}
                </Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <Card style={[styles.controlCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.controlContent}>
            <View style={styles.controlRow}>
              <Button
                mode={isTracking ? 'contained' : 'outlined'}
                onPress={toggleTracking}
                icon="crosshairs-gps"
                style={styles.controlButton}
                labelStyle={styles.controlButtonLabel}
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={centerOnUser}
                icon="target"
                style={styles.controlButton}
                labelStyle={styles.controlButtonLabel}
              >
                Center
              </Button>
            </View>
            
            <View style={styles.controlRow}>
              <Chip
                selected={showGeofences}
                onPress={() => setShowGeofences(!showGeofences)}
                icon="map-marker"
                style={styles.chip}
              >
                Risk Zones
              </Chip>
              
              <Chip
                selected={showHistory}
                onPress={() => setShowHistory(!showHistory)}
                icon="history"
                style={styles.chip}
              >
                History
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Bottom Info Panel */}
      {currentLocation && (
        <View style={styles.bottomPanel}>
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={[styles.infoTitle, { color: theme.colors.primary }]}>
                Location Info
              </Title>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Lat: {currentLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Lng: {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="speedometer" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Speed: {`${(speed * 3.6).toFixed(1)} km/h`}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="compass" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Accuracy: {accuracy ? accuracy.toFixed(0) : 'N/A'}m
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          icon="alert-circle"
          style={[styles.fab, { backgroundColor: theme.colors.error }]}
          onPress={() => navigation.navigate('Panic')}
          label="Emergency"
        />
      </View>
    </View>
  );
};

// Get appropriate emoji for each safety spot type
const getSpotEmoji = (type) => {
  switch(type) {
    case 'police': return '👮';
    case 'hospital': return '🏥';
    case 'tourist_police': return '👮‍♂️';
    case 'fire_station': return '🚒';
    default: return '📍';
  }
};

const styles = StyleSheet.create({
  markerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  markerBubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#FF5A5F',
    padding: 8,
    borderRadius: 20,
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF5A5F',
    transform: [{ rotate: '180deg' }],
    marginTop: -1,
  },
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  controlCard: {
    elevation: 4,
  },
  controlContent: {
    paddingVertical: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  controlButtonLabel: {
    fontSize: 12,
  },
  chip: {
    marginHorizontal: 4,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  infoCard: {
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    elevation: 4,
  },
});

export default MapScreen;