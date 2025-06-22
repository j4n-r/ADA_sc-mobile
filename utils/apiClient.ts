import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from './auth';
import { router } from 'expo-router';

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fixed interceptor to properly add JWT to requests
apiClient.interceptors.request.use(
  async (axiosConfig: InternalAxiosRequestConfig) => {
    let token = null;
    try {
      token = await SecureStore.getItemAsync('accessToken'); // ✅ Fixed: assign the result
    } catch (e) {
      console.error('no access token available', e);
    }

    if (token) {
      // Clean the token (remove quotes if stored as JSON string)
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      console.log('apiClient access token (first 20 chars):', cleanToken.substring(0, 20) + '...');
      axiosConfig.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
      console.log('No access token available for request');
    }
    return axiosConfig;
  },
  (error) => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error); // Don't redirect on request errors
  }
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Received 401 - Unauthorized, redirecting to login');
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);

export async function checkAuth(): Promise<boolean> {
  try {
    // Get token manually for testing
    const token = await SecureStore.getItemAsync('accessToken');
    if (token === null) {
      console.warn('no token found');
      return false;
    }

    const res = await apiClient.get(`${config.API_BASE_URL}/auth/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Direct request result:', res.data);
    return res.data.authenticated;
  } catch (e) {
    console.error('Direct checkAuth failed:', e);
    return false;
  }
}
// // Example function to post some data (will now include auth token)
// export const postSomeData = async (data: any) => {
//   try {
//     const response = await apiClient.post('/another-protected-route', data);
//     return response.data;
//   } catch (error) {
//     console.error('Error posting data:', error);
//     if (axios.isAxiosError(error) && error.response?.status === 401) {
//       console.log('Unauthorized, consider redirecting to login or refreshing token.');
//     }
//     throw error;
//   }
// };
