import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '../store/actions/authActions';
import ErrorBoundary from '../components/ErrorBoundary';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import TripsScreen from '../screens/trips/TripsScreen';
import TripSetupScreen from '../screens/trips/TripSetupScreen';
import AlertsScreen from '../screens/alerts/AlertsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MapScreen from '../screens/map/MapScreen';
import PanicScreen from '../screens/emergency/PanicScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import LanguageSelection from '../screens/auth/LanguageSelection';
import EFIRListScreen from '../screens/efir/EFIRListScreen';

// Import components
import CustomHeader from '../components/common/CustomHeader';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Main Tabs
const MainTabs = () => {
  const theme = useTheme();
  const [unreadCount, setUnreadCount] = useState(3);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = route.name;
          if (route.name === 'Alerts') {
            return (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color, fontSize: 12, marginBottom: 4 }}>{label}</Text>
              </View>
            );
          }
          return (
            <Text style={{ color, fontSize: 12, marginBottom: 4 }}>{label}</Text>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        header: ({ navigation, route, options }) => (
          <CustomHeader
            title={route.name}
            navigation={navigation}
            options={options}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Trips" 
        component={TripsScreen} 
        options={{ title: 'My Trips' }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen} 
        options={{ 
          title: 'Alerts',
          tabBarBadge: unreadCount, // This would come from your state
          tabBarBadgeStyle: { 
            backgroundColor: theme.colors.error,
            color: '#fff',
            fontSize: 10,
            lineHeight: 16,
            marginTop: 4,
          },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'My Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack
const RootStack = createNativeStackNavigator();

// EFIR Stack
const EFIRStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="EFIRList" 
      component={EFIRListScreen} 
      options={{ title: 'My e-FIRs' }}
    />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState(null);
  const [hasError, setHasError] = React.useState(false);
  const theme = useTheme();

  // Check if user is logged in
  React.useEffect(() => {
    let isMounted = true;
    
    const bootstrapAsync = async () => {
      try {
        const [token, userData] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData')
        ]);
        
        console.log('Bootstrap - Token:', !!token, 'UserData:', !!userData);
        
        // Only try to log in if both token and user data exist
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('User data loaded:', parsedUser);
            // Dispatch login success action
            dispatch(loginUser.fulfilled({ 
              token, 
              user: parsedUser 
            }));
          } catch (e) {
            console.error('Failed to parse user data', e);
            // Clear invalid data
            await AsyncStorage.multiRemove(['userToken', 'userData']);
          }
        } else if (token || userData) {
          // If only one of them exists, clear both to prevent inconsistencies
          await AsyncStorage.multiRemove(['userToken', 'userData']);
        }
        
        if (isMounted) {
          setHasError(false);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to load user data', e);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    bootstrapAsync();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Handle navigation state changes
  React.useEffect(() => {
    console.log('Navigation state changed:', { isAuthenticated, currentRoute, isLoading });
    
    // Don't proceed if still loading
    if (isLoading || authLoading) {
      return;
    }
    
    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      if (isAuthenticated && (currentRoute === 'MainTabs' || currentRoute === null)) {
        // Set current route to MainTabs if authenticated
        setCurrentRoute('MainTabs');
      } else if (!isAuthenticated || currentRoute === 'Auth') {
        // Set current route to Auth if not authenticated
        setCurrentRoute('Auth');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, currentRoute, isLoading, authLoading]);

  // Set initial route when authentication state changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated) {
        setCurrentRoute('MainTabs');
      } else {
        setCurrentRoute('Auth');
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      LocationTrackingService.stopTracking();
    };
  }, []);

  // Show splash screen while loading
  if (isLoading || authLoading) {
    return <SplashScreen />;
  }

  // Show error screen if there's an error
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
          Something went wrong. Please restart the app.
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
            // Retry bootstrap
            bootstrapAsync()
              .catch(e => {
                console.error('Retry failed:', e);
                setHasError(true);
              })
              .finally(() => {
                setIsLoading(false);
              });
          }}
        >
          Try Again
        </Button>
      </View>
    );
  }

  // Handle navigation state changes
  const handleNavigationStateChange = (state) => {
    try {
      if (state) {
        const routeName = getActiveRouteName(state);
        console.log('Navigation state change detected:', routeName);
        setCurrentRoute(routeName);
      }
    } catch (error) {
      console.error('Error handling navigation state change:', error);
    }
  };

  // Helper function to get active route name
  const getActiveRouteName = (state) => {
    try {
      if (!state || !state.routes || state.routes.length === 0) {
        return null;
      }
      
      const route = state.routes[state.index];
      if (route && route.state) {
        return getActiveRouteName(route.state);
      }
      return route ? route.name : null;
    } catch (error) {
      console.error('Error getting active route name:', error);
      return null;
    }
  };

  return (
    <ErrorBoundary>
      <NavigationContainer 
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.notification,
          },
        }}
        onStateChange={handleNavigationStateChange}
      >
      <RootStack.Navigator initialRouteName={isAuthenticated ? 'MainTabs' : 'Auth'}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <RootStack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{ 
            headerShown: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
          }}
        />
        <RootStack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="EFIRList"
          component={EFIRStack}
          options={{ headerShown: false }}
        />
        {/* Add modal screens here */}
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen 
            name="TripSetup" 
            component={TripSetupScreen}
            options={{ 
              title: 'Plan Your Trip',
              headerShown: true,
            }}
          />
          <RootStack.Screen 
            name="Panic" 
            component={PanicScreen}
            options={{ 
              title: 'Emergency Alert',
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Map" 
            component={MapScreen}
            options={{ 
              title: 'Live Map',
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard}
            options={{ 
              title: 'Admin Dashboard',
              headerShown: false,
            }}
          />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppNavigator;
