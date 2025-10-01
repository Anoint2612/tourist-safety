import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLocation: null,
  locationHistory: [],
  isTracking: true,
  lastUpdateTime: null,
  accuracy: null,
  speed: null,
  heading: null,
  geofences: [],
  currentGeofence: null,
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      state.lastUpdateTime = new Date().toISOString();
      
      // Add to history (keep last 100 locations)
      state.locationHistory.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
      
      if (state.locationHistory.length > 100) {
        state.locationHistory = state.locationHistory.slice(-100);
      }
    },
    setLocationData: (state, action) => {
      const { latitude, longitude, accuracy, speed, heading } = action.payload;
      state.currentLocation = { latitude, longitude };
      state.accuracy = accuracy;
      state.speed = speed;
      state.heading = heading;
      state.lastUpdateTime = new Date().toISOString();
      
      // Add to history
      state.locationHistory.push({
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        timestamp: new Date().toISOString(),
      });
      
      if (state.locationHistory.length > 100) {
        state.locationHistory = state.locationHistory.slice(-100);
      }
    },
    setTrackingStatus: (state, action) => {
      state.isTracking = action.payload;
    },
    setGeofences: (state, action) => {
      state.geofences = action.payload;
    },
    setCurrentGeofence: (state, action) => {
      state.currentGeofence = action.payload;
    },
    clearLocationHistory: (state) => {
      state.locationHistory = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentLocation,
  setLocationData,
  setTrackingStatus,
  setGeofences,
  setCurrentGeofence,
  clearLocationHistory,
  setLoading,
  setError,
  clearError,
} = locationSlice.actions;

export default locationSlice.reducer;
