import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './apiClient';

export async function getConversations(user_id: string) {
  try {
    const res = await apiClient.get(`/api/user/${user_id}/conversations`);
    console.debug(res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching protected data:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Unauthorized, consider redirecting to login or refreshing token.');
      await SecureStore.deleteItemAsync('accessToken');
      return 401;
    }
    throw error;
  }
}

export async function getChatMessages(convId: string) {
  try {
    const res = await apiClient.get(`/api/conversation/${convId}/messages`);
    console.debug(res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Unauthorized, consider redirecting to login or refreshing token.');
      await SecureStore.deleteItemAsync('accessToken');
      return 401;
    }
    throw error;
  }
}

export async function getConversation(convId: string) {
  try {
    const res = await apiClient.get(`/api/conversation/${convId}`);
    console.debug(res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Unauthorized, consider redirecting to login or refreshing token.');
      await SecureStore.deleteItemAsync('accessToken');
      return 401;
    }
    throw error;
  }
}
