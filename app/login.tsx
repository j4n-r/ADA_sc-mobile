// LoginScreen.tsx
import React, { useState } from 'react';
import { Stack, Text, Input, Button, Label, YStack, XStack, Separator, Theme } from 'tamagui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Logged in!');
    }, 1200);
  };

  return (
    <Theme name="light">
      <YStack f={1} jc="center" ai="center" bg="$background" p="$6" minHeight={400} space="$4">
        <Stack bg="$color2" p="$6" br="$4" elevation={4} width={350} maxWidth="90vw" space="$4">
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

          <XStack jc="space-between" ai="center" mt="$2">
            <XStack ai="center" space="$2">
              <Input type="checkbox" id="remember" size="$2" />
              <Label htmlFor="remember" size="$2">
                Remember me
              </Label>
            </XStack>
            <Text
              color="$color9"
              fontSize={13}
              cursor="pointer"
              onPress={() => alert('Forgot password?')}>
              Forgot password?
            </Text>
          </XStack>

          <Button mt="$4" size="$5" onPress={handleLogin} disabled={loading} themeInverse>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

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
