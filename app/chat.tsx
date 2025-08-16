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
import { getUserdata, UserData } from '~/utils/auth';
import { getChatMessages, getConversation } from '~/utils/api';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { sql } from 'drizzle-orm';

const WS_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || 'ws://10.0.2.2:8080';

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

interface Conversation {
  id: string;
  name: string;
  type: string;
  description?: string;
  created_at: string;
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
  const [apiConnectionFailed, setApiConnectionFailed] = useState(false);
  const [userData, setUserData] = useState<UserData>({ userId: null, username: null });

  // Track message IDs that come from WebSocket to prevent duplicates
  const [realtimeMessageIds, setRealtimeMessageIds] = useState<Set<string>>(new Set());

  // Add Drizzle DB support
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

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
          setApiConnectionFailed(true);
          return;
        }

        if (response && response.messages) {
          const conversation = response.messages; // Your Flask endpoint returns conversation data in "messages" field
          setChatName(conversation.name || `Chat ${chatId.slice(0, 8)}`);
          setChatDescription(conversation.description || '');
          console.log('Loaded conversation:', conversation.name);

          // Save conversation to local DB
          try {
            await drizzleDb
              .insert(schema.conversations)
              .values({
                id: chatId,
                owner_id: conversation.owner_id || userData.userId,
                name: conversation.name || `Chat ${chatId.slice(0, 8)}`,
                description: conversation.description,
                created_at: conversation.created_at || new Date().toISOString(),
                updated_at: conversation.updated_at || new Date().toISOString(),
              })
              .onConflictDoUpdate({
                target: [schema.conversations.id],
                set: {
                  name: sql`excluded.name`,
                  description: sql`excluded.description`,
                  updated_at: sql`excluded.updated_at`,
                },
              });
            console.log('Saved conversation to local DB');
          } catch (dbError) {}
        } else {
          // Fallback if conversation details not found
          setChatName(`Chat ${chatId.slice(0, 8)}`);
        }
      } catch (error) {
        setApiConnectionFailed(true);

        // Try to load from local DB as fallback
        try {
          const localConversation = await drizzleDb
            .select()
            .from(schema.conversations)
            .where(sql`${schema.conversations.id} = ${chatId}`)
            .limit(1);

          if (localConversation && localConversation.length > 0) {
            setChatName(localConversation[0].name || `Chat ${chatId.slice(0, 8)}`);
            setChatDescription(localConversation[0].description || '');
            console.log('Loaded conversation from local DB');
          } else {
            setChatName(`Chat ${chatId.slice(0, 8)}`);
          }
        } catch (localError) {
          setChatName(`Chat ${chatId.slice(0, 8)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadConversationDetails();
  }, [chatId, userData.userId, drizzleDb]);

  // Load chat messages when chat is ready
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!chatId || !userData.userId) return;

      try {
        setLoadingMessages(true);
        console.log('Loading messages for chat:', chatId);

        let response = null;
        try {
          response = await getChatMessages(chatId);

          if (response === 401) {
            setError('Session expired. Please log in again.');
            setApiConnectionFailed(true);
            return;
          }
        } catch (err) {
          setApiConnectionFailed(true);
          // Try to load from local DB as fallback
          try {
            const localMessages = await drizzleDb
              .select()
              .from(schema.messages)
              .where(sql`${schema.messages.conversation_id} = ${chatId}`)
              .orderBy(schema.messages.sent_from_client);

            if (localMessages && localMessages.length > 0) {
              const displayMessages: DisplayMessage[] = localMessages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.sender_id,
                username: msg.sender_id === userData.userId ? userData.username || 'You' : 'User',
                timestamp: msg.sent_from_server || msg.sent_from_client,
              }));

              setMessages(displayMessages);
              console.log('Loaded', displayMessages.length, 'messages from local DB');
              setTimeout(() => scrollToBottom(), 100);
            }
          } catch (localError) {
            setError('Failed to load chat messages');
          }
        }

        if (response && response.messages) {
          // Transform API messages to display format
          const displayMessages: DisplayMessage[] = response.messages.map((msg: Message) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender_id,
            username: msg.sender_id === userData.userId ? userData.username || 'You' : 'User',
            timestamp: msg.sent_from_server || msg.sent_from_client,
          }));

          // Sort messages by timestamp (oldest first)
          displayMessages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          setMessages(displayMessages);
          console.log('Loaded', displayMessages.length, 'messages');

          // Save messages to local DB - FILTER OUT REAL-TIME MESSAGES
          try {
            if (response.messages.length > 0) {
              // Filter out messages that were already saved via WebSocket
              const messagesToSave = response.messages.filter(
                (msg: Message) => !realtimeMessageIds.has(msg.id)
              );

              console.log(
                `Filtered ${response.messages.length - messagesToSave.length} real-time messages, saving ${messagesToSave.length} messages`
              );

              if (messagesToSave.length > 0) {
                await drizzleDb
                  .insert(schema.messages)
                  .values(
                    messagesToSave.map((msg: Message) => ({
                      id: msg.id,
                      sender_id: msg.sender_id,
                      conversation_id: msg.conversation_id,
                      content: msg.content,
                      sent_from_client: msg.sent_from_client || new Date().toISOString(),
                      sent_from_server: msg.sent_from_server || new Date().toISOString(),
                    }))
                  )
                  .onConflictDoUpdate({
                    target: [schema.messages.id],
                    set: {
                      content: sql`excluded.content`,
                      sent_from_server: sql`excluded.sent_from_server`,
                    },
                  });
                console.log('Saved', messagesToSave.length, 'new messages to local DB');
              } else {
                console.log('No new messages to save (all were real-time)');
              }
            }
          } catch (dbError) {}

          scrollToBottom();
        }
      } catch (error) {
      } finally {
        setLoadingMessages(false);
      }
    };

    loadChatMessages();
  }, [chatId, userData.userId, realtimeMessageIds]);

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

    ws.current.onmessage = async (e) => {
      try {
        const { messageType, payload, meta } = JSON.parse(e.data);
        console.log('RECEIVED:', e.data);

        if (messageType === 'ChatMessage') {
          const messageId = meta.messageId || Math.random().toString();

          // Track this message as coming from WebSocket to prevent duplicates
          setRealtimeMessageIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(messageId);
            console.log('Added message ID to realtime tracking:', messageId);
            return newSet;
          });

          const newMessage: DisplayMessage = {
            id: messageId,
            content: payload.content,
            senderId: meta.senderId,
            username: payload.displayName,
            timestamp: meta.timestamp,
          };

          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        } else if (messageType === 'history') {
          // Handle message history if implemented
          const messageId = meta.messageId || Math.random().toString();

          // Track history messages as well
          setRealtimeMessageIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(messageId);
            return newSet;
          });

          const historyMessage: DisplayMessage = {
            id: messageId,
            content: payload.content,
            senderId: meta.senderId,
            username: payload.displayName,
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
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !chatId || !userData.userId || !userData.username || loadingMessages) {
      console.warn('Cannot send message: missing required data or messages still loading');
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageId = Math.random().toString();
      const timestamp = new Date().toISOString();

      // Track our own sent message to prevent duplicates
      setRealtimeMessageIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(messageId);
        console.log('Added sent message ID to realtime tracking:', messageId);
        return newSet;
      });

      const messagePayload = {
        messageType: 'ChatMessage',
        payload: {
          content: inputText.trim(),
          displayName: userData.username,
        },
        meta: {
          messageId: messageId,
          senderId: userData.userId,
          conversationId: chatId,
          timestamp: timestamp,
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
  }, [inputText, chatId, userData.userId, userData.username, loadingMessages]);

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

        {/* Message Input or No Connection Message */}
        {apiConnectionFailed ? (
          <View className="bg-red-50 border-t border-red-200 p-4">
            <View className="flex-row items-center justify-center">
              <Text className="text-red-600 font-medium">
                No connection - Unable to send messages
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-gray-100 border-t border-gray-200 p-4">
            <View className="flex-row gap-3 items-center">
              <TextInput
                className={`flex-1 px-4 py-3 rounded-full border ${loadingMessages ? 'border-gray-200 bg-gray-100' : 'border-gray-300 bg-white'}`}
                placeholder={loadingMessages ? 'Loading messages...' : 'Type a message...'}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                multiline={false}
                editable={!loadingMessages}
              />
              <TouchableOpacity
                className={`px-6 py-3 rounded-full ${loadingMessages ? 'bg-gray-400' : 'bg-blue-500 active:bg-blue-600'}`}
                onPress={sendMessage}
                disabled={loadingMessages}>
                <Text className="text-white font-medium">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
