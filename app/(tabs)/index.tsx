import { Stack, Link, router } from 'expo-router'; // Import router
import { StyleSheet, View } from 'react-native';
import { Button as TamaguiButton } from 'tamagui'; // Assuming you use Tamagui for buttons
import * as SecureStore from 'expo-secure-store';

import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  const handleClearTokensAndLogout = async () => {
    console.log('Clearing tokens...');
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken'); // If you also store refresh token
      console.log('Tokens cleared.');
      // After clearing tokens, the useFocusEffect in (tabs)/_layout.tsx should
      // detect the unauthenticated state on next focus/navigation and redirect.
      // You can also explicitly navigate to login if you want immediate effect without relying on focus.
      router.replace('/login');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <TamaguiButton
          theme="red" // Example theme from Tamagui
          onPress={handleClearTokensAndLogout}
          marginTop="$4"
          size="$4">
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
    alignItems: 'center', // Optional: center the button
  },
});
