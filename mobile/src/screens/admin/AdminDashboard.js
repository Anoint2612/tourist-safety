import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Button,
  DataTable,
  Searchbar,
  FAB,
  Badge
} from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Sample data
  const [dashboardData, setDashboardData] = useState({
    totalTourists: 1247,
    activeAlerts: 23,
    resolvedAlerts: 156,
    highRiskZones: 8,
    averageResponseTime: '3.2 minutes',
    safetyScore: 87,
  });

  const [recentAlerts] = useState([
    {
      id: '1',
      type: 'panic',
      tourist: 'John Doe',
      location: '28.6139, 77.2090',
      timestamp: '2024-01-15 14:30:00',
      status: 'active',
      priority: 'high',
    },
    {
      id: '2',
      type: 'geofence',
      tourist: 'Jane Smith',
      location: '28.6149, 77.2100',
      timestamp: '2024-01-15 14:25:00',
      status: 'resolved',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'anomaly',
      tourist: 'Mike Johnson',
      location: '28.6159, 77.2110',
      timestamp: '2024-01-15 14:20:00',
      status: 'investigating',
      priority: 'high',
    },
  ]);

  const [touristLocations] = useState([
    { id: '1', name: 'John Doe', lat: 28.6139, lng: 77.2090, status: 'safe', lastSeen: '2 min ago' },
    { id: '2', name: 'Jane Smith', lat: 28.6149, lng: 77.2100, status: 'warning', lastSeen: '5 min ago' },
    { id: '3', name: 'Mike Johnson', lat: 28.6159, lng: 77.2110, status: 'at_risk', lastSeen: '10 min ago' },
    { id: '4', name: 'Sarah Wilson', lat: 28.6169, lng: 77.2120, status: 'safe', lastSeen: '1 min ago' },
  ]);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'home-outline' },
    { key: 'alerts', label: 'Alerts', icon: 'alert-circle-outline' },
    { key: 'tourists', label: 'Tourists', icon: 'people-outline' },
    { key: 'map', label: 'Map', icon: 'map-outline' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'at_risk': return theme.colors.error;
      case 'active': return theme.colors.error;
      case 'resolved': return theme.colors.success;
      case 'investigating': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content style={styles.statContent}>
            <Ionicons name="people" size={32} color="#fff" />
            <Text style={styles.statNumber}>{dashboardData.totalTourists}</Text>
            <Text style={styles.statLabel}>Total Tourists</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.error }]}>
          <Card.Content style={styles.statContent}>
            <Ionicons name="alert-circle" size={32} color="#fff" />
            <Text style={styles.statNumber}>{dashboardData.activeAlerts}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.success }]}>
          <Card.Content style={styles.statContent}>
            <Ionicons name="checkmark-circle" size={32} color="#fff" />
            <Text style={styles.statNumber}>{dashboardData.resolvedAlerts}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.warning }]}>
          <Card.Content style={styles.statContent}>
            <Ionicons name="warning" size={32} color="#fff" />
            <Text style={styles.statNumber}>{dashboardData.highRiskZones}</Text>
            <Text style={styles.statLabel}>Risk Zones</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Performance Metrics */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.primary }]}>
            Performance Metrics
          </Title>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
              Average Response Time
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
              {dashboardData.averageResponseTime}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
              Overall Safety Score
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.success }]}>
              {dashboardData.safetyScore}%
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.cardTitle, { color: theme.colors.primary }]}>
            Recent Activity
          </Title>
          {recentAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons 
                  name={alert.type === 'panic' ? 'alert-circle' : 'warning'} 
                  size={20} 
                  color={getStatusColor(alert.status)} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                  {alert.tourist} - {alert.type.toUpperCase()}
                </Text>
                <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>
                  {alert.timestamp}
                </Text>
              </View>
              <Chip 
                mode="outlined" 
                style={{ borderColor: getStatusColor(alert.status) }}
                textStyle={{ color: getStatusColor(alert.status) }}
              >
                {alert.status}
              </Chip>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderAlerts = () => (
    <ScrollView style={styles.tabContent}>
      <Searchbar
        placeholder="Search alerts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <DataTable style={[styles.dataTable, { backgroundColor: theme.colors.surface }]}>
        <DataTable.Header>
          <DataTable.Title>Tourist</DataTable.Title>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title>Priority</DataTable.Title>
          <DataTable.Title>Status</DataTable.Title>
          <DataTable.Title>Time</DataTable.Title>
        </DataTable.Header>

        {recentAlerts.map((alert) => (
          <DataTable.Row 
            key={alert.id}
            onPress={() => setSelectedAlert(alert)}
          >
            <DataTable.Cell>{alert.tourist}</DataTable.Cell>
            <DataTable.Cell>
              <Chip 
                mode="outlined" 
                compact
                style={{ borderColor: getPriorityColor(alert.priority) }}
                textStyle={{ color: getPriorityColor(alert.priority) }}
              >
                {alert.type}
              </Chip>
            </DataTable.Cell>
            <DataTable.Cell>
              <Badge 
                style={{ backgroundColor: getPriorityColor(alert.priority) }}
              >
                {alert.priority}
              </Badge>
            </DataTable.Cell>
            <DataTable.Cell>
              <Chip 
                mode="outlined" 
                compact
                style={{ borderColor: getStatusColor(alert.status) }}
                textStyle={{ color: getStatusColor(alert.status) }}
              >
                {alert.status}
              </Chip>
            </DataTable.Cell>
            <DataTable.Cell>{alert.timestamp}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );

  const renderTourists = () => (
    <ScrollView style={styles.tabContent}>
      <Searchbar
        placeholder="Search tourists..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {touristLocations.map((tourist) => (
        <Card key={tourist.id} style={[styles.touristCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.touristHeader}>
              <View style={styles.touristInfo}>
                <Text style={[styles.touristName, { color: theme.colors.text }]}>
                  {tourist.name}
                </Text>
                <Text style={[styles.touristLastSeen, { color: theme.colors.textSecondary }]}>
                  Last seen: {tourist.lastSeen}
                </Text>
              </View>
              <Chip 
                mode="outlined" 
                style={{ borderColor: getStatusColor(tourist.status) }}
                textStyle={{ color: getStatusColor(tourist.status) }}
              >
                {tourist.status.replace('_', ' ')}
              </Chip>
            </View>
            <View style={styles.touristActions}>
              <Button mode="outlined" compact>
                View Details
              </Button>
              <Button mode="outlined" compact>
                Send Alert
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {touristLocations.map((tourist) => (
          <Marker
            key={tourist.id}
            coordinate={{ latitude: tourist.lat, longitude: tourist.lng }}
            title={tourist.name}
            description={`Status: ${tourist.status}`}
            pinColor={getStatusColor(tourist.status)}
          />
        ))}
        
        {/* Risk Zones */}
        <Circle
          center={{ latitude: 28.6139, longitude: 77.2090 }}
          radius={500}
          fillColor="rgba(255, 87, 34, 0.2)"
          strokeColor="#FF5722"
          strokeWidth={2}
        />
      </MapView>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'alerts': return renderAlerts();
      case 'tourists': return renderTourists();
      case 'map': return renderMap();
      default: return renderOverview();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Tourist Safety Monitoring</Text>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.key ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? '#fff' : theme.colors.primary} 
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.key ? '#fff' : theme.colors.primary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => console.log('Add new alert')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBar: {
    marginBottom: 16,
  },
  dataTable: {
    elevation: 2,
  },
  touristCard: {
    marginBottom: 12,
    elevation: 2,
  },
  touristHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  touristInfo: {
    flex: 1,
  },
  touristName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  touristLastSeen: {
    fontSize: 12,
    marginTop: 2,
  },
  touristActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mapContainer: {
    flex: 1,
    height: height * 0.6,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 4,
  },
});

export default AdminDashboard;
