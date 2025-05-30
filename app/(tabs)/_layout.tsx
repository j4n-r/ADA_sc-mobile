import { Link, Tabs, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { TabBarIcon } from '../../components/TabBarIcon';
import { checkAuth } from '../../utils/apiClient';

export default function TabLayout() {
  useFocusEffect(
    useCallback(() => {
      const verifyAuthentication = async () => {
        console.log('Checking auth status for tabs...');
        try {
          const authStatus = await checkAuth();
          if (authStatus === 401) {
            console.log('User is not authenticated or token expired. Redirecting to login.');
            router.replace('/login');
          } else {
            console.log('User is authenticated for tabs.');
          }
        } catch (error) {
          console.error('Error during auth check for tabs:', error);
          router.replace('/login');
        }
      };

      verifyAuthentication();
    }, [])
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
        },
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
        headerTintColor: '#1f2937',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
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
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
