import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center space-y-4">
          <Text className="text-4xl font-bold text-gray-900 text-center">
            This screen doesn't exist.
          </Text>
          <Link href="/" className="mt-4">
            <Text className="text-lg text-blue-600 underline font-medium">Go to home screen!</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
