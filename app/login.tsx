import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { authUser } from '~/utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await authUser({
        email,
        password,
      });

      // Force a complete app restart by replacing the entire stack
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-6">
      <View className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <Text className="text-3xl font-bold text-center mb-2 text-gray-900">Welcome Back</Text>
        <Text className="text-gray-600 text-center mb-6">Please sign in to your account</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-600 active:bg-blue-700'}`}
          onPress={handleLogin}
          disabled={loading}>
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        {error ? <Text className="text-red-500 text-center mt-3 text-sm">{error}</Text> : null}
      </View>
    </View>
  );
}
