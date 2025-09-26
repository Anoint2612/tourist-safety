import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL || 'http://10.20.57.131:5000';

// Simple token generation function
const generateToken = () => {
  return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Helper function to get auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to save auth token to AsyncStorage
const saveAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
    return true;
  } catch (error) {
    console.error('Error saving auth token:', error);
    return false;
  }
};

// Helper function to clear auth token from AsyncStorage
const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    return true;
  } catch (error) {
    console.error('Error clearing auth token:', error);
    return false;
  }
};

// Helper function to save user data to AsyncStorage
const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

// Helper function to get user data from AsyncStorage
const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Auth API - Frontend only implementation
export const authAPI = {
  // Register user - generates token and saves locally
  register: async (userData) => {
    try {
      const token = generateToken();
      const user = {
        id: Date.now().toString(),
        ...userData,
        role: 'tourist',
        digitalId: 'DIG' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        createdAt: new Date().toISOString(),
        isVerified: false
      };
      
      await saveAuthToken(token);
      await saveUserData(user);
      
      return {
        success: true,
        token,
        user,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  },

  // Login user - generates token and saves locally
  login: async (credentials) => {
    try {
      // For demo purposes, accept any email/password combination
      const token = generateToken();
      const user = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role: 'tourist',
        digitalId: 'DIG' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      
      await saveAuthToken(token);
      await saveUserData(user);
      
      return {
        success: true,
        token,
        user,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  },

  // Logout user - clears local storage
  logout: async () => {
    try {
      await clearAuthToken();
      await AsyncStorage.removeItem('userData');
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  // Forgot password - mock implementation
  forgotPassword: async (email) => {
    try {
      // Mock implementation - just return success
      return {
        success: true,
        message: 'Password reset email sent (mock)'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error('Password reset failed');
    }
  },

  // Reset password - mock implementation
  resetPassword: async (token, newPassword) => {
    try {
      // Mock implementation - just return success
      return {
        success: true,
        message: 'Password reset successful (mock)'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Password reset failed');
    }
  },

  // Verify email - mock implementation
  verifyEmail: async (token) => {
    try {
      // Mock implementation - just return success
      return {
        success: true,
        message: 'Email verified successfully (mock)'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error('Email verification failed');
    }
  },
};

// User API - Frontend only implementation
export const userAPI = {
  // Get user profile from local storage
  getProfile: async () => {
    try {
      const user = await getUserData();
      if (!user) {
        throw new Error('User not found');
      }
      return { data: user };
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Failed to fetch profile');
    }
  },

  // Update user profile in local storage
  updateProfile: async (userData) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = { ...currentUser, ...userData };
      await saveUserData(updatedUser);
      
      return { data: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Profile update failed');
    }
  },

  // Update emergency contacts in local storage
  updateEmergencyContacts: async (contacts) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = { ...currentUser, emergencyContacts: contacts };
      await saveUserData(updatedUser);
      
      return { data: updatedUser };
    } catch (error) {
      console.error('Update emergency contacts error:', error);
      throw new Error('Failed to update emergency contacts');
    }
  },

  // Update preferences in local storage
  updatePreferences: async (preferences) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = { 
        ...currentUser, 
        preferences: { ...currentUser.preferences, ...preferences }
      };
      await saveUserData(updatedUser);
      
      return { data: updatedUser };
    } catch (error) {
      console.error('Update preferences error:', error);
      throw new Error('Failed to update preferences');
    }
  },

  // Get digital ID from local storage
  getDigitalId: async () => {
    try {
      const user = await getUserData();
      if (!user) {
        throw new Error('User not found');
      }
      
      return { data: { digitalId: user.digitalId } };
    } catch (error) {
      console.error('Get digital ID error:', error);
      throw new Error('Failed to fetch digital ID');
    }
  },

  // Upload profile picture - mock implementation
  uploadProfilePicture: async (formData) => {
    try {
      // Mock implementation - just return a mock URL
      const mockAvatarUrl = 'https://via.placeholder.com/150/007bff/ffffff?text=Avatar';
      
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = { ...currentUser, avatar: mockAvatarUrl };
      await saveUserData(updatedUser);
      
      return { data: { profilePicture: mockAvatarUrl } };
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw new Error('Failed to upload profile picture');
    }
  },
};

// Trip API - Mock implementation for frontend only
export const tripAPI = {
  createTrip: async (tripData) => {
    try {
      const trip = {
        id: Date.now().toString(),
        ...tripData,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Save trip to local storage
      const trips = await AsyncStorage.getItem('trips');
      const tripList = trips ? JSON.parse(trips) : [];
      tripList.push(trip);
      await AsyncStorage.setItem('trips', JSON.stringify(tripList));
      
      return { data: trip };
    } catch (error) {
      console.error('Create trip error:', error);
      throw new Error('Failed to create trip');
    }
  },

  getTrips: async () => {
    try {
      const trips = await AsyncStorage.getItem('trips');
      return { data: trips ? JSON.parse(trips) : [] };
    } catch (error) {
      console.error('Get trips error:', error);
      throw new Error('Failed to fetch trips');
    }
  },

  getTrip: async (tripId) => {
    try {
      const trips = await AsyncStorage.getItem('trips');
      const tripList = trips ? JSON.parse(trips) : [];
      const trip = tripList.find(t => t.id === tripId);
      
      if (!trip) {
        throw new Error('Trip not found');
      }
      
      return { data: trip };
    } catch (error) {
      console.error('Get trip error:', error);
      throw new Error('Failed to fetch trip');
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const trips = await AsyncStorage.getItem('trips');
      const tripList = trips ? JSON.parse(trips) : [];
      const tripIndex = tripList.findIndex(t => t.id === tripId);
      
      if (tripIndex === -1) {
        throw new Error('Trip not found');
      }
      
      tripList[tripIndex] = { ...tripList[tripIndex], ...updates };
      await AsyncStorage.setItem('trips', JSON.stringify(tripList));
      
      return { data: tripList[tripIndex] };
    } catch (error) {
      console.error('Update trip error:', error);
      throw new Error('Failed to update trip');
    }
  },

  deleteTrip: async (tripId) => {
    try {
      const trips = await AsyncStorage.getItem('trips');
      const tripList = trips ? JSON.parse(trips) : [];
      const filteredTrips = tripList.filter(t => t.id !== tripId);
      
      await AsyncStorage.setItem('trips', JSON.stringify(filteredTrips));
      
      return { data: { success: true } };
    } catch (error) {
      console.error('Delete trip error:', error);
      throw new Error('Failed to delete trip');
    }
  },
};

// Location API - Mock implementation
export const locationAPI = {
  sendLocation: async (locationData) => {
    try {
      // Mock implementation - just return success
      return { data: { success: true, message: 'Location sent (mock)' } };
    } catch (error) {
      console.error('Send location error:', error);
      throw new Error('Failed to send location');
    }
  },

  getLocationHistory: async (userId, startDate, endDate) => {
    try {
      // Mock implementation - return empty array
      return { data: [] };
    } catch (error) {
      console.error('Get location history error:', error);
      throw new Error('Failed to fetch location history');
    }
  },

  updateTrackingConsent: async (consent) => {
    try {
      // Mock implementation - just return success
      return { data: { success: true, consent } };
    } catch (error) {
      console.error('Update tracking consent error:', error);
      throw new Error('Failed to update tracking consent');
    }
  },
};

// Alert API - Mock implementation
export const alertAPI = {
  sendPanicAlert: async (alertData) => {
    try {
      const alert = {
        id: Date.now().toString(),
        ...alertData,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
      
      // Save alert to local storage
      const alerts = await AsyncStorage.getItem('alerts');
      const alertList = alerts ? JSON.parse(alerts) : [];
      alertList.push(alert);
      await AsyncStorage.setItem('alerts', JSON.stringify(alertList));
      
      return { data: alert };
    } catch (error) {
      console.error('Send panic alert error:', error);
      throw new Error('Failed to send panic alert');
    }
  },

  getAlerts: async () => {
    try {
      const alerts = await AsyncStorage.getItem('alerts');
      let alertList = alerts ? JSON.parse(alerts) : [];
      
      // If no alerts exist, create some sample alerts
      if (alertList.length === 0) {
        const sampleAlerts = [
          {
            id: '1',
            type: 'panic',
            title: 'Panic Alert',
            message: 'Emergency panic alert activated',
            status: 'active',
            priority: 'high',
            timestamp: new Date().toISOString(),
            location: {
              type: 'Point',
              coordinates: [-73.935242, 40.730610],
              address: '123 Main St, New York, NY'
            }
          },
          {
            id: '2',
            type: 'geofence',
            title: 'Geofence Alert',
            message: 'You have entered a high-risk area',
            status: 'resolved',
            priority: 'medium',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            location: {
              type: 'Point',
              coordinates: [-74.0059, 40.7128],
              address: '456 Broadway, New York, NY'
            }
          },
          {
            id: '3',
            type: 'checkin',
            title: 'Safety Check-in',
            message: 'Please confirm your safety status',
            status: 'acknowledged',
            priority: 'low',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            location: {
              type: 'Point',
              coordinates: [-73.9857, 40.7484],
              address: '789 Times Square, New York, NY'
            }
          }
        ];
        
        await AsyncStorage.setItem('alerts', JSON.stringify(sampleAlerts));
        alertList = sampleAlerts;
      }
      
      return { data: alertList };
    } catch (error) {
      console.error('Get alerts error:', error);
      throw new Error('Failed to fetch alerts');
    }
  },

  markAlertAsRead: async (alertId) => {
    try {
      const alerts = await AsyncStorage.getItem('alerts');
      const alertList = alerts ? JSON.parse(alerts) : [];
      const alertIndex = alertList.findIndex(a => a.id === alertId);
      
      if (alertIndex !== -1) {
        alertList[alertIndex].isRead = true;
        await AsyncStorage.setItem('alerts', JSON.stringify(alertList));
      }
      
      return { data: { success: true } };
    } catch (error) {
      console.error('Mark alert as read error:', error);
      throw new Error('Failed to mark alert as read');
    }
  },

  getAlert: async (alertId) => {
    try {
      const alerts = await AsyncStorage.getItem('alerts');
      const alertList = alerts ? JSON.parse(alerts) : [];
      const alert = alertList.find(a => a.id === alertId);
      
      if (!alert) {
        throw new Error('Alert not found');
      }
      
      return { data: alert };
    } catch (error) {
      console.error('Get alert error:', error);
      throw new Error('Failed to fetch alert');
    }
  },
};

// Geofence API - Mock implementation
export const geofenceAPI = {
  getGeofences: async () => {
    try {
      // Mock implementation - return empty array
      return { data: [] };
    } catch (error) {
      console.error('Get geofences error:', error);
      throw new Error('Failed to fetch geofences');
    }
  },

  checkGeofence: async (location) => {
    try {
      // Mock implementation - return safe status
      return { data: { isSafe: true, riskLevel: 'low' } };
    } catch (error) {
      console.error('Check geofence error:', error);
      throw new Error('Failed to check geofence');
    }
  },
};

// ML API - Mock implementation
export const mlAPI = {
  calculateSafetyScore: async (safetyData) => {
    try {
      // Mock implementation - return random safety score
      const safetyScore = Math.floor(Math.random() * 40) + 60; // 60-100
      return { data: { safetyScore } };
    } catch (error) {
      console.error('Calculate safety score error:', error);
      throw new Error('Failed to calculate safety score');
    }
  },

  detectAnomaly: async (anomalyData) => {
    try {
      // Mock implementation - return no anomaly
      return { data: { hasAnomaly: false, confidence: 0.95 } };
    } catch (error) {
      console.error('Detect anomaly error:', error);
      throw new Error('Failed to detect anomaly');
    }
  },

  batchProcessLocations: async (locationsData) => {
    try {
      // Mock implementation - return processed data
      return { data: { processed: true, count: locationsData.length } };
    } catch (error) {
      console.error('Batch process locations error:', error);
      throw new Error('Failed to process locations');
    }
  },
};

// Blockchain API - Mock implementation
export const blockchainAPI = {
  registerTourist: async (userData, validUntil) => {
    try {
      // Mock implementation - return success
      return { data: { success: true, digitalId: userData.digitalId } };
    } catch (error) {
      console.error('Register tourist error:', error);
      throw new Error('Failed to register tourist on blockchain');
    }
  },

  recordEvent: async (digitalId, eventData, eventType) => {
    try {
      // Mock implementation - return success
      return { data: { success: true, eventId: Date.now().toString() } };
    } catch (error) {
      console.error('Record event error:', error);
      throw new Error('Failed to record event on blockchain');
    }
  },

  verifyTourist: async (digitalId) => {
    try {
      // Mock implementation - return verified
      return { data: { verified: true, digitalId } };
    } catch (error) {
      console.error('Verify tourist error:', error);
      throw new Error('Failed to verify tourist');
    }
  },

  getTouristEvents: async (digitalId) => {
    try {
      // Mock implementation - return empty events
      return { data: { events: [] } };
    } catch (error) {
      console.error('Get tourist events error:', error);
      throw new Error('Failed to fetch tourist events');
    }
  },
};

// Admin API - Mock implementation
export const adminAPI = {
  getDashboardData: async () => {
    try {
      // Mock implementation - return mock dashboard data
      return { data: { tourists: 0, alerts: 0, activeTrips: 0 } };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  },

  getAllTourists: async () => {
    try {
      // Mock implementation - return empty array
      return { data: [] };
    } catch (error) {
      console.error('Get all tourists error:', error);
      throw new Error('Failed to fetch tourists');
    }
  },

  getAllAlerts: async () => {
    try {
      const alerts = await AsyncStorage.getItem('alerts');
      return { data: alerts ? JSON.parse(alerts) : [] };
    } catch (error) {
      console.error('Get all alerts error:', error);
      throw new Error('Failed to fetch alerts');
    }
  },

  updateAlertStatus: async (alertId, status) => {
    try {
      const alerts = await AsyncStorage.getItem('alerts');
      const alertList = alerts ? JSON.parse(alerts) : [];
      const alertIndex = alertList.findIndex(a => a.id === alertId);
      
      if (alertIndex !== -1) {
        alertList[alertIndex].status = status;
        await AsyncStorage.setItem('alerts', JSON.stringify(alertList));
      }
      
      return { data: { success: true } };
    } catch (error) {
      console.error('Update alert status error:', error);
      throw new Error('Failed to update alert status');
    }
  },

  getHeatmapData: async () => {
    try {
      // Mock implementation - return empty heatmap data
      return { data: { points: [] } };
    } catch (error) {
      console.error('Get heatmap data error:', error);
      throw new Error('Failed to fetch heatmap data');
    }
  },
};

// EFIR API
export const efirAPI = {
  // Create a new EFIR
  createEfir: async (efirData) => {
    try {
      // Get current user data
      const user = await getUserData();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create EFIR object with user data
      const newEfir = {
        ...efirData,
        filedBy: efirData.filedBy || user.userName || user.email?.split('@')[0] || 'Anonymous',
        phone: efirData.phone || user.userPhone || '',
        touristId: user.touristId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Make API call to backend
      const response = await fetch(`${BASE_URL}/efir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEfir),
      });

      if (!response.ok) {
        throw new Error('Failed to create EFIR');
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
        message: 'E-FIR created successfully'
      };
    } catch (error) {
      console.error('Error creating E-FIR:', error);
      throw new Error(error.message || 'Failed to create E-FIR');
    }
  },

  // Get all EFIRs for the current user
  getEfirs: async () => {
    try {
      const user = await getUserData();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${BASE_URL}/efir/${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch EFIRs');
      }

      const userEfirs = await response.json();
      
      return {
        success: true,
        data: userEfirs || []
      };
    } catch (error) {
      console.error('Error fetching E-FIRs:', error);
      throw new Error(error.message || 'Failed to fetch E-FIRs');
    }
  },

  // Get a single EFIR by ID
  getEfir: async (efirId) => {
    try {
      const user = await getUserData();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${BASE_URL}/efir/single/${efirId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch EFIR');
      }

      const efir = await response.json();
      
      if (efir.userId !== user.id) {
        throw new Error('Unauthorized access to EFIR');
      }
      
      return {
        success: true,
        data: efir
      };
    } catch (error) {
      console.error('Error fetching E-FIR:', error);
      throw new Error(error.message || 'Failed to fetch E-FIR');
    }
  },
};

export default {
  authAPI,
  userAPI,
  tripAPI,
  locationAPI,
  alertAPI,
  geofenceAPI,
  mlAPI,
  blockchainAPI,
  adminAPI,
};