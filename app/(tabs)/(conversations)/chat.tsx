import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { config, getUserdata, UserData } from '~/utils/auth';
import { getChatMessages, getConversation } from '~/utils/api';

const WS_URL = `${config.WS_BASE_URL}`;

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  status: string;
  sent_from_client: string;
  sent_from_server: string;
}

interface DisplayMessage {
  id: string;
  content: string;
  senderId: string;
  username: string;
  timestamp: string;
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const ws = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatName, setChatName] = useState<string>('Chat');
  const [chatDescription, setChatDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({ userId: null, username: null });

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Get user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserdata();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data for Chat screen:', error);
        setError('Failed to load user data');
      }
    };
    fetchUserData();
  }, []);

  // Validate that we have a chat ID and user data, then load conversation details
  useEffect(() => {
    const loadConversationDetails = async () => {
      if (!chatId) {
        setError('No chat ID provided');
        setLoading(false);
        return;
      }

      if (!userData.userId) {
        console.log('Waiting for user data...');
        return;
      }

      try {
        console.log('Loading conversation details for:', chatId);
        const response = await getConversation(chatId);

        if (response === 401) {
          setError('Session expired. Please log in again.');
          return;
        }

        if (response && response.messages) {
          const conversation = response.messages; // Your Flask endpoint returns conversation data in "messages" field
          setChatName(conversation.name || `Chat ${chatId.slice(0, 8)}`);
          setChatDescription(conversation.description || '');
          console.log('Loaded conversation:', conversation.name);
        } else {
          // Fallback if conversation details not found
          setChatName(`Chat ${chatId.slice(0, 8)}`);
        }
      } catch (error) {
        console.error('Failed to load conversation details:', error);
        // Fallback to default name
        setChatName(`Chat ${chatId.slice(0, 8)}`);
      } finally {
        setLoading(false);
      }
    };

    loadConversationDetails();
  }, [chatId, userData.userId]);

  // Load chat messages when chat is ready
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!chatId || !userData.userId) return;

      try {
        setLoadingMessages(true);
        console.log('Loading messages for chat:', chatId);

        const response = await getChatMessages(chatId);

        if (response === 401) {
          setError('Session expired. Please log in again.');
          return;
        }

        if (response && response.messages) {
          // Transform API messages to display format
          const displayMessages: DisplayMessage[] = response.messages.map((msg: Message) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender_id,
            username: msg.sender_id === userData.userId ? userData.username || 'You' : 'User', // Will be updated when real-time messages come in with display_name
            timestamp: msg.sent_from_server || msg.sent_from_client,
          }));

          // Sort messages by timestamp (oldest first)
          displayMessages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          setMessages(displayMessages);
          console.log('Loaded', displayMessages.length, 'messages');

          // Scroll to bottom after loading messages
          setTimeout(() => scrollToBottom(), 100);
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
        setError('Failed to load chat messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadChatMessages();
  }, [chatId, userData.userId, userData.username, scrollToBottom]);

  // WebSocket connection and message handling
  useEffect(() => {
    if (!chatId || error || !userData.userId) return;

    console.log('Establishing WebSocket connection for chat:', chatId);
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('Connected to chat:', chatId);

      // Send init message with the specific chat ID and real user data
      const initMessage = {
        messageType: 'IdMessage',
        senderId: userData.userId,
        convId: chatId,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending init message:', initMessage);
      ws.current?.send(JSON.stringify(initMessage));
    };

    ws.current.onmessage = (e) => {
      try {
        const { messageType, payload, meta } = JSON.parse(e.data);
        console.log('RECEIVED:', e.data);

        if (messageType === 'ChatMessage') {
          const newMessage: DisplayMessage = {
            id: meta.messageId || Math.random().toString(),
            content: payload.content,
            senderId: meta.senderId,
            username: payload.displayName, // Use the displayName from the WebSocket payload
            timestamp: meta.timestamp,
          };

          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        } else if (messageType === 'history') {
          // Handle message history if implemented
          const historyMessage: DisplayMessage = {
            id: meta.messageId || Math.random().toString(),
            content: payload.content,
            senderId: meta.senderId,
            username: payload.displayName, // Use the displayName from the WebSocket payload
            timestamp: meta.timestamp,
          };
          setMessages((prev) => [...prev, historyMessage]);
        }
      } catch (error) {
        console.warn('Invalid message from server', e.data);
      }
    };

    ws.current.onerror = (e) => {
      console.warn('WebSocket error', e);
      setError('Connection error');
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed', e);
      if (!error) {
        console.log('Attempting to reconnect in 3 seconds...');
        setTimeout(() => {
          if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
            console.log('Reconnecting...');
            // Could implement reconnection logic here
          }
        }, 3000);
      }
    };

    const currentWs = ws.current;
    return () => {
      if (currentWs) {
        currentWs.close();
        console.log('WebSocket connection closed');
      }
    };
  }, [chatId, error, userData.userId, scrollToBottom]);

  // Send message function
  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !chatId || !userData.userId || !userData.username) {
      console.warn('Cannot send message: missing required data');
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messagePayload = {
        messageType: 'ChatMessage',
        payload: {
          content: inputText.trim(),
          displayName: userData.username,
        },
        meta: {
          messageId: Math.random().toString(),
          senderId: userData.userId,
          conversationId: chatId,
          timestamp: new Date().toISOString(),
        },
      };

      const msgString = JSON.stringify(messagePayload);
      ws.current.send(msgString);
      console.log('SENT:', msgString);

      setInputText(''); // Clear input after sending
    } else {
      console.warn('WebSocket is not open. Message not sent.');
      setError('Connection lost. Please try again.');
    }
  }, [inputText, chatId, userData.userId, userData.username]);

  // Render message bubble
  const renderMessage = (message: DisplayMessage) => {
    const isOwnMessage = message.senderId === userData.userId;

    return (
      <View
        key={message.id}
        className={`flex mb-3 px-2 ${isOwnMessage ? 'justify-end items-end' : 'justify-start items-start'}`}>
        <View
          className={`max-w-xs px-4 py-2 shadow ${
            isOwnMessage
              ? 'bg-blue-500 rounded-t-xl rounded-bl-xl rounded-br-sm'
              : 'bg-white rounded-t-xl rounded-br-xl rounded-bl-sm border border-gray-200'
          }`}>
          <Text
            className={`font-medium text-xs mb-1 ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}>
            {message.username}
          </Text>
          <Text className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  if (loading || loadingMessages) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{loading ? 'Loading chat...' : 'Loading messages...'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      </>
    );
  }

  if (!chatId) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 text-center">Invalid chat ID</Text>
        </View>
      </>
    );
  }

  if (!userData.userId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500 text-center">Loading user data...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: chatName,
          headerBackTitle: 'Chats',
        }}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-gray-100 p-4"
          contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Message Input */}
        <View className="bg-gray-100 border-t border-gray-200 p-4">
          <View className="flex-row gap-3 items-center">
            <TextInput
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 bg-white"
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity
              className="px-6 py-3 bg-blue-500 rounded-full active:bg-blue-600"
              onPress={sendMessage}>
              <Text className="text-white font-medium">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
