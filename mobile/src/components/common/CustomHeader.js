import React, { useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme, Text, Avatar, Portal, Modal, Button } from 'react-native-paper';
import EFIRCreateModal from '../../screens/efir/EFIRCreateModal';

const CustomHeader = ({ navigation, route, options, back }) => {
  const theme = useTheme();
  const { title } = options || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [efirModalVisible, setEfirModalVisible] = useState(false);
  // Simulated user profile (replace with real user context)
  const userProfile = {
    userName: 'mitesh',
    touristId: 'T13423',
    userPhone: '+916361332898',
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
          <Text style={styles.modalTitle}>User Info</Text>
          <Text>Name: {userProfile.userName}</Text>
          <Text>Tourist ID: {userProfile.touristId}</Text>
          <Text>Phone: {userProfile.userPhone}</Text>
          <View style={styles.modalActions}>
            <Button 
              mode="contained" 
              onPress={() => { 
                setModalVisible(false);
                setEfirModalVisible(true);
              }} 
              style={styles.actionButton}
            >
              File e-FIR
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EFIRList');
              }}
            >
              View Filed e-FIR Status
            </Button>
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

const styles = StyleSheet.create({
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
