import React from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const SplashScreen = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Tourist Safety App
        </Text>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
          style={styles.loader}
        />
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 20,
  },
  loader: {
    marginVertical: 10,
  },
});

export default SplashScreen;
