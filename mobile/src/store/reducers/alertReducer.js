import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: [],
  unreadCount: 0,
  panicAlerts: [],
  geofenceAlerts: [],
  anomalyAlerts: [],
  loading: false,
  error: null,
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    addAlert: (state, action) => {
      const alert = {
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
      };
      
      state.alerts.unshift(alert);
      state.unreadCount += 1;
      
      // Categorize alert
      switch (alert.type) {
        case 'panic':
          state.panicAlerts.unshift(alert);
          break;
        case 'geofence':
          state.geofenceAlerts.unshift(alert);
          break;
        case 'anomaly':
          state.anomalyAlerts.unshift(alert);
          break;
        default:
          break;
      }
    },
    markAsRead: (state, action) => {
      const alertId = action.payload;
      const alert = state.alerts.find(a => a.id === alertId);
      
      if (alert && !alert.read) {
        alert.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.alerts.forEach(alert => {
        alert.read = true;
      });
      state.unreadCount = 0;
    },
    removeAlert: (state, action) => {
      const alertId = action.payload;
      const alert = state.alerts.find(a => a.id === alertId);
      
      if (alert) {
        state.alerts = state.alerts.filter(a => a.id !== alertId);
        if (!alert.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        // Remove from categorized arrays
        state.panicAlerts = state.panicAlerts.filter(a => a.id !== alertId);
        state.geofenceAlerts = state.geofenceAlerts.filter(a => a.id !== alertId);
        state.anomalyAlerts = state.anomalyAlerts.filter(a => a.id !== alertId);
      }
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.unreadCount = 0;
      state.panicAlerts = [];
      state.geofenceAlerts = [];
      state.anomalyAlerts = [];
    },
    setAlerts: (state, action) => {
      state.alerts = action.payload;
      state.unreadCount = action.payload.filter(alert => !alert.read).length;
      
      // Categorize alerts
      state.panicAlerts = action.payload.filter(alert => alert.type === 'panic');
      state.geofenceAlerts = action.payload.filter(alert => alert.type === 'geofence');
      state.anomalyAlerts = action.payload.filter(alert => alert.type === 'anomaly');
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
  addAlert,
  markAsRead,
  markAllAsRead,
  removeAlert,
  clearAlerts,
  setAlerts,
  setLoading,
  setError,
  clearError,
} = alertSlice.actions;

export default alertSlice.reducer;
