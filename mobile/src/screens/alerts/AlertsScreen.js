import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, useTheme, Searchbar, FAB, Snackbar } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { alertAPI } from '../../services/api';

const AlertsScreen = () => {
  const theme = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadAlerts = useCallback(async (filter) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertAPI.getAlerts();
      setAlerts(response.data || []);
    } catch (err) {
      setError('Failed to load alerts. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts(activeFilter);
    }, [activeFilter, loadAlerts])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadAlerts(activeFilter).then(() => setIsRefreshing(false));
  }, [activeFilter, loadAlerts]);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const title = alert.title || '';
    const message = alert.message || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || alert.status === activeFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  // Get alert icon
  const getAlertIcon = (type) => {
    const icons = {
      panic: 'alert-circle',
      geofence: 'location',
      checkin: 'checkmark-circle',
      emergency: 'warning',
    };
    return icons[type] || 'notifications';
  };

  // Get alert color
  const getAlertColor = (alert) => {
    if (alert.type === 'panic' || alert.type === 'emergency') return theme.colors.error;
    if (alert.type === 'geofence') return theme.colors.warning;
    if (alert.status === 'resolved') return theme.colors.success;
    return theme.colors.primary;
  };

  // Render alert item
  const renderItem = ({ item }) => {
    const statusConfig = {
      active: { icon: 'alert-circle', color: theme.colors.error },
      resolved: { icon: 'check-circle', color: theme.colors.success || '#4CAF50' },
      expired: { icon: 'clock-outline', color: theme.colors.disabled },
      acknowledged: { icon: 'information', color: theme.colors.primary },
    };

    const config = statusConfig[item.status] || { icon: 'help-circle', color: theme.colors.text };

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          {/* Header with icon, title and status */}
          <View style={styles.alertHeader}>
            <View style={styles.titleContainer}>
              <Ionicons 
                name={getAlertIcon(item.type)} 
                size={20} 
                color={getAlertColor(item)} 
                style={styles.alertIcon}
              />
              <Title style={[styles.cardTitle, { color: theme.colors.text }]}>
                {item.title || 'Alert'}
              </Title>
            </View>
            <TouchableOpacity 
              style={[
                styles.statusChip, 
                { 
                  backgroundColor: config.color + '30',
                  borderColor: config.color,
                  borderWidth: 1,
                }
              ]}
            >
              <Text style={{ 
                color: config.color, 
                fontSize: 12, 
                fontWeight: '500'
              }}>
                {item.status || 'unknown'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Paragraph style={[styles.alertMessage, { color: theme.colors.textSecondary }]}>
            {item.message || 'No message available'}
          </Paragraph>

          {/* Footer with timestamp and priority */}
          <View style={styles.alertFooter}>
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown time'}
            </Text>
            {item.priority && (
              <TouchableOpacity 
                style={[
                  styles.priorityChip, 
                  { 
                    backgroundColor: item.priority === 'high' ? theme.colors.error + '30' : 
                                   item.priority === 'medium' ? '#FFA50030' : '#00BFFF30',
                    borderColor: item.priority === 'high' ? theme.colors.error : 
                               item.priority === 'medium' ? '#FFA500' : '#00BFFF',
                    borderWidth: 1,
                  }
                ]}
              >
                <Text style={{ 
                  color: item.priority === 'high' ? theme.colors.error : 
                        item.priority === 'medium' ? '#FFA500' : '#00BFFF',
                  fontSize: 10,
                  fontWeight: '600'
                }}>
                  {item.priority.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
      <Ionicons 
        name="notifications-off-outline" 
        size={48} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        No alerts found
      </Text>
    </View>
  );

  const handlePanicPress = async () => {
    setSnackbarMessage('Sending panic alert...');
    setSnackbarVisible(true);
    try {
      // Mock location and trip data
      const alertData = {
        type: 'panic',
        title: 'Panic Alert',
        message: 'Emergency panic alert activated',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610], // Mock location (NYC)
          address: 'Mock Address, 123 Main St',
        },
        tripId: '60c72b2f9b1d8c001f8e4c6a', // Mock trip ID
        priority: 'high',
        status: 'active'
      };

      const response = await alertAPI.sendPanicAlert(alertData);
      setAlerts([response.data, ...alerts]);
      setSnackbarMessage('Panic alert sent successfully!');
    } catch (err) {
      setSnackbarMessage('Failed to send panic alert.');
      console.error(err);
    } finally {
      setTimeout(() => setSnackbarVisible(false), 3000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search alerts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <View style={styles.filterContainer}>
        {['all', 'active', 'resolved', 'expired'].map(filter => (
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
                  color: activeFilter === filter ? '#fff' : theme.colors.primary
                }
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredAlerts.length > 0 ? (
        <FlatList
          data={filteredAlerts}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderEmptyState()
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.error }]}
        icon="alert"
        onPress={handlePanicPress}
        color="#fff"
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    minWidth: 60,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  priorityChip: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    minWidth: 50,
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
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80, // Extra padding for FAB
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});

export default AlertsScreen;
