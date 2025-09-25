import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'react-native-paper';

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
import LanguageSelection from '../screens/auth/LanguageSelection'

// Import components
import CustomHeader from '../components/common/CustomHeader';
import { View, Text } from 'react-native'

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

// Main App Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  const theme = useTheme();

  // Check if user is logged in
  React.useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load user token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={{
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
    }}>
      <RootStack.Navigator initialRouteName={userToken ? 'MainTabs' : 'Auth'}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <RootStack.Screen
          name="Auth"
          component={AuthStack}
          options={{ 
            headerShown: false,
            animationTypeForReplace: userToken ? 'push' : 'pop',
          }}
        />
        <RootStack.Screen
          name="MainTabs"
          component={MainTabs}
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
  );
};

export default AppNavigator;
