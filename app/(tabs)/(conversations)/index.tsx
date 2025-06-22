import { Stack } from 'expo-router';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { getUserdata } from '~/utils/auth';
import { getConversations } from '~/utils/api';

// Type for conversation data from API (updated to match your schema)
type Conversation = {
  conversation_id: string;
  created_at: string;
  description: string | null;
  id: string;
  joined_at: string;
  name: string;
  owner_id: string | null;
  role: string;
  updated_at: string;
  user_id: string;
};

// Type for transformed chat data for display
type ChatItem = {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  role: string;
};

export default function ChatList() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const transformConversationToChat = (conversation: Conversation): ChatItem => {
    const formatTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) {
        // Less than a week
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    };

    return {
      id: conversation.id, // Use the main conversation ID for consistency
      name: conversation.name,
      description: conversation.description || undefined,
      timestamp: formatTimestamp(conversation.updated_at),
      role: conversation.role,
    };
  };

  // Fetch conversations function (extracted for reuse)
  const fetchConversations = useCallback(async () => {
    if (!userData?.userId) return;

    try {
      setLoading(true);
      const response = await getConversations(userData.userId);

      if (response === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (response && response.conversations) {
        const transformedChats = response.conversations.map(transformConversationToChat);
        setChats(transformedChats);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [userData?.userId]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserdata();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data for ChatList:', error);
        setError('Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  // Fetch conversations when userData is available (initial load)
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refetch conversations every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userData?.userId) {
        console.log('Screen focused, refetching conversations...');
        fetchConversations();
      }
    }, [fetchConversations, userData?.userId])
  );

  const renderAvatar = (chat: ChatItem) => {
    // Generate a color based on the chat name for consistency
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500',
    ];

    const colorIndex = chat.name.length % colors.length;
    const bgColor = colors[colorIndex];

    const initials = chat.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View className={`w-14 h-14 ${bgColor} rounded-full items-center justify-center shadow-sm`}>
        <Text className="text-white font-bold text-lg">{initials}</Text>
      </View>
    );
  };

  const handleRetry = async () => {
    setError(null);
    await fetchConversations();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-white p-8 rounded-2xl shadow-sm">
          <Text className="text-gray-600 text-lg">Loading conversations...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-8">
        <View className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">
          <Text className="text-red-600 text-center text-lg mb-4">{error}</Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="bg-blue-500 px-6 py-3 rounded-xl active:bg-blue-600">
            <Text className="text-white text-center font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Chats' }} />
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
          <Text className="text-3xl font-bold text-gray-900">Conversations</Text>
          <Text className="text-gray-500 mt-1">
            {chats.length} conversation{chats.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Chat List */}
        <ScrollView className="flex-1 px-4 pt-4">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => {
                  router.push(`/(tabs)/(conversations)/chat?chatId=${chat.id}`);
                }}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50">
                <View className="flex-row items-center">
                  {/* Avatar */}
                  <View className="mr-4">{renderAvatar(chat)}</View>

                  {/* Chat Info */}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center flex-1">
                        <Text className="font-bold text-gray-900 text-lg mr-2" numberOfLines={1}>
                          {chat.name}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-500 ml-2">{chat.timestamp}</Text>
                    </View>

                    {chat.description && (
                      <Text className="text-gray-600 text-sm" numberOfLines={1}>
                        {chat.description}
                      </Text>
                    )}

                    <Text className="text-xs text-gray-400 mt-1 capitalize">{chat.role}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-white p-8 rounded-2xl shadow-sm">
                <Text className="text-6xl text-center mb-4">💬</Text>
                <Text className="text-gray-600 text-center text-lg">No conversations yet</Text>
                <Text className="text-gray-500 text-center text-sm mt-2">
                  Join a conversation to get started!
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
