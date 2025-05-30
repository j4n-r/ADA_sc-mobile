import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { config } from '../app.config';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: String;
  password: String;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  // Add any other expected fields from your auth response
}
interface Jwt {
  user_id: string;
  username: string;
}

export interface UserData {
  userId: string | null;
  username: string | null;
}

export async function authUser({ email, password }: User): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${config.API_BASE_URL}/auth/token`,
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
      console.error('Auth Error Request:', e.request); // This was the error you saw earlier
      errorMessage = 'No response from server. Is the server running and accessible?';
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
        decodeJwt();
        userId = await AsyncStorage.getItem('userId');
        username = await AsyncStorage.getItem('username');
      } catch (e) {
        console.error('Error while getting asyncstorage items', e);
      }
    }

    console.log('Retrieved from AsyncStorage - userId:', userId);
    console.log('Retrieved from AsyncStorage - username:', username);
  } catch (e) {}

  return {
    userId,
    username,
  };
}

async function decodeJwt() {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const decodedToken = jwtDecode<Jwt>(accessToken); // Use generic for type safety
  console.log('Decoded Token:', decodedToken);

  try {
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
  } catch (e) {
    console.error('Error saving user data to AsyncStorage:', e);
    // Decide if this error should fail the whole authUser function
    // For now, we'll let authUser succeed but log the storage error.
  }
}
