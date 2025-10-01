import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { store } from '../store';
import { 
  setCurrentLocation, 
  setLocationData, 
  setError, 
  setTrackingStatus,
  setLoading 
} from '../store/reducers/locationReducer';
import locationTrackingService from './locationTrackingService';

class GlobalLocationTracker {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.options = {
      enableHighAccuracy: true,
      distanceFilter: 10, // meters
      interval: 10000, // 10 seconds
      fastestInterval: 5000, // 5 seconds
      showLocationDialog: true,
      forceRequestLocation: true,
    };
  }

  startTracking = async () => {
    const state = store.getState();
    if (this.watchId) {
      console.log('Global location tracking already started');
      return;
    }

    console.log('Starting global location tracking...');
    store.dispatch(setLoading(true));
    
    try {
      const granted = await this.requestLocationPermission();
      
      if (granted) {
        this.startWatchingPosition();
        store.dispatch(setTrackingStatus(true));
        store.dispatch(setLoading(false));
        console.log('Location permission granted, tracking started');
      } else {
        console.warn('Location permission denied');
        store.dispatch(setError({
          message: 'Location permission is required for safety features',
          code: 'PERMISSION_DENIED',
          timestamp: new Date().toISOString()
        }));
        store.dispatch(setTrackingStatus(false));
        store.dispatch(setLoading(false));
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
      store.dispatch(setError({
        message: 'Failed to start location tracking',
        code: 'TRACKING_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message
      }));
      store.dispatch(setTrackingStatus(false));
      store.dispatch(setLoading(false));
      throw error; // Re-throw to allow components to handle the error
    }
  };

  stopTracking = () => {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      store.dispatch(setTrackingStatus(false));
      console.log('Stopped global location tracking');
    }
  };

  requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for safety features.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // For iOS, permissions are handled in the native layer
    } catch (error) {
      console.error('Error requesting location permission:', error);
      store.dispatch(setError({
        message: 'Failed to request location permission',
        code: 'PERMISSION_ERROR',
        timestamp: new Date().toISOString()
      }));
      return false;
    }
  };

  startWatchingPosition = () => {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { coords, timestamp } = position;
        const locationData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed,
          heading: coords.heading,
          timestamp,
        };

        console.log('Location update:', locationData);

        // Update Redux store
        store.dispatch(setCurrentLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));

        store.dispatch(setLocationData({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed,
          heading: coords.heading,
        }));

        // Send to backend
        locationTrackingService.sendLocation(locationData);
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      this.options
    );
    this.isTracking = true;
  };

  getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          };
          
          // Log the location data
          console.log('Current location:', locationData);
          
          // Dispatch to Redux store
          if (this.store) {
            this.store.dispatch({
              type: 'location/setLocationData',
              payload: locationData
            });
          }
          
          resolve(locationData);
        },
        (error) => {
          console.error('Error getting current location:', error);
          if (this.store) {
            this.store.dispatch({
              type: 'location/setError',
              payload: error.message || 'Failed to get current location'
            });
          }
          reject(error);
        },
        this.options
      );
    });
  };
}

// Export singleton instance
export default new GlobalLocationTracker();
