import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, SplashScreen } from 'expo-router';
import { checkAuth } from '../utils/apiClient';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Index: Checking authentication...');
        const isAuthenticated = await checkAuth();
        console.log('Index: Authentication result:', isAuthenticated);

        if (isAuthenticated) {
          console.log('Index: Redirecting to /(tabs)');
          router.replace('/(tabs)');
        } else {
          console.log('Index: Redirecting to /login');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Index: Auth check failed:', error);
        router.replace('/login');
      } finally {
        // Hide splash screen after auth check
        SplashScreen.hideAsync();
      }
    };

    // Add a small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      handleAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
      }}>
      <Text style={{ fontSize: 20, color: '#1f2937', marginBottom: 20 }}>Authentication Check</Text>
      <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
        Checking authentication status...
      </Text>
      <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
        If this screen persists, check the console logs
      </Text>
    </View>
  );
}
