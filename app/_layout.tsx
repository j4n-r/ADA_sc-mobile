import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { checkAuth } from '../utils/apiClient';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'login', // Start with login as default
};

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔍 Verifying authentication at root level...');
        const isAuth = await checkAuth();
        console.log('🔍 Root auth result:', isAuth);
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('🔍 Error verifying auth at root:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        // Hide splash screen once auth check is complete
        SplashScreen.hideAsync();
      }
    };

    verifyAuth();
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is authenticated - show main app
        <Stack.Screen name="(tabs)" />
      ) : (
        // User is not authenticated - show login
        <Stack.Screen name="login" />
      )}
    </Stack>
  );
}
