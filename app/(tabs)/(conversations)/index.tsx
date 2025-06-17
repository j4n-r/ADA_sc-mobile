import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { getUserdata } from '~/utils/auth';
import { getConversations } from '~/utils/api';

// Type for conversation data from API
type Conversation = {
  conversation_id: string;
  created_at: string;
  description: string | null;
  id: string;
  image: string | null;
  joined_at: string;
  name: string | null;
  owner_id: string | null;
  role: string;
  type: 'dm' | 'group';
  updated_at: string;
  user_id: string;
};

// Type for transformed chat data for display
type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  online?: boolean;
  type: 'dm' | 'group';
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
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    };

    return {
      id: conversation.conversation_id,
      name: conversation.name || (conversation.type === 'dm' ? 'Direct Message' : 'Group Chat'),
      lastMessage: 'No messages yet', // You'll need to fetch latest message separately
      timestamp: formatTimestamp(conversation.updated_at),
      unread: 0, // You'll need to track unread count separately
      avatar: conversation.image,
      online: false, // You'll need to track online status separately
      type: conversation.type,
    };
  };

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

  // Fetch conversations when userData is available
  useEffect(() => {
    const fetchConversations = async () => {
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
        }
      } catch (err) {
        setError('Failed to load conversations');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userData]);

  const renderAvatar = (chat: ChatItem) => {
    if (chat.avatar) {
      return (
        <View className="relative">
          <Image source={{ uri: chat.avatar }} className="w-12 h-12 rounded-full" />
          {chat.online && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </View>
      );
    }
    return (
      <View className="w-12 h-12 bg-gray-400 rounded-full items-center justify-center">
        <Text className="text-white font-semibold text-lg">
          {chat.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </Text>
      </View>
    );
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);

    // Re-fetch user data and conversations
    try {
      const data = await getUserdata();
      setUserData(data);
    } catch (error) {
      console.error('Failed to fetch user data on retry:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity onPress={handleRetry} className="mt-4 px-4 py-2 bg-blue-500 rounded">
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Chats' }} />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        </View>

        {/* Chat List */}
        <ScrollView className="flex-1">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => {
                  router.push(`/(tabs)/(conversations)/chat?chatId=${chat.id}`);
                }}
                className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50">
                {/* Avatar */}
                <View className="mr-3">{renderAvatar(chat)}</View>

                {/* Chat Info */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-semibold text-gray-900 text-base">{chat.name}</Text>
                    <Text className="text-sm text-gray-500">{chat.timestamp}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text
                      className={`text-sm flex-1 mr-2 ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                      numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                    {chat.unread > 0 && (
                      <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                        <Text className="text-white text-xs font-medium">{chat.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500 text-center">No conversations yet</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
