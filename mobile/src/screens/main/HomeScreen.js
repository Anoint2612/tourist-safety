import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, Avatar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

// Sample data - in a real app, this would come from your backend
const sampleUser = {
  name: 'John Doe',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  safetyScore: 85,
  activeTrip: {
    id: 'trip123',
    destination: 'Paris, France',
    startDate: '2023-06-15',
    endDate: '2023-06-25',
    status: 'active',
  },
  recentAlerts: [
    { id: 'alert1', type: 'geofence', message: 'Entered high-risk area', time: '2 hours ago', read: false },
    { id: 'alert2', type: 'safety', message: 'Safety check-in reminder', time: '5 hours ago', read: true },
  ],
};

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserData(sampleUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handlePanicButton = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Send Alert', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement panic alert functionality
            console.log('Emergency alert sent!');
            navigation.navigate('Alert', { type: 'panic' });
          }
        },
      ]
    );
  };

  const getSafetyStatus = (score) => {
    if (score >= 80) return { text: 'Safe', color: theme.colors.success };
    if (score >= 50) return { text: 'Caution', color: theme.colors.warning };
    return { text: 'At Risk', color: theme.colors.error };
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const safetyStatus = getSafetyStatus(userData.safetyScore);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Hello,
          </Text>
          <Text style={[styles.userName, { color: theme.colors.primary }]}>
            {userData.name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Avatar.Image 
            size={50} 
            source={{ uri: userData.avatar }} 
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Safety Status Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={24} color={safetyStatus.color} />
            <Text style={[styles.safetyTitle, { color: theme.colors.text }]}>
              Your Safety Status
            </Text>
          </View>
          
          <View style={styles.safetyScoreContainer}>
            <View style={styles.scoreCircleContainer}>
              <View 
                style={[
                  styles.scoreCircle, 
                  { 
                    borderColor: safetyStatus.color,
                    backgroundColor: `${safetyStatus.color}20`,
                  }
                ]}
              >
                <Text style={[styles.scoreText, { color: safetyStatus.color }]}>
                  {userData.safetyScore}
                </Text>
              </View>
              <Text style={[styles.statusText, { color: safetyStatus.color }]}>
                {safetyStatus.text}
              </Text>
            </View>
            
            <View style={styles.safetyTips}>
              <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
                Safety Tips
              </Text>
              <Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
                • Share your live location with trusted contacts
              </Text>
              <Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
                • Avoid isolated areas at night
              </Text>
              <Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
                • Keep emergency contacts updated
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Quick Actions
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="navigate" size={30} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            Navigate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Trips')}
        >
          <Ionicons name="briefcase" size={30} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            My Trips
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Ionicons name="people" size={30} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Trip */}
      {userData.activeTrip && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Active Trip
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')}>
              <Text style={{ color: theme.colors.primary }}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <Card 
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('TripDetails', { tripId: userData.activeTrip.id })}
          >
            <Card.Content>
              <View style={styles.tripHeader}>
                <Ionicons name="location" size={24} color={theme.colors.primary} />
                <Text style={[styles.tripDestination, { color: theme.colors.primary }]}>
                  {userData.activeTrip.destination}
                </Text>
              </View>
              <View style={styles.tripDates}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {userData.activeTrip.startDate} - {userData.activeTrip.endDate}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.success}20` }]}>
                  <Text style={{ color: theme.colors.success, fontSize: 12 }}>
                    {userData.activeTrip.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Map', { tripId: userData.activeTrip.id })}
                style={[styles.trackButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#fff' }}
              >
                Track Journey
              </Button>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Recent Alerts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recent Alerts
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
          <Text style={{ color: theme.colors.primary }}>See All</Text>
        </TouchableOpacity>
      </View>

      {userData.recentAlerts.map((alert) => (
        <Card 
          key={alert.id} 
          style={[styles.alertCard, { 
            backgroundColor: theme.colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: alert.type === 'geofence' ? theme.colors.warning : theme.colors.info,
          }]}
          onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}
        >
          <Card.Content style={styles.alertContent}>
            <View style={styles.alertIconContainer}>
              <Ionicons 
                name={alert.type === 'geofence' ? 'warning' : 'notifications'}
                size={24} 
                color={alert.type === 'geofence' ? theme.colors.warning : theme.colors.info}
              />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                {alert.message}
              </Text>
              <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>
                {alert.time}
              </Text>
            </View>
            {!alert.read && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]} />
            )}
          </Card.Content>
        </Card>
      ))}

      {/* Emergency Button */}
      <TouchableOpacity 
        style={[styles.emergencyButton, { backgroundColor: theme.colors.error }]}
        onPress={handlePanicButton}
      >
        <Ionicons name="alert-circle" size={28} color="#fff" />
        <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  safetyScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  safetyTips: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: '31%',
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tripDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emergencyButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HomeScreen;
