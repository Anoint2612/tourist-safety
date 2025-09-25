import React, { useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme, Text, Avatar, Modal, Portal, Button, TextInput } from 'react-native-paper';
import { getCurrentLocation } from '../../services/api';

const CustomHeader = ({ navigation, route, options, back }) => {
  const theme = useTheme();
  const { title } = options || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [efirModalVisible, setEfirModalVisible] = useState(false);
  const [form, setForm] = useState({ description: '' });
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [efirList, setEfirList] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
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
        {/* Main menu modal */}
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>User Info</Text>
          <Text>Name: {userProfile.userName}</Text>
          <Text>Tourist ID: {userProfile.touristId}</Text>
          <Text>Phone: {userProfile.userPhone}</Text>
          <View style={{ marginTop: 20 }}>
            <Button mode="contained" onPress={() => { setModalVisible(false); setEfirModalVisible(true); }} style={{ marginBottom: 10 }}>File e-FIR</Button>
            <Button mode="outlined" onPress={async () => {
              setModalVisible(false);
              setLoadingStatus(true);
              setStatusModalVisible(true);
              try {
                const res = await fetch(`http://localhost:5000/efir/pending?touristId=${userProfile.touristId}`);
                if (res.ok) {
                  const data = await res.json();
                  setEfirList(data);
                } else {
                  setEfirList([]);
                }
              } catch (err) {
                setEfirList([]);
              }
              setLoadingStatus(false);
            }}>View Filed e-FIR Status</Button>
        {/* Status modal */}
        <Modal visible={statusModalVisible} onDismiss={() => setStatusModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Filed e-FIR Status</Text>
          {loadingStatus ? (
            <Text>Loading...</Text>
          ) : efirList.length === 0 ? (
            <Text>No e-FIRs found.</Text>
          ) : (
            efirList.map((efir, idx) => (
              <View key={idx} style={{ marginBottom: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                <Text>Description: {efir.description}</Text>
                <Text>Status: {efir.status}</Text>
                <Text>Date: {new Date(efir.createdAt).toLocaleString()}</Text>
              </View>
            ))
          )}
          <Button onPress={() => setStatusModalVisible(false)} style={{ marginTop: 10 }}>Close</Button>
        </Modal>
          </View>
        </Modal>
        {/* e-FIR modal */}
        <Modal visible={efirModalVisible} onDismiss={() => setEfirModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>File e-FIR</Text>
          <Text>Description:</Text>
          <TextInput label="Description" value={form.description} onChangeText={text => setForm(f => ({ ...f, description: text }))} style={styles.input} multiline />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button onPress={() => setEfirModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={async () => {
              // Request location permission if needed
              if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                  alert('Location permission denied');
                  return;
                }
              }
              // const { latitude, longitude } = await getCurrentLocation();
              const latitude = 26.115103;
              const longitude = 91.703239;
              const nearestCity = 'Unknown'; // Use a reverse geocoding service
              const payload = {
                filedBy: userProfile.userName,
                description: form.description,
                phone: userProfile.userPhone,
                touristId: userProfile.touristId,
                geoLocation: { latitude, longitude, nearestCity },
              };
              try {
                const res = await fetch('http://10.20.57.131:5000/efir', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (res.ok) {
                  setEfirModalVisible(false);
                  setForm({ description: '' });
                  // Optionally show success message
                  alert('e-FIR submitted successfully');
                } else {
                  console.error('Failed to submit EFIR');
                }
              } catch (err) {
                console.error('Error submitting EFIR:', err);
              }

                
            }}>Submit</Button>
          </View>
        </Modal>
      </Portal>
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
