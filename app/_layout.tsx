import { SplashScreen, Stack } from 'expo-router';
import React from 'react';
import '../global.css';
import { Suspense } from 'react';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '~/drizzle/migrations';
import { View, Text, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync();
export const DATABASE_NAME = 'LFSC';

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Running migrations...</Text>
      </View>
    );
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        <Stack>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat" />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
