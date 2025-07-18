import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get configuration from environment variables with fallbacks
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000';
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || 'ws://10.0.2.2:8080';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('WS_BASE_URL:', WS_BASE_URL);

// Export configuration for use in other files
export const config = {
  API_BASE_URL,
  WS_BASE_URL,
};

interface User {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  // Add any other expected fields from your auth response
}

interface Jwt {
  user_id: string;
  username: string;
  exp: string;
}

export interface UserData {
  userId: string | null;
  username: string | null;
}

export async function authUser({ email, password }: User): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/token`,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Auth Response Data:', response.data);
    let { access_token, refresh_token } = response.data;
    try {
      await SecureStore.setItemAsync('accessToken', JSON.stringify(access_token));
      await SecureStore.setItemAsync('refreshToken', JSON.stringify(refresh_token));
    } catch (e) {
      console.error(e);
    }

    return response.data;
  } catch (e: any) {
    let errorMessage = 'Authentication failed';
    if (axios.isAxiosError(e) && e.response) {
      console.error('Auth Error Data:', e.response.data);
      console.error('Auth Error Status:', e.response.status);
      errorMessage =
        e.response.data?.message ||
        e.response.data?.error ||
        `Request failed with status ${e.response.status}`;
    } else if (axios.isAxiosError(e) && e.request) {
      console.error('Auth Error Request:', e.request);
      errorMessage = 'Something went wrong.';
    } else {
      console.error('Auth Error Message:', e.message);
      errorMessage = e.message;
    }
    throw new Error(errorMessage);
  }
}

export async function getUserdata(): Promise<UserData> {
  let userId: string | null = null;
  let username: string | null = null;

  try {
    userId = await AsyncStorage.getItem('userId');
    username = await AsyncStorage.getItem('username');
    if (userId === null || username === null) {
      try {
        console.log('user id or username null, calling decodeJwt');
        await decodeJwt(); // Added await here for proper async handling
        userId = await AsyncStorage.getItem('userId');
        username = await AsyncStorage.getItem('username');
      } catch (e) {
        console.error('Error while getting asyncstorage items', e);
      }
    }

    console.log('Retrieved from AsyncStorage - userId:', userId);
    console.log('Retrieved from AsyncStorage - username:', username);
  } catch (e) {
    console.error('Error retrieving user data:', e);
  }

  return {
    userId,
    username,
  };
}

async function decodeJwt() {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (!accessToken) {
    console.warn('No access token found in SecureStore.');
    return;
  }

  try {
    const decodedToken = jwtDecode<Jwt>(accessToken);
    console.log('Decoded Token:', decodedToken);

    if (typeof decodedToken.user_id === 'string') {
      await AsyncStorage.setItem('userId', decodedToken.user_id);
    } else {
      console.warn('decodedToken.user_id is not a string. Value:', decodedToken.user_id);
    }

    if (typeof decodedToken.username === 'string') {
      await AsyncStorage.setItem('username', decodedToken.username);
    } else {
      console.warn('decodedToken.username is not a string. Value:', decodedToken.username);
    }

    let exp = decodedToken.exp.toString();
    if (typeof decodedToken.exp === 'string') {
      await AsyncStorage.setItem('exp', exp);
    } else {
      console.warn('decodedToken.username s not a string. Value:', exp);
    }
  } catch (e) {
    console.error('Error decoding JWT or saving user data to AsyncStorage:', e);
    throw e; // Re-throw to let caller handle the error
  }
}
