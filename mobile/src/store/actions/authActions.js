import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple token generation function
const generateToken = () => {
  return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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

// Helper function to clear auth data from AsyncStorage
const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

export const clearError = () => ({
  type: 'auth/clearError'
});

// Async thunk for user registration - Frontend only
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const token = generateToken();
      const user = {
        id: Date.now().toString(),
        ...userData,
        role: 'tourist',
        digitalId: 'DIG' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        createdAt: new Date().toISOString(),
        isVerified: false,
        preferences: {
          notifications: true,
          locationSharing: false,
          shareWithPolice: false,
        },
        emergencyContacts: []
      };
      
      await saveAuthToken(token);
      await saveUserData(user);
      
      return {
        token,
        user,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Async thunk for user login - Frontend only
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
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
        isVerified: true,
        preferences: {
          notifications: true,
          locationSharing: false,
          shareWithPolice: false,
        },
        emergencyContacts: []
      };
      
      await saveAuthToken(token);
      await saveUserData(user);
      
      return {
        token,
        user,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk for user logout - Frontend only
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await clearAuthData();
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Async thunk for refreshing token - Frontend only
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      // For frontend-only implementation, just generate a new token
      const token = generateToken();
      await saveAuthToken(token);
      
      return { token };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return rejectWithValue(error.message || 'Session expired. Please log in again.');
    }
  }
);