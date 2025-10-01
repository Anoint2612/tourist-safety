import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get user data from AsyncStorage
const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return null;
    
    const parsedData = JSON.parse(userData);
    // Ensure emergencyContacts is always an array
    if (!Array.isArray(parsedData.emergencyContacts)) {
      parsedData.emergencyContacts = [];
    }
    return parsedData;
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
        // Return a default user structure if no user exists yet
        return { 
          data: { 
            profile: null, 
            emergencyContacts: [],
            preferences: {}
          } 
        };
      }
      
      // Ensure we return a consistent structure
      return { 
        data: {
          ...user,
          emergencyContacts: user.emergencyContacts || []
        } 
      };
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
      const contacts = user?.emergencyContacts || [];
      return { data: { contacts } };
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw new Error('Failed to fetch emergency contacts');
    }
  },

  // Add emergency contact to local storage
  addEmergencyContact: async (contact) => {
    try {
      let currentUser = await getUserData() || {};
      
      // Ensure emergencyContacts exists as an array
      if (!Array.isArray(currentUser.emergencyContacts)) {
        currentUser.emergencyContacts = [];
      }
      
      // Check if contact with same phone already exists
      const existingContactIndex = currentUser.emergencyContacts.findIndex(
        c => c.phone === contact.phone
      );
      
      let newContact;
      
      if (existingContactIndex >= 0) {
        // Update existing contact
        newContact = {
          ...currentUser.emergencyContacts[existingContactIndex],
          ...contact,
          updatedAt: new Date().toISOString()
        };
        currentUser.emergencyContacts[existingContactIndex] = newContact;
      } else {
        // Add new contact
        newContact = {
          id: Date.now().toString(),
          ...contact,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        currentUser.emergencyContacts.push(newContact);
      }
      
      // Save the updated user data
      await saveUserData(currentUser);
      
      return { data: { contact: newContact } };
    } catch (error) {
      console.error('Add/Update emergency contact error:', error);
      throw new Error('Failed to add/update emergency contact');
    }
  },

  // Remove emergency contact from local storage
  removeEmergencyContact: async (contactId) => {
    try {
      const currentUser = await getUserData();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      // Ensure emergencyContacts exists as an array
      if (!Array.isArray(currentUser.emergencyContacts)) {
        currentUser.emergencyContacts = [];
      }
      
      // Filter out the contact to remove
      const updatedContacts = currentUser.emergencyContacts.filter(
        contact => contact.id !== contactId
      );
      
      // Only update if something changed
      if (updatedContacts.length !== currentUser.emergencyContacts.length) {
        const updatedUser = { 
          ...currentUser, 
          emergencyContacts: updatedContacts 
        };
        await saveUserData(updatedUser);
      }
      
      return { data: { success: true } };
    } catch (error) {
      console.error('Remove emergency contact error:', error);
      throw new Error('Failed to remove emergency contact');
    }
  },
};

export default userAPI;