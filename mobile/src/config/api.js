// Base URL for FastAPI backend
const API_URL = 'http://localhost:8000/api/v1';

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
  
  // Location update endpoint (used by tracking/SOS)
  LOCATION: {
    UPDATE: `${API_URL}/location`,
  },
  
  // Alert endpoints
  ALERTS: {
    BASE: `${API_URL}/alerts`,
    ALERT: (alertId) => `${API_URL}/alerts/${alertId}`,
    BY_STATUS: (status) => `${API_URL}/alerts/status/${status}`,
  },
  
  // Zones endpoints
  ZONES: {
    BASE: `${API_URL}/zones`,
  },
};

export const SOCKET_URL = 'ws://localhost:8000/ws/alerts';
