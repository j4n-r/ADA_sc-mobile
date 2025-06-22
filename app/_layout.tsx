import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { checkAuth } from '../utils/apiClient';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('  Verifying authentication at root level...');
        const isAuth = await checkAuth();
        console.log('  Root auth result:', isAuth);
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('  Error verifying auth at root:', error);
        setIsAuthenticated(false);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    verifyAuth();
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <Stack initialRouteName={isAuthenticated ? '(tabs)' : 'login'}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat" />
    </Stack>
  );
}
