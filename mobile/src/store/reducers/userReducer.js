import { createSlice } from '@reduxjs/toolkit';
import { 
  updateUserProfile, 
  updateUserPreferences, 
  uploadProfilePicture, 
  fetchUserData 
} from '../actions/userActions';

const initialState = {
  profile: null,
  emergencyContacts: [],
  preferences: {
    notifications: true,
    locationSharing: false,
    shareWithPolice: false,
  },
  safetyScore: 100,
  safetyHistory: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setEmergencyContacts: (state, action) => {
      state.emergencyContacts = action.payload;
    },
    addEmergencyContact: (state, action) => {
      state.emergencyContacts.push(action.payload);
    },
    removeEmergencyContact: (state, action) => {
      state.emergencyContacts = state.emergencyContacts.filter(
        (contact, index) => index !== action.payload
      );
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setSafetyScore: (state, action) => {
      state.safetyScore = action.payload;
    },
    addSafetyHistory: (state, action) => {
      state.safetyHistory.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.profile.avatar = action.payload;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile || state.profile;
        state.emergencyContacts = action.payload.emergencyContacts || state.emergencyContacts;
        state.preferences = { ...state.preferences, ...action.payload.preferences };
        state.safetyScore = action.payload.safetyScore || state.safetyScore;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setProfile,
  setEmergencyContacts,
  addEmergencyContact,
  removeEmergencyContact,
  setSafetyScore,
  addSafetyHistory,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
