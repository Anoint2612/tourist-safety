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
  
  const { currentLocation, isTracking, locationHistory, geofences } = useSelector(state => state.location);
  const { user } = useSelector(state => state.auth);
  
  const [region, setRegion] = useState({
    latitude: 28.6139, // Delhi coordinates as default
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showGeofences, setShowGeofences] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Sample geofences data
  const sampleGeofences = [
    {
      id: '1',
      name: 'High Risk Area',
      coordinates: [
        { latitude: 28.6139, longitude: 77.2090 },
        { latitude: 28.6149, longitude: 77.2100 },
        { latitude: 28.6159, longitude: 77.2110 },
        { latitude: 28.6169, longitude: 77.2120 },
      ],
      riskLevel: 'high',
      color: '#FF5722',
    },
    {
      id: '2',
      name: 'Medium Risk Area',
      coordinates: [
        { latitude: 28.6200, longitude: 77.2200 },
        { latitude: 28.6210, longitude: 77.2210 },
        { latitude: 28.6220, longitude: 77.2220 },
        { latitude: 28.6230, longitude: 77.2230 },
      ],
      riskLevel: 'medium',
      color: '#FF9800',
    },
  ];

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

        {/* Safety Zones (Police Stations, Hospitals) */}
        <Marker
          coordinate={{ latitude: 28.6149, longitude: 77.2099 }}
          title="Police Station"
          description="Emergency Services"
          pinColor="#FF5722"
        />
        <Marker
          coordinate={{ latitude: 28.6159, longitude: 77.2109 }}
          title="Hospital"
          description="Medical Emergency"
          pinColor="#4CAF50"
        />
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
                  Speed: {currentLocation.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="compass" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Accuracy: {currentLocation.accuracy?.toFixed(0)}m
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

const styles = StyleSheet.create({
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