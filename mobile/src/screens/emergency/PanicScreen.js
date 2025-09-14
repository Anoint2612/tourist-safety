import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Vibration, Alert, Dimensions } from 'react-native';
import { Button, Text, useTheme, Card, Title, Paragraph } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from '../../store/reducers/alertReducer';
import { setCurrentLocation } from '../../store/reducers/locationReducer';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

const PanicScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentLocation } = useSelector(state => state.location);
  const { user } = useSelector(state => state.auth);
  
  const [panicPressed, setPanicPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString(),
        };
        setLocation(locationData);
        dispatch(setCurrentLocation(locationData));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setIsGettingLocation(false);
        Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handlePanicPress = () => {
    if (panicPressed) return;

    setPanicPressed(true);
    Vibration.vibrate([0, 500, 200, 500]); // Vibration pattern

    // Start countdown
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          triggerPanicAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerPanicAlert = async () => {
    try {
      // Get current location if not available
      if (!location && !currentLocation) {
        getCurrentLocation();
      }

      const alertData = {
        type: 'panic',
        message: 'EMERGENCY ALERT - Panic button activated',
        location: location || currentLocation,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        priority: 'high',
        status: 'active',
      };

      // Add to local store
      dispatch(addAlert(alertData));

      // TODO: Send to backend API
      console.log('Panic alert triggered:', alertData);

      // Show confirmation
      Alert.alert(
        'Emergency Alert Sent',
        'Your emergency alert has been sent to authorities and your emergency contacts. Help is on the way.',
        [
          {
            text: 'OK',
            onPress: () => {
              setPanicPressed(false);
              setCountdown(0);
              navigation.navigate('MainTabs');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error triggering panic alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
      setPanicPressed(false);
      setCountdown(0);
    }
  };

  const cancelPanic = () => {
    setPanicPressed(false);
    setCountdown(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.error }]}>
          Emergency Alert
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Press and hold the button below to send an emergency alert
        </Paragraph>
      </View>

      <View style={styles.panicContainer}>
        {countdown > 0 ? (
          <View style={styles.countdownContainer}>
            <Text style={[styles.countdownText, { color: theme.colors.error }]}>
              {countdown}
            </Text>
            <Text style={[styles.countdownLabel, { color: theme.colors.text }]}>
              Releasing in...
            </Text>
            <Button
              mode="outlined"
              onPress={cancelPanic}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.panicButtonContainer,
              {
                transform: [
                  { scale: panicPressed ? scaleAnim : pulseAnim }
                ]
              }
            ]}
          >
            <Button
              mode="contained"
              onPress={handlePanicPress}
              disabled={panicPressed}
              style={[
                styles.panicButton,
                { 
                  backgroundColor: panicPressed ? theme.colors.disabled : theme.colors.error,
                  width: width * 0.6,
                  height: width * 0.6,
                  borderRadius: (width * 0.6) / 2,
                }
              ]}
              labelStyle={styles.panicButtonLabel}
            >
              <View style={styles.panicButtonContent}>
                <Ionicons 
                  name="alert-circle" 
                  size={60} 
                  color="#fff" 
                />
                <Text style={styles.panicButtonText}>
                  {panicPressed ? 'SENDING...' : 'EMERGENCY'}
                </Text>
              </View>
            </Button>
          </Animated.View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.infoTitle, { color: theme.colors.primary }]}>
              What happens when you press?
            </Title>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Your location is sent to authorities
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Emergency contacts are notified
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Police and rescue services are alerted
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Response time: 3-5 minutes
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.infoTitle, { color: theme.colors.warning }]}>
              Important Notes
            </Title>
            <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
              • Only use this button in genuine emergencies{'\n'}
              • False alarms may result in penalties{'\n'}
              • Keep your location services enabled{'\n'}
              • Ensure your emergency contacts are up to date
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('MainTabs')}
          style={styles.backButton}
        >
          Back to Home
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  panicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicButton: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  panicButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  panicButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 18,
    marginBottom: 24,
  },
  cancelButton: {
    paddingHorizontal: 32,
  },
  infoContainer: {
    marginTop: 40,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 32,
  },
});

export default PanicScreen;
