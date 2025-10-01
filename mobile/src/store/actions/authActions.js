import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

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
      console.log('Registering user with data:', userData);
      const result = await authAPI.register(userData);
      
      if (result.success) {
        console.log('Registration successful:', result);
        return {
          token: result.token,
          user: result.user,
          message: result.message
        };
      } else {
        return rejectWithValue(result.message || 'Registration failed');
      }
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
      console.log('Logging in user with credentials:', credentials);
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        if (!result.user) {
          console.warn('Login successful but no user data returned');
          return rejectWithValue('Invalid user data received. Please try again.');
        }
        
        console.log('Login successful:', result);
        return {
          token: result.token || generateToken(),
          user: result.user,
          message: result.message || 'Login successful'
        };
      } else {
        // Handle specific error messages from the API
        const errorMessage = result.message || 'Login failed';
        const friendlyMessage = errorMessage.includes('No user found') 
          ? 'No account found with this email. Please register first.'
          : errorMessage;
          
        return rejectWithValue(friendlyMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed';
      const friendlyMessage = errorMessage.includes('No user found') 
        ? 'No account found with this email. Please register first.'
        : 'An error occurred during login. Please check your credentials and try again.';
        
      return rejectWithValue(friendlyMessage);
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