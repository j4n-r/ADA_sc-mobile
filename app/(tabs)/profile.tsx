import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserdata, UserData } from '~/utils/auth';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { sql } from 'drizzle-orm';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Home() {
  const [userData, setUserData] = useState<UserData>({ userId: null, username: null });
  const [isDeletingCache, setIsDeletingCache] = useState(false);

  // Add Drizzle DB support
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

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

  const handleDeleteCache = async () => {
    Alert.alert(
      'Delete Cache',
      'This will delete all cached messages and conversations from your device. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingCache(true);
            try {
              // Delete all messages
              await drizzleDb.delete(schema.messages);
              console.log('Deleted all messages from local cache');

              // Delete all conversations
              await drizzleDb.delete(schema.conversations);
              console.log('Deleted all conversations from local cache');

              // Delete conversation members if you have that table
              if (schema.conversationMembers) {
                await drizzleDb.delete(schema.conversationMembers);
                console.log('Deleted all conversation members from local cache');
              }

              Alert.alert(
                'Cache Cleared',
                'All cached messages and conversations have been deleted from your device.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Failed to delete cache:', error);
              Alert.alert('Error', 'Failed to delete cache. Please try again.', [{ text: 'OK' }]);
            } finally {
              setIsDeletingCache(false);
            }
          },
        },
      ]
    );
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
      <ScrollView className="flex-1">
        <View className="p-6 pt-14">
          {/* Profile Card */}
          <View className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden">
            {/* Card Header with Gradient */}
            <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                  <AntDesign name="user" size={24} color="black" />
                </View>
                <View>
                  <Text className="text-gray text-xl font-bold">User Profile</Text>
                  <Text className="text-gray-400 text-md">Account Information</Text>
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

          {/* Delete Cache Button */}
          <TouchableOpacity
            className={`py-4 px-6 rounded-2xl shadow-lg mb-4 ${
              isDeletingCache ? 'bg-gray-400' : 'bg-orange-500 active:bg-orange-600'
            }`}
            onPress={handleDeleteCache}
            disabled={isDeletingCache}
            style={{
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <View className="flex-row items-center justify-center">
              <AntDesign name="delete" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-lg">
                {isDeletingCache ? 'Deleting Cache...' : 'Delete Cache'}
              </Text>
            </View>
          </TouchableOpacity>

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
              <AntDesign name="logout" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-lg">Sign Out</Text>
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
