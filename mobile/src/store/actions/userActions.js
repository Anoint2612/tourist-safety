import { createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/userAPI';

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Async thunk for updating user preferences
// updateUserPreferences already supports any preferences, including language
export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      // If language is present, persist it locally as well (optional)
      if (preferences.language) {
        // Optionally persist to AsyncStorage for app reload
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('appLanguage', preferences.language);
        } catch (e) {
          // Ignore local storage errors
        }
      }
      const response = await userAPI.updatePreferences(preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  }
);

// Async thunk for uploading profile picture
export const uploadProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: file.uri,
        type: file.type || 'image/jpeg', // default to jpeg if type not provided
        name: file.name || 'profile.jpg'
      });

      const response = await userAPI.uploadProfilePicture(formData);
      
      return response.data.profilePicture;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload profile picture');
    }
  }
);

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await userAPI.getProfile();
      
      // Ensure emergencyContacts is an array
      const userData = {
        ...response.data,
        emergencyContacts: Array.isArray(response.data.emergencyContacts) 
          ? response.data.emergencyContacts 
          : []
      };
      
      // Update the auth user data with the latest info including emergency contacts
      dispatch({
        type: 'auth/updateUser',
        payload: userData
      });
      
      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  }
);

// Async thunk for adding emergency contact
export const addEmergencyContact = createAsyncThunk(
  'user/addEmergencyContact',
  async (contact, { rejectWithValue }) => {
    try {
      const response = await userAPI.addEmergencyContact(contact);
      return response.data.contact;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add emergency contact');
    }
  }
);

// Async thunk for removing emergency contact
export const removeEmergencyContact = createAsyncThunk(
  'user/removeEmergencyContact',
  async (contactId, { rejectWithValue }) => {
    try {
      await userAPI.removeEmergencyContact(contactId);
      return contactId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove emergency contact');
    }
  }
);

// Action to clear user errors
export const clearUserError = () => ({
  type: 'user/clearError'
});