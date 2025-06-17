import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { config, getUserdata, UserData } from '~/utils/auth';

const WS_URL = `${config.WS_BASE_URL}`;

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatName, setChatName] = useState<string>('Chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({ userId: null, username: null });

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

  // Validate that we have a chat ID and user data
  useEffect(() => {
    if (!chatId) {
      setError('No chat ID provided');
      setLoading(false);
      return;
    }

    if (!userData.userId) {
      console.log('Waiting for user data...');
      return;
    }

    // Here you could fetch chat details from your API
    // For now, we'll just set a default name
    setChatName(`Chat ${chatId.slice(0, 8)}`);
    setLoading(false);
  }, [chatId, userData.userId]);

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
        convId: chatId, // Note: using convId to match the Rust backend
        timestamp: new Date().toISOString(),
      };

      console.log('Sending init message:', initMessage);
      ws.current?.send(JSON.stringify(initMessage));
    };

    ws.current.onmessage = (e) => {
      try {
        const { messageType, payload, meta } = JSON.parse(e.data);
        console.log('RECEIVED:', e.data);
        console.log('type:', messageType);
        console.log('payload:', payload);
        console.log('meta:', meta);

        if (messageType === 'ChatMessage') {
          const iMessage: IMessage = {
            _id: meta.messageId || Math.random().toString(),
            text: payload.content,
            createdAt: new Date(meta.timestamp),
            user: {
              _id: meta.senderId,
              name: payload.displayName || 'Unknown User',
            },
          };

          setMessages((prev) => GiftedChat.append(prev, [iMessage]));
          console.log('Message appended');
        } else if (messageType === 'history') {
          // Handle message history if implemented
          const iMessage: IMessage = {
            _id: meta.messageId || Math.random().toString(),
            text: payload.content,
            createdAt: new Date(meta.timestamp),
            user: {
              _id: meta.senderId,
              name: payload.displayName || 'Unknown User',
            },
          };
          setMessages((prev) => GiftedChat.append(prev, [iMessage]));
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
      // Optionally implement reconnection logic here
      if (!error) {
        console.log('Attempting to reconnect in 3 seconds...');
        setTimeout(() => {
          if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
            console.log('Reconnecting...');
            // Re-run this effect by updating a state variable if needed
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
  }, [chatId, error, userData.userId]);

  const onSend = useCallback(
    (newMsgs: IMessage[] = []) => {
      if (!chatId || !userData.userId || !userData.username) {
        console.warn('Cannot send message: missing chat ID or user data');
        return;
      }

      console.log('New Messages', newMsgs);
      const msg = newMsgs[0];

      // Optimistically add message to UI
      setMessages((prev) => GiftedChat.append(prev, [{ ...msg, pending: true }]));

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const messagePayload = {
          messageType: 'ChatMessage',
          payload: {
            content: msg.text,
            displayName: userData.username,
          },
          meta: {
            messageId: msg._id,
            senderId: userData.userId,
            conversationId: chatId,
            timestamp: new Date().toISOString(),
          },
        };

        const msgString = JSON.stringify(messagePayload);
        ws.current.send(msgString);
        console.log('SENT:', msgString);
      } else {
        console.warn('WebSocket is not open. Message not sent.');
        setError('Connection lost. Please try again.');
      }
    },
    [chatId, userData.userId, userData.username]
  );

  const handleTyping = useCallback(() => {
    setIsTyping(true);
    // Optionally, send typing events to server here
    setTimeout(() => setIsTyping(false), 1000);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading chat...</Text>
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
      <GiftedChat
        messages={messages}
        onSend={onSend}
        onInputTextChanged={handleTyping}
        user={{
          _id: userData.userId,
          name: userData.username || 'You',
        }}
        scrollToBottom
        placeholder="Type a message..."
        showAvatarForEveryMessage={true}
        showUserAvatar={true}
      />
    </>
  );
}
