// const API_URL = 'http://localhost:6000/api/v1'; // For iOS simulator
const API_URL = 'http://localhost:6000/api/v1'; // For Android emulator

export default {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_URL}/auth/forgotpassword`,
    RESET_PASSWORD: `${API_URL}/auth/resetpassword`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
  },
  
  // User endpoints
  USERS: {
    BASE: `${API_URL}/users`,
    PROFILE: (userId) => `${API_URL}/users/${userId}`,
    UPLOAD_PHOTO: `${API_URL}/users/photo`,
    EMERGENCY_CONTACTS: `${API_URL}/users/emergency-contacts`,
    VERIFY_KYC: `${API_URL}/users/verify-kyc`,
    DIGITAL_ID: `${API_URL}/users/digital-id`,
  },
  
  // Trip endpoints
  TRIPS: {
    BASE: `${API_URL}/trips`,
    TRIP: (tripId) => `${API_URL}/trips/${tripId}`,
    UPLOAD_PHOTO: (tripId) => `${API_URL}/trips/${tripId}/photo`,
    UPDATE_LOCATION: (tripId) => `${API_URL}/trips/${tripId}/location`,
    BY_STATUS: (status) => `${API_URL}/trips/status/${status}`,
    BY_GUIDE: (guideId) => `${API_URL}/trips/guide/${guideId}`,
  },
  
  // Alert endpoints
  ALERTS: {
    BASE: `${API_URL}/alerts`,
    ALERT: (alertId) => `${API_URL}/alerts/${alertId}`,
    BY_STATUS: (status) => `${API_URL}/alerts/status/${status}`,
  },
  
  // Geofence endpoints
  GEOFENCE: {
    BASE: `${API_URL}/geofence`,
    CHECK: `${API_URL}/geofence/check`,
    BY_RISK_LEVEL: (riskLevel) => `${API_URL}/geofence/risk/${riskLevel}`,
  },
};

// export const SOCKET_URL = 'http://localhost:6000'; // For iOS simulator
export const SOCKET_URL = 'http://localhost:6000'; // For Android emulator
