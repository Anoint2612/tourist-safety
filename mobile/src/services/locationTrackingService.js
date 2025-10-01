import { locationAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { setError } from '../store/reducers/locationReducer';

class LocationTrackingService {
  constructor() {
    this.intervalId = null;
    this.isTracking = false;
    this.baseUrl = 'https://c3d6c67620fe.ngrok-free.app/api/v1'; // Default base URL
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Start location tracking with dummy data
  startTracking = async () => {
    if (this.isTracking) {
      console.log('Location tracking already started');
      return;
    }

    try {
      console.log('Starting location tracking with dummy data...');
      this.isTracking = true;

      // Get user data to use as tourist_id
      const userData = await this.getUserData();
      const touristId = userData?.id || 'demo-tourist-001';
      
      console.log('Using tourist ID:', touristId);
      console.log('Base URL:', this.baseUrl);

      // Start sending location every 10 seconds
      this.intervalId = setInterval(async () => {
        try {
          await this.sendDummyLocation(touristId);
        } catch (error) {
          console.error('Error sending location:', error);
        }
      }, 10000);

      // Send initial location immediately
      try {
        await this.sendDummyLocation(touristId);
        console.log('Initial location sent successfully');
      } catch (error) {
        console.error('Error sending location:', error);
        this.retryCount++;
        
        // Update error in Redux store
        store.dispatch(setError({
          message: error.message,
          code: error.response?.status,
          timestamp: new Date().toISOString()
        }));
        
        if (this.retryCount >= this.maxRetries) {
          console.error('Max retries reached, stopping tracking');
          this.stopTracking();
          throw error;
        }
        return false;
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTracking = false;
    }
  };

  // Stop location tracking
  stopTracking = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    console.log('Location tracking stopped');
  };

  // Send location data to backend
  sendLocation = async (locationData) => {
    try {
      const userData = await this.getUserData();
      const touristId = userData?.id || 'demo-tourist-001';
      
      const locationPayload = {
        tourist_id: touristId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy || 0,
        speed: locationData.speed || 0,
        heading: locationData.heading || 0,
        timestamp: locationData.timestamp || new Date().toISOString()
      };

      console.log(`Sending location for tourist ${touristId} to ${this.baseUrl}/location`);
      
      const response = await fetch(`${this.baseUrl}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationPayload),
      });

      if (response.ok) {
        const responseData = await response.json();
        this.retryCount = 0; // Reset retry count on success
        console.log('Location sent successfully:', {
          data: locationPayload,
          response: responseData
        });
        return true;
      } else {
        const errorText = await response.text();
        const error = new Error(`Failed to send location: ${response.status} ${response.statusText}`);
        error.response = { status: response.status, data: errorText };
        throw error;
      }
    } catch (error) {
      console.error('Error sending location to server:', {
        error: error.message,
        url: `${this.baseUrl}/location`,
        data: dummyLocationData
      });
    }
  };

  // Get user data from AsyncStorage
  getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  // Update base URL
  setBaseUrl = (url) => {
    this.baseUrl = url;
  };

  // Check if currently tracking
  isCurrentlyTracking = () => {
    return this.isTracking;
  };
}

// Export singleton instance
export default new LocationTrackingService();
