import { Tabs, router, useFocusEffect } from 'expo-router';
import { useState, useEffect } from 'react';
import { TabBarIcon } from '../../components/TabBarIcon';
import { checkAuth } from '../../utils/apiClient';

export default function TabLayout() {
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔍 Verifying authentication...');
        const isAuth = await checkAuth();

        console.log('🔍 Auth result:', isAuth);

        if (isAuth) {
          console.log(' User is authenticated');
        } else {
          console.log(' User is not authenticated, redirecting to login');
          router.replace('/login');
        }
      } catch (error) {
        console.error(' Error verifying auth:', error);
        router.replace('/login');
      } finally {
      }
    };

    verifyAuth();
  }, []);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#f8fafc',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#1f2937',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="(conversations)"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
