import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { PermissionsAndroid } from 'react-native';
import { efirAPI } from '../../services/api';

const EFIRCreateModal = ({ 
  modalVisible, 
  setModalVisible, 
  userProfile, 
  navigation 
}) => {
  const [form, setForm] = useState({ description: '' });

  const handleSubmitEFIR = async () => {
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

    const latitude = 26.115103;
    const longitude = 91.703239;
    const nearestCity = 'Unknown'; // Use a reverse geocoding service
    try {
      const payload = {
        description: form.description,
        filedBy: userProfile.userName,
        phone: userProfile.userPhone,
        touristId: userProfile.touristId,
        geoLocation: { latitude, longitude, nearestCity },
      };

      const result = await efirAPI.createEfir(payload);
      
      if (result.success) {
        setModalVisible(false);
        setForm({ description: '' });
        // Refresh the EFIR list by navigating back with refresh flag
        navigation.navigate('EFIRList', { refresh: true });
        alert('e-FIR submitted successfully');
      }
    } catch (err) {
      console.error('Error submitting EFIR:', err);
    }
  };

  return (
    <Portal>
      <Modal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)} 
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.modalTitle}>File e-FIR</Text>
        <Text>Description:</Text>
        <TextInput 
          label="Description" 
          value={form.description} 
          onChangeText={text => setForm(f => ({ ...f, description: text }))} 
          style={styles.input} 
          multiline 
        />
        <View style={styles.modalFooter}>
          <Button 
            onPress={() => setModalVisible(false)} 
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmitEFIR}
          >
            Submit
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = {
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  input: {
    marginTop: 8,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 16
  },
  cancelButton: {
    marginRight: 8
  }
};

export default EFIRCreateModal;
