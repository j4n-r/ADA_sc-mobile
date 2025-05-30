import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../app.config';
import { router } from 'expo-router';

const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT to requests
apiClient.interceptors.request.use(
  async (axiosConfig: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    console.log(error);
    router.replace('/login'); // Or to a specific authenticated route
  }
);

export const checkAuth = async () => {
  try {
    const response = await apiClient.get('/');
    console.log(response.request);
    return response.data;
  } catch (error) {
    console.error('Error fetching protected data:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Unauthorized, consider redirecting to login or refreshing token.');
      await SecureStore.deleteItemAsync('accessToken');
      return 401;
    }
    throw error;
  }
};

// // Example function to post some data
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
