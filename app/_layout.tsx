import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { checkAuth } from '../utils/apiClient';
import '../global.css';
import { Suspense } from 'react';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '~/drizzle/migrations';

SplashScreen.preventAutoHideAsync();
export const DATABASE_NAME = 'LFSC';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  // --- HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS ---
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
  }, [success]); // Re-run effect when migration success state changes

  // --- CONDITIONAL RETURNS CAN HAPPEN AFTER ALL HOOKS ---
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  // Show a loading state while migrations are running OR auth is being checked
  if (!success || isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>
          {!success ? 'Running migrations...' : 'Checking authentication...'}
        </Text>
      </View>
    );
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        <Stack initialRouteName={isAuthenticated ? '(tabs)' : 'login'}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat" />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
