import { Link, Tabs, router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { checkAuth } from '../../utils/apiClient'; // Import your checkAuth function

export default function TabLayout() {
  useFocusEffect(
    useCallback(() => {
      const verifyAuthentication = async () => {
        console.log('Checking auth status for tabs...');
        try {
          const authStatus = await checkAuth(); // This function already handles 401
          if (authStatus === 401) {
            console.log('User is not authenticated or token expired. Redirecting to login.');
            router.replace('/login');
          } else {
            console.log('User is authenticated for tabs.');
          }
        } catch (error) {
          // Handle other errors from checkAuth if necessary, though it already logs
          console.error('Error during auth check for tabs:', error);
          router.replace('/login'); // Fallback to login on other errors
        }
      };

      verifyAuthentication();

      // Optional: Return a cleanup function if needed, though not typical for auth checks
      // return () => console.log('Tabs screen lost focus or unmounted');
    }, []) // Empty dependency array means it runs on focus
  );
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="chatbubble-outline" color={color} solid={false} regular />
          ),
        }}
      />
    </Tabs>
  );
}
