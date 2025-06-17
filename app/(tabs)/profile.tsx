import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#1f2937',
          headerShadowVisible: false,
        }}
      />
      <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        <View className="p-6">
          {/* Profile Card */}
          <View className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden">
            {/* Card Header with Gradient */}
            <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold text-lg">👤</Text>
                </View>
                <View>
                  <Text className="text-white text-xl font-bold">User Profile</Text>
                  <Text className="text-blue-100 text-sm">Account Information</Text>
                </View>
              </View>
            </View>

            {/* Card Content */}
            <View className="p-6">
              {/* User ID Row */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 text-xs font-bold">#</Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </Text>
                </View>
                <Text className="text-lg font-semibold text-gray-900 ml-9">
                  {userData.userId || 'Not available'}
                </Text>
              </View>

              {/* Username Row */}
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-green-600 text-xs font-bold">@</Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </Text>
                </View>
                <Text className="text-lg font-semibold text-gray-900 ml-9">
                  {userData.username || 'Not available'}
                </Text>
              </View>
            </View>
          </View>
          {/* Logout Button */}
          <TouchableOpacity
            className="bg-red-500 py-4 px-6 rounded-2xl shadow-lg active:bg-red-600"
            onPress={handleClearTokensAndLogout}
            style={{
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-lg">← Sign Out</Text>
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-sm">
              Logged in as {userData.username || 'Guest'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
