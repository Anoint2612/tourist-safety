import { alertAPI } from './api';

// Sample alert data for development
const sampleAlerts = [
  {
    id: '1',
    type: 'panic',
    message: 'Emergency alert triggered',
    location: { latitude: 28.6139, longitude: 77.2090 },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'active',
    read: false,
  },
  {
    id: '2',
    type: 'geofence',
    message: 'You have entered a high-risk area',
    location: { latitude: 28.6149, longitude: 77.2100 },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'resolved',
    read: true,
  },
  {
    id: '3',
    type: 'anomaly',
    message: 'Unusual activity detected',
    location: { latitude: 28.6159, longitude: 77.2110 },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    status: 'investigating',
    read: false,
  },
];

export const getAlerts = async (filter = 'all') => {
  try {
    // In development, return sample data
    if (__DEV__) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredAlerts = sampleAlerts;
          
          if (filter !== 'all') {
            filteredAlerts = sampleAlerts.filter(alert => alert.type === filter);
          }
          
          resolve(filteredAlerts);
        }, 1000);
      });
    }
    
    // In production, call the actual API
    const response = await alertAPI.getAlerts();
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const getAlert = async (alertId) => {
  try {
    if (__DEV__) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const alert = sampleAlerts.find(a => a.id === alertId);
          resolve(alert);
        }, 500);
      });
    }
    
    const response = await alertAPI.getAlert(alertId);
    return response.data;
  } catch (error) {
    console.error('Error fetching alert:', error);
    throw error;
  }
};

export const markAlertAsRead = async (alertId) => {
  try {
    if (__DEV__) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 500);
      });
    }
    
    const response = await alertAPI.markAlertAsRead(alertId);
    return response.data;
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

export const createPanicAlert = async (alertData) => {
  try {
    if (__DEV__) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newAlert = {
            id: Date.now().toString(),
            ...alertData,
            timestamp: new Date().toISOString(),
            priority: 'high',
            status: 'active',
            read: false,
          };
          resolve(newAlert);
        }, 1000);
      });
    }
    
    const response = await alertAPI.sendPanicAlert(alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating panic alert:', error);
    throw error;
  }
};

export const getAlertStats = async () => {
  try {
    if (__DEV__) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const stats = {
            total: sampleAlerts.length,
            unread: sampleAlerts.filter(a => !a.read).length,
            active: sampleAlerts.filter(a => a.status === 'active').length,
            resolved: sampleAlerts.filter(a => a.status === 'resolved').length,
            byType: {
              panic: sampleAlerts.filter(a => a.type === 'panic').length,
              geofence: sampleAlerts.filter(a => a.type === 'geofence').length,
              anomaly: sampleAlerts.filter(a => a.type === 'anomaly').length,
            }
          };
          resolve(stats);
        }, 500);
      });
    }
    
    // In production, this would be a separate API endpoint
    const alerts = await getAlerts();
    const stats = {
      total: alerts.length,
      unread: alerts.filter(a => !a.read).length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      byType: {
        panic: alerts.filter(a => a.type === 'panic').length,
        geofence: alerts.filter(a => a.type === 'geofence').length,
        anomaly: alerts.filter(a => a.type === 'anomaly').length,
      }
    };
    return stats;
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    throw error;
  }
};