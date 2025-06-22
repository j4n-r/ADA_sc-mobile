import { SplashScreen, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { checkAuth } from '../utils/apiClient';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔍 Verifying authentication at root level...');
        const isAuth = await checkAuth();
        console.log('🔍 Root auth result:', isAuth);
        setIsAuthenticated(isAuth);

        // Navigate based on auth result
        if (isAuth) {
          console.log('User authenticated, navigating to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('User not authenticated, navigating to login');
          router.replace('/login');
        }
      } catch (error) {
        console.error('🔍 Error verifying auth at root:', error);
        setIsAuthenticated(false);
        router.replace('/login');
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

  // Define all screens - don't conditionally render them
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
