import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  List,
  Switch,
  Divider,
  IconButton,
  Chip,
  Portal,
  Modal,
  HelperText,
  TextInput as PaperTextInput
} from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updatePreferences, 
  updateProfile, 
  addEmergencyContact, 
  removeEmergencyContact, 
  fetchUserData 
} from '../../store/actions/userActions';
import { logout } from '../../store/actions/authActions';
import { CommonActions } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  console.log('ProfileScreen - User:', user, 'isAuthenticated:', isAuthenticated);
  const { preferences } = useSelector(state => state.user);
  
  // Get emergency contacts from user object if available, otherwise from Redux
  const emergencyContacts = user?.emergencyContacts || [];
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const [contactError, setContactError] = useState('');

  // Load user data when component mounts
  useEffect(() => {
    console.log('ProfileScreen useEffect - user changed:', user);
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      
      // Only fetch user data if we don't have emergency contacts
      if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
        console.log('Fetching user data including emergency contacts');
        dispatch(fetchUserData());
      }
    } else {
      console.log('No user data available in ProfileScreen');
    }
  }, [user, dispatch]);

  // Debug: Log Redux state
  useEffect(() => {
    console.log('ProfileScreen - Full auth state:', { user, isAuthenticated });
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            try {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                })
              );
            } catch (error) {
              console.error('Logout navigation error:', error);
              navigation.navigate('Auth');
            }
          }
        }
      ]
    );
  };

  const handlePreferenceChange = (key, value) => {
    dispatch(updatePreferences({ [key]: value }));
  };

  const handleAvatarUpload = () => {
    console.log('Upload avatar');
  };

  const handleProfileUpdate = () => {
    dispatch(updateProfile(profileData))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      })
      .catch(error => {
        console.error('Profile update failed:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      });
  };

  const handleAddEmergencyContact = () => {
    setContactError('');
    
    // Validate inputs
    if (!newContact.name || !newContact.phone || !newContact.relation) {
      setContactError('All fields are required');
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newContact.phone)) {
      setContactError('Please enter a valid 10-digit phone number');
      return;
    }
    
    // Check if contact with same phone already exists
    if (emergencyContacts?.some(contact => contact.phone === newContact.phone)) {
      setContactError('A contact with this phone number already exists');
      return;
    }
    
    // Add the new contact
    dispatch(addEmergencyContact({
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relation: newContact.relation.trim()
    }))
    .unwrap()
    .then(() => {
      setShowEmergencyModal(false);
      setNewContact({ name: '', phone: '', relation: '' });
      Alert.alert('Success', 'Emergency contact added successfully');
    })
    .catch(error => {
      console.error('Failed to add emergency contact:', error);
      setContactError(error || 'Failed to add emergency contact');
    });
  };
  
  const handleRemoveEmergencyContact = (contactId) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeEmergencyContact(contactId))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Emergency contact removed successfully');
              })
              .catch(error => {
                console.error('Failed to remove emergency contact:', error);
                Alert.alert('Error', 'Failed to remove emergency contact');
              });
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.charAt(0) || 'U'} 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            <IconButton
              icon="camera"
              size={20}
              style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}
              iconColor="#fff"
              onPress={handleAvatarUpload}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Title style={[styles.name, { color: theme.colors.text }]}>
              {user?.name || 'mitesh'}
            </Title>
            <Paragraph style={[styles.email, { color: theme.colors.textSecondary }]}>
              {user?.email || 'mitesh@gmail.com'}
            </Paragraph>
            <Chip 
              mode="outlined" 
              style={[styles.roleChip, { borderColor: theme.colors.primary }]}
              textStyle={{ color: theme.colors.primary }}
            >
              {user?.role?.toUpperCase() || 'TOURIST'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Digital ID Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={[styles.cardTitle, { color: theme.colors.primary }]}>
              Digital Tourist ID
            </Title>
            <IconButton
              icon="qrcode"
              size={24}
              onPress={() => console.log('Show QR code')}
            />
          </View>
          <Text style={[styles.digitalId, { color: theme.colors.text }]}>
            {user?.digitalId || 'DIG123456789'}
          </Text>
          <Paragraph style={[styles.validUntil, { color: theme.colors.textSecondary }]}>
            Valid until: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Emergency Contacts */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={[styles.cardTitle, { color: theme.colors.primary }]}>
              {t('emergency_contacts') || 'Emergency Contacts'}
            </Title>
            <IconButton
              icon="plus"
              size={24}
              onPress={() => setShowEmergencyModal(true)}
            />
          </View>
          
          {emergencyContacts?.length > 0 ? (
            emergencyContacts.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: theme.colors.text }]}>
                    {contact.name}
                  </Text>
                  <View style={styles.contactDetails}>
                    <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>
                      {contact.phone}
                    </Text>
                    <Text style={[styles.contactRelation, { color: theme.colors.textSecondary }]}>
                      • {contact.relation}
                    </Text>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <IconButton
                    icon="phone"
                    size={20}
                    onPress={() => {
                      // Handle phone call
                      const phoneNumber = `tel:${contact.phone}`;
                      Linking.canOpenURL(phoneNumber).then(supported => {
                        if (supported) {
                          Linking.openURL(phoneNumber);
                        } else {
                          Alert.alert('Error', 'Phone calls are not supported on this device');
                        }
                      });
                    }}
                  />
                  <IconButton
                    icon="trash-can-outline"
                    size={20}
                    onPress={() => handleRemoveEmergencyContact(contact.id)}
                    iconColor={theme.colors.error}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noContacts, { color: theme.colors.textSecondary }]}>
              {t('no_emergency_contacts') || 'No emergency contacts added'}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Add Emergency Contact Modal */}
      <Portal>
        <Modal 
          visible={showEmergencyModal} 
          onDismiss={() => {
            setShowEmergencyModal(false);
            setContactError('');
            setNewContact({ name: '', phone: '', relation: '' });
          }}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <Card style={{ width: '100%' }}>
            <Card.Title 
              title={t('add_emergency_contact') || 'Add Emergency Contact'}
              titleStyle={{ color: theme.colors.primary }}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => {
                    setShowEmergencyModal(false);
                    setContactError('');
                    setNewContact({ name: '', phone: '', relation: '' });
                  }}
                />
              )}
            />
            <Card.Content>
              <PaperTextInput
                label={t('name') || 'Name'}
                value={newContact.name}
                onChangeText={(text) => setNewContact({...newContact, name: text})}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
              />
              
              <PaperTextInput
                label={t('phone_number') || 'Phone Number'}
                value={newContact.phone}
                onChangeText={(text) => setNewContact({...newContact, phone: text})}
                keyboardType="phone-pad"
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="phone" />}
              />
              
              <PaperTextInput
                label={t('relation') || 'Relation'}
                value={newContact.relation}
                onChangeText={(text) => setNewContact({...newContact, relation: text})}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="account-group" />}
              />
              
              {contactError ? (
                <HelperText type="error" visible={!!contactError}>
                  {contactError}
                </HelperText>
              ) : null}
              
              <Button 
                mode="contained" 
                onPress={handleAddEmergencyContact}
                style={styles.addButton}
                icon="account-plus"
              >
                {t('add_contact') || 'Add Contact'}
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
        <Card.Content> 
          <Title style={[styles.cardTitle, { color: theme.colors.primary }]}> 
            {t('settings')}
          </Title>

          <List.Item
            title={t('notifications')}
            description={t('push_notifications') || 'Push notifications'}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={preferences?.notifications || false}
                onValueChange={(value) => handlePreferenceChange('notifications', value)}
              />
            )}
          />

          <Divider />

          <List.Item
            title={t('location_sharing') || 'Location Sharing'}
            description={t('share_location_with_authorities') || 'Share location with authorities'}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={preferences?.locationSharing || false}
                onValueChange={(value) => handlePreferenceChange('locationSharing', value)}
              />
            )}
          />

          <Divider />

          <List.Item
            title={t('share_with_police') || 'Share with Police'}
            description={t('allow_police_access') || 'Allow police access to your data'}
            left={(props) => <List.Icon {...props} icon="shield" />}
            right={() => (
              <Switch
                value={preferences?.shareWithPolice || false}
                onValueChange={(value) => handlePreferenceChange('shareWithPolice', value)}
              />
            )}
          />

          <Divider />

          <List.Item
            title={t('change_language') || 'Change Language'}
            description={t('select_language')}
            left={(props) => <List.Icon {...props} icon="translate" />}
            onPress={() => setShowLanguageModal(true)}
            right={() => (
              <Chip style={{ backgroundColor: '#eee' }}>{language === 'en' ? t('english') : t('hindi')}</Chip>
            )}
          />

          {/* Language selection modal */}
          {showLanguageModal && (
            <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 16 }}>
              <Title style={{ marginBottom: 12 }}>{t('select_language')}</Title>
              <Button
                mode={language === 'en' ? 'contained' : 'outlined'}
                onPress={() => { setLanguage('en'); setShowLanguageModal(false); }}
                style={{ marginBottom: 8 }}
              >
                {t('english')}
              </Button>
              <Button
                mode={language === 'hi' ? 'contained' : 'outlined'}
                onPress={() => { setLanguage('hi'); setShowLanguageModal(false); }}
              >
                {t('hindi')}
              </Button>
              <Button
                onPress={() => setShowLanguageModal(false)}
                style={{ marginTop: 12 }}
              >
                {t('cancel')}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.primary }]}>
            Account Actions
          </Title>
          
          <Button
            mode="outlined"
            onPress={() => setIsEditing(!isEditing)}
            style={styles.actionButton}
            icon="pencil"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => console.log('Change password')}
            style={styles.actionButton}
            icon="key"
          >
            Change Password
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => console.log('Export data')}
            style={styles.actionButton}
            icon="download"
          >
            Export My Data
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            icon="logout"
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    elevation: 4,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 0,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleChip: {
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  digitalId: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  validUntil: {
    fontSize: 14,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default ProfileScreen;