import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Stack, Text, Input, Button, Label, YStack, XStack, Separator, Theme } from 'tamagui';
import { authUser } from '~/utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError(''); // clear any existing error
    try {
      const res = await authUser({ email, password });

      console.log(res);
      if (!res.ok) {
      }
      const { accessToken, refreshToken } = await res;
      // TODO save access token i secure storage
      router.replace('/');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    }
  };

  return (
    <Theme name="light">
      <YStack f={1} jc="center" ai="center" bg="$background" p="$6" minHeight={400}>
        <Stack bg="$color2" p="$6" br="$4" elevation={4} width={350} maxWidth="90vw">
          <Text fontSize={28} fontWeight="700" ta="center" mb="$2">
            Welcome Back
          </Text>
          <Text color="$color10" ta="center" mb="$4">
            Please sign in to your account
          </Text>

          <YStack space="$3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              size="$4"
            />

            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              size="$4"
            />
          </YStack>

          <Button mt="$4" size="$5" onPress={() => handleLogin()} themeInverse>
            Sign in
          </Button>
          {error ? (
            <Text color="red" mt="$2">
              {error}
            </Text>
          ) : null}
          <Separator my="$3" />

          <XStack jc="center" ai="center" space="$2">
            <Text color="$color10">Don't have an account?</Text>
            <Text
              color="$color9"
              fontWeight="600"
              cursor="pointer"
              onPress={() => alert('Sign up!')}>
              Sign up
            </Text>
          </XStack>
        </Stack>
      </YStack>
    </Theme>
  );
}
