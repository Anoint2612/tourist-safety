import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
  Chip
} from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences, updateProfile } from '../../store/reducers/userReducer';
import { logout } from '../../store/actions/authActions';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { preferences, emergencyContacts } = useSelector(state => state.user);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);

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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
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
    dispatch(updateProfile(profileData));
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
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
              {user?.name || 'User Name'}
            </Title>
            <Paragraph style={[styles.email, { color: theme.colors.textSecondary }]}>
              {user?.email || 'user@example.com'}
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
              Emergency Contacts
            </Title>
            <IconButton
              icon="plus"
              size={24}
              onPress={() => console.log('Add contact')}
            />
          </View>
          
          {emergencyContacts?.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: theme.colors.text }]}>
                  {contact.name}
                </Text>
                <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>
                  {contact.phone} • {contact.relation}
                </Text>
              </View>
              <IconButton
                icon="phone"
                size={20}
                onPress={() => console.log('Call contact')}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

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