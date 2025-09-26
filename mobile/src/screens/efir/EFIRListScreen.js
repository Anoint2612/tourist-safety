import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Text, Button, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { efirAPI } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const EFIRListScreen = ({ route }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const [efirs, setEfirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadEFIRs = async () => {
    try {
      const result = await efirAPI.getEfirs();
      if (result.success) {
        setEfirs(result.data || []);
        setError('');
      } else {
        setError('Failed to load E-FIRs');
      }
    } catch (err) {
      console.error('Error loading E-FIRs:', err);
      setError('Failed to load E-FIRs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      loadEFIRs();
    };

    loadData();

    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        loadData();
        navigation.setParams({ refresh: false });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEFIRs();
  };

  const handleEFIRPress = (efir) => {
    navigation.navigate('EFIRDetail', { efirId: efir.id });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'verified':
        return theme.colors.info;
      case 'assigned':
        return theme.colors.primary;
      case 'sent':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderEFIRItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleEFIRPress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Title style={styles.cardTitle}>{item.filedBy}</Title>
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
            <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          
          <Paragraph numberOfLines={2} style={styles.description}>
            {item.description}
          </Paragraph>
          
          {item.assignedInspector?.name && (
            <View style={styles.inspectorContainer}>
              <Ionicons name="person" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.inspectorText}>
                Inspector: {item.assignedInspector.name}
              </Text>
            </View>
          )}
          
          <View style={styles.cardFooter}>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.efirId}>#{item._id?.substring(0, 8) || ''}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={loadEFIRs}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : efirs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No E-FIRs found</Text>
          <Text style={styles.emptySubtext}>File a new E-FIR using the + button below</Text>
        </View>
      ) : (
        <FlatList
          data={efirs}
          renderItem={renderEFIRItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('EFIRCreate')}
        color="white"
      />
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  phoneText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 90,
    textTransform: 'capitalize',
  },
  description: {
    marginBottom: 12,
    color: '#555',
  },
  inspectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  inspectorText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  efirId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default EFIRListScreen;
