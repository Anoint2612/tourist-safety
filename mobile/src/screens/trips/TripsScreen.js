import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, Searchbar, FAB, Portal, Modal, Divider } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

// Sample trip data - in a real app, this would come from your backend
const sampleTrips = [
  {
    id: 'trip1',
    destination: 'Paris, France',
    startDate: '2023-06-15',
    endDate: '2023-06-25',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    description: 'Summer vacation in the city of love',
    emergencyContacts: ['+1234567890', '+1987654321'],
    checkIns: [],
  },
  {
    id: 'trip2',
    destination: 'Tokyo, Japan',
    startDate: '2023-04-10',
    endDate: '2023-04-20',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    description: 'Business trip and sightseeing',
    emergencyContacts: ['+1122334455'],
    checkIns: [],
  },
  {
    id: 'trip3',
    destination: 'New York, USA',
    startDate: '2023-07-01',
    endDate: '2023-07-10',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1499092346589-2e6f67804907?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    description: 'Summer trip with friends',
    emergencyContacts: ['+1555666777', '+1555888999'],
    checkIns: [],
  },
];

const TripsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'completed'

  // Load trips data
  useEffect(() => {
    const loadTrips = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrips(sampleTrips);
        setFilteredTrips(sampleTrips);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading trips:', error);
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  // Filter trips based on search query and active filter
  useEffect(() => {
    let result = [...trips];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(trip => trip.status === activeFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        trip =>
          trip.destination.toLowerCase().includes(query) ||
          trip.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTrips(result);
  }, [searchQuery, activeFilter, trips]);

  // Handle trip press
  const handleTripPress = (trip) => {
    navigation.navigate('TripDetails', { tripId: trip.id });
  };

  // Render trip item
  const renderTripItem = ({ item }) => (
    <Card 
      style={[styles.tripCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleTripPress(item)}
    >
      <View style={styles.tripHeader}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.tripImage}
          resizeMode="cover"
        />
        <View style={styles.tripStatusContainer}>
          <View 
            style={[
              styles.statusBadge, 
              { 
                backgroundColor: item.status === 'upcoming' 
                  ? theme.colors.primary + '20' 
                  : theme.colors.success + '20'
              }
            ]}
          >
            <Text 
              style={[
                styles.statusText,
                { 
                  color: item.status === 'upcoming' 
                    ? theme.colors.primary 
                    : theme.colors.success
                }
              ]}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      <Card.Content>
        <Title style={[styles.tripTitle, { color: theme.colors.text }]}>
          {item.destination}
        </Title>
        <View style={styles.tripDates}>
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={theme.colors.textSecondary} 
          />
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
        <Paragraph 
          style={[styles.tripDescription, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Paragraph>
        <View style={styles.emergencyContacts}>
          <Ionicons 
            name="warning-outline" 
            size={16} 
            color={theme.colors.error} 
          />
          <Text style={[styles.contactsText, { color: theme.colors.textSecondary }]}>
            {item.emergencyContacts.length} emergency contact{item.emergencyContacts.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button 
          mode="outlined" 
          onPress={() => handleTripPress(item)}
          style={[styles.actionButton, { borderColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.primary }}
        >
          View Details
        </Button>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Map', { tripId: item.id })}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ color: '#fff' }}
        >
          Track
        </Button>
      </Card.Actions>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
      <Ionicons 
        name="airplane-outline" 
        size={64} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
        No trips found
      </Text>
      <Button 
        mode="contained" 
        onPress={() => setShowAddModal(true)}
        style={{ marginTop: 16, backgroundColor: theme.colors.primary }}
      >
        Plan Your First Trip
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search trips..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          placeholderTextColor={theme.colors.placeholder}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.text }}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        {['all', 'upcoming', 'completed'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              { 
                backgroundColor: activeFilter === filter 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text 
              style={[
                styles.filterText,
                { 
                  color: activeFilter === filter 
                    ? '#fff' 
                    : theme.colors.primary
                }
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trips list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredTrips.length > 0 ? (
        <FlatList
          data={filteredTrips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Add Trip FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => setShowAddModal(true)}
        color="#fff"
      />

      {/* Add Trip Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={[
            styles.modal, 
            { 
              backgroundColor: theme.colors.surface,
              margin: 20,
              padding: 20,
              borderRadius: 8,
            }
          ]}
        >
          <Title style={{ color: theme.colors.text, marginBottom: 16 }}>
            Plan a New Trip
          </Title>
          
          <Button 
            mode="contained" 
            onPress={() => {
              setShowAddModal(false);
              navigation.navigate('TripSetup');
            }}
            style={{ marginTop: 16, backgroundColor: theme.colors.primary }}
            icon="plus"
          >
            Create New Trip
          </Button>
          
          <Divider style={{ marginVertical: 20 }} />
          
          <Button 
            mode="outlined" 
            onPress={() => {
              // TODO: Implement import from calendar
              console.log('Import from calendar');
            }}
            style={{ marginBottom: 8, borderColor: theme.colors.primary }}
            icon="calendar-import"
          >
            Import from Calendar
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => {
              // TODO: Implement import from email
              console.log('Import from email');
            }}
            style={{ borderColor: theme.colors.primary }}
            icon="email"
          >
            Import from Email
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  tripCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  tripHeader: {
    position: 'relative',
  },
  tripImage: {
    width: '100%',
    height: 160,
  },
  tripStatusContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  tripDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 4,
    fontSize: 14,
  },
  tripDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  emergencyContacts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  contactsText: {
    marginLeft: 4,
    fontSize: 12,
  },
  cardActions: {
    justifyContent: 'space-between',
    padding: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    elevation: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

export default TripsScreen;
