import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trips: [],
  activeTrip: null,
  tripHistory: [],
  loading: false,
  error: null,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    addTrip: (state, action) => {
      const trip = {
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        createdAt: action.payload.createdAt || new Date().toISOString(),
        status: action.payload.status || 'planned',
      };
      
      state.trips.unshift(trip);
      
      if (trip.status === 'active') {
        state.activeTrip = trip;
      }
    },
    updateTrip: (state, action) => {
      const { id, updates } = action.payload;
      const tripIndex = state.trips.findIndex(trip => trip.id === id);
      
      if (tripIndex !== -1) {
        state.trips[tripIndex] = { ...state.trips[tripIndex], ...updates };
        
        if (updates.status === 'active') {
          state.activeTrip = state.trips[tripIndex];
        } else if (updates.status === 'completed' || updates.status === 'cancelled') {
          if (state.activeTrip && state.activeTrip.id === id) {
            state.activeTrip = null;
          }
          // Move to history
          state.tripHistory.unshift(state.trips[tripIndex]);
        }
      }
    },
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
    },
    completeTrip: (state, action) => {
      const tripId = action.payload;
      const trip = state.trips.find(t => t.id === tripId);
      
      if (trip) {
        trip.status = 'completed';
        trip.completedAt = new Date().toISOString();
        
        if (state.activeTrip && state.activeTrip.id === tripId) {
          state.activeTrip = null;
        }
        
        // Move to history
        state.tripHistory.unshift(trip);
      }
    },
    cancelTrip: (state, action) => {
      const tripId = action.payload;
      const trip = state.trips.find(t => t.id === tripId);
      
      if (trip) {
        trip.status = 'cancelled';
        trip.cancelledAt = new Date().toISOString();
        
        if (state.activeTrip && state.activeTrip.id === tripId) {
          state.activeTrip = null;
        }
      }
    },
    removeTrip: (state, action) => {
      const tripId = action.payload;
      state.trips = state.trips.filter(trip => trip.id !== tripId);
      
      if (state.activeTrip && state.activeTrip.id === tripId) {
        state.activeTrip = null;
      }
    },
    setTrips: (state, action) => {
      state.trips = action.payload;
      state.activeTrip = action.payload.find(trip => trip.status === 'active') || null;
    },
    setTripHistory: (state, action) => {
      state.tripHistory = action.payload;
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
  addTrip,
  updateTrip,
  setActiveTrip,
  completeTrip,
  cancelTrip,
  removeTrip,
  setTrips,
  setTripHistory,
  setLoading,
  setError,
  clearError,
} = tripSlice.actions;

export default tripSlice.reducer;
