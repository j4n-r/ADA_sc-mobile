import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserdata, UserData } from '~/utils/auth';

export default function Home() {
  const [userData, setUserData] = useState<UserData>({ userId: null, username: null });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserdata();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data for Home screen:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleClearTokensAndLogout = async () => {
    console.log('Clearing tokens...');
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('username');
      console.log('Tokens and user data cleared.');
      setUserData({ userId: null, username: null });
      router.replace('/login');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#1f2937',
        }}
      />
      <View className="flex-1 bg-gray-50 p-4 items-center">
        <View className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <View className="p-6 border-b border-gray-100">
            <View className="flex-row items-center space-x-3">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Text className="text-blue-600 font-semibold">👤</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">User Profile</Text>
            </View>
          </View>

          {/* Card Content */}
          <View className="p-6 space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">User ID:</Text>
              <Text className="text-base font-semibold text-gray-900">
                {userData.userId || 'N/A'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Username:</Text>
              <Text className="text-base font-semibold text-gray-900">
                {userData.username || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="w-full max-w-md bg-red-600 py-4 px-6 rounded-lg mt-4 flex-row items-center justify-center space-x-2 active:bg-red-700"
          onPress={handleClearTokensAndLogout}>
          <Text className="text-white font-semibold text-lg">🚪</Text>
          <Text className="text-white font-semibold text-lg">Clear Tokens & Logout</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
