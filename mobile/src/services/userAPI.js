import AsyncStorage from '@react-native-async-storage/async-storage';

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

const userAPI = {
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
  updateProfile: async (profileData) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = { ...currentUser, ...profileData };
      await saveUserData(updatedUser);
      
      return { data: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Profile update failed');
    }
  },

  // Update user preferences in local storage
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

  // Get emergency contacts from local storage
  getEmergencyContacts: async () => {
    try {
      const user = await getUserData();
      if (!user) {
        throw new Error('User not found');
      }
      
      return { data: { contacts: user.emergencyContacts || [] } };
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw new Error('Failed to fetch emergency contacts');
    }
  },

  // Add emergency contact to local storage
  addEmergencyContact: async (contact) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const newContact = {
        id: Date.now().toString(),
        ...contact,
        createdAt: new Date().toISOString()
      };
      
      const emergencyContacts = currentUser.emergencyContacts || [];
      emergencyContacts.push(newContact);
      
      const updatedUser = { ...currentUser, emergencyContacts };
      await saveUserData(updatedUser);
      
      return { data: { contact: newContact } };
    } catch (error) {
      console.error('Add emergency contact error:', error);
      throw new Error('Failed to add emergency contact');
    }
  },

  // Remove emergency contact from local storage
  removeEmergencyContact: async (contactId) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const emergencyContacts = (currentUser.emergencyContacts || []).filter(
        contact => contact.id !== contactId
      );
      
      const updatedUser = { ...currentUser, emergencyContacts };
      await saveUserData(updatedUser);
      
      return { data: { success: true } };
    } catch (error) {
      console.error('Remove emergency contact error:', error);
      throw new Error('Failed to remove emergency contact');
    }
  },
};

export default userAPI;