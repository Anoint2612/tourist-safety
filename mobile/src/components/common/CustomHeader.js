import React, { useState } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Appbar, useTheme, Portal, Modal, Button, Text } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EFIRCreateModal from '../../screens/efir/EFIRCreateModal';
import { useSelector } from 'react-redux';

const CustomHeader = ({ navigation, route, options, back }) => {
  const theme = useTheme();
  const { title } = options || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [efirModalVisible, setEfirModalVisible] = useState(false);
  const { user } = useSelector(state => state.auth);
  const styles = getStyles(theme);
  // Simulated user profile (replace with real user context)
  const userProfile = {
    userName: user?.name,
    touristId: user?.digitalId,
    userPhone: user?.phone,
  };

  // Don't show header for screens that explicitly set headerShown: false
  if (options && options.headerShown === false) {
    return null;
  }

  // Check if we're in the profile tab
  const isProfileTab = route?.name === 'Profile';

  return (
    <>
      <Appbar.Header 
        style={[styles.header, { backgroundColor: theme.colors.primary }]}
        theme={{
          colors: {
            primary: theme.colors.surface,
            text: theme.colors.surface,
            surface: theme.colors.primary,
          },
        }}
      >
        {back ? (
          <Appbar.BackAction 
            onPress={navigation.goBack} 
            color={theme.colors.surface}
          />
        ) : (
          <Appbar.Action 
            icon="menu" 
            onPress={() => setModalVisible(true)}
            color={theme.colors.surface}
          />
        )}
        <Appbar.Content
          title={
            <Text 
              style={[styles.title, { color: theme.colors.surface }]}
              numberOfLines={1}
            >
              {options?.title || title || route?.name}
            </Text>
          }
          titleStyle={styles.title}
        />
        {isProfileTab ? (
          <View style={styles.profileActions}>
            <Appbar.Action 
              icon="bell-outline" 
              onPress={() => console.log('Notifications')}
              color={theme.colors.surface}
            />
            <Appbar.Action 
              icon="cog" 
              onPress={() => console.log('Settings')}
              color={theme.colors.surface}
            />
          </View>
        ) : (
          <Appbar.Action 
            icon="bell-outline" 
            onPress={() => console.log('Notifications')}
            color={theme.colors.surface}
          />
        )}
      </Appbar.Header>
      <Portal>
        {/* User Info Modal */}
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Information</Text>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color={theme.colors.primary} style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{userProfile.userName || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <MaterialIcons name="fingerprint" size={20} color={theme.colors.primary} style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Tourist ID</Text>
                <Text style={[styles.infoValue, styles.monospace]}>{userProfile.touristId || 'Not assigned'}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color={theme.colors.primary} style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userProfile.userPhone || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={() => { 
                  setModalVisible(false);
                  setEfirModalVisible(true);
                }} 
                style={[styles.actionButton, { marginBottom: 12 }]}
                labelStyle={styles.buttonLabel}
                icon="file-document-outline"
              >
                File e-FIR
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('EFIRList');
                }}
                style={styles.actionButton}
                labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
                icon="file-document-multiple-outline"
              >
                View e-FIR Status
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
      
      <EFIRCreateModal 
        modalVisible={efirModalVisible}
        setModalVisible={setEfirModalVisible}
        userProfile={userProfile}
      />
    </>
  );
}

const getStyles = (theme) => StyleSheet.create({
  modalContent: {
    padding: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 24,
    textAlign: 'center',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  infoIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
  monospace: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 24,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 8,
    elevation: 0,
  },
  header: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        borderBottomWidth: 0,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 24,
    borderRadius: 8,
  },
  input: {
    marginBottom: 10,
  },
});

export default CustomHeader;
