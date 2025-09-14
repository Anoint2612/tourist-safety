import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Appbar, useTheme, Text, Avatar } from 'react-native-paper';

const CustomHeader = ({ navigation, route, options, back }) => {
  const theme = useTheme();
  const { title } = options || {};

  // Don't show header for screens that explicitly set headerShown: false
  if (options && options.headerShown === false) {
    return null;
  }

  // Check if we're in the profile tab
  const isProfileTab = route?.name === 'Profile';

  return (
    <Appbar.Header 
      style={[styles.header, { backgroundColor: theme.colors.primary }]}
      theme={{
        colors: {
          primary: theme.colors.surface,
          text: theme.colors.surface,
          surface: theme.colors.primary,
        },
      }}
    >
      {back ? (
        <Appbar.BackAction 
          onPress={navigation.goBack} 
          color={theme.colors.surface}
        />
      ) : (
        <Appbar.Action 
          icon="menu" 
          onPress={() => navigation.openDrawer()}
          color={theme.colors.surface}
        />
      )}
      
      <Appbar.Content
        title={
          <Text 
            style={[styles.title, { color: theme.colors.surface }]}
            numberOfLines={1}
          >
            {options?.title || title || route?.name}
          </Text>
        }
        titleStyle={styles.title}
      />
      
      {isProfileTab ? (
        <View style={styles.profileActions}>
          <Appbar.Action 
            icon="bell-outline" 
            onPress={() => console.log('Notifications')}
            color={theme.colors.surface}
          />
          <Appbar.Action 
            icon="cog" 
            onPress={() => console.log('Settings')}
            color={theme.colors.surface}
          />
        </View>
      ) : (
        <Appbar.Action 
          icon="bell-outline" 
          onPress={() => console.log('Notifications')}
          color={theme.colors.surface}
        />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        borderBottomWidth: 0,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CustomHeader;
