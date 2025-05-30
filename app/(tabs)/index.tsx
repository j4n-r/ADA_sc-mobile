import { Stack, Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react'; // Import useState and useEffect
import { StyleSheet, View, Text as ReactNativeText } from 'react-native'; // Use a basic Text for display
import { Button as TamaguiButton } from 'tamagui';
import * as SecureStore from 'expo-secure-store';

import { ScreenContent } from '~/components/ScreenContent';
import { getUserdata, UserData } from '~/utils/auth'; // Import UserData interface
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [userData, setUserData] = useState<UserData>({ userId: null, username: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const data = await getUserdata();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data for Home screen:', error);
        // Handle error appropriately, maybe set an error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once when the component mounts

  const handleClearTokensAndLogout = async () => {
    console.log('Clearing tokens...');
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await AsyncStorage.removeItem('userId'); // Also clear user data from AsyncStorage
      await AsyncStorage.removeItem('username');
      // await SecureStore.deleteItemAsync('refreshToken'); // If you also store refresh token
      console.log('Tokens and user data cleared.');
      setUserData({ userId: null, username: null }); // Clear user data in state
      router.replace('/login');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        {isLoading ? (
          <ReactNativeText>Loading user data...</ReactNativeText>
        ) : (
          <View style={{ marginTop: 20, padding: 10, borderWidth: 1, borderColor: 'grey' }}>
            <ReactNativeText>User ID: {userData.userId || 'N/A'}</ReactNativeText>
            <ReactNativeText>Username: {userData.username || 'N/A'}</ReactNativeText>
          </View>
        )}

        <TamaguiButton theme="red" onPress={handleClearTokensAndLogout} marginTop="$4" size="$4">
          Clear Tokens & Logout (Test)
        </TamaguiButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
});
