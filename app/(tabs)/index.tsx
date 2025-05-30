import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';

const mockChats = [
  {
    id: 1,
    name: 'Sarah Johnson',
    lastMessage: 'Hey! How was your meeting today?',
    timestamp: '2:30 PM',
    unread: 2,
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    online: true,
  },
  {
    id: 2,
    name: 'Team Project',
    lastMessage: 'Alex: The new designs look great!',
    timestamp: '1:45 PM',
    unread: 0,
    avatar: null,
    online: false,
  },
  {
    id: 3,
    name: 'Mike Chen',
    lastMessage: "Sure, let's grab coffee tomorrow",
    timestamp: '12:15 PM',
    unread: 0,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    online: true,
  },
  {
    id: 4,
    name: 'Mom',
    lastMessage: "Don't forget dinner on Sunday!",
    timestamp: '11:30 AM',
    unread: 1,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    online: false,
  },
  {
    id: 5,
    name: 'Design Team',
    lastMessage: 'Emma: Updated the mockups in Figma',
    timestamp: 'Yesterday',
    unread: 0,
    avatar: null,
    online: false,
  },
  {
    id: 6,
    name: 'David Wilson',
    lastMessage: 'Thanks for the help with the code!',
    timestamp: 'Yesterday',
    unread: 0,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    online: false,
  },
];

export default function ChatList() {
  const renderAvatar = (chat: (typeof mockChats)[0]) => {
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
          {mockChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
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
          ))}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg active:bg-blue-600">
          <Text className="text-white text-2xl">✏️</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
