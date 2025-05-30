// ChatScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { config } from '~/app.config';

// Change this to your computer's LAN IP address!

const WS_URL = `${config.WS_BASE_URL}`;

const initMessages = [
  {
    messageType: 'IdMessage',
    senderId: '550e8400-e29b-41d4-a716-446655440000',
    timestamp: '2025-04-19T13:00:00Z',
  },
];

export default function ChatScreen() {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('connected');
      for (const msg of initMessages) {
        console.log(msg);
        ws.current?.send(JSON.stringify(msg));
        console.log('INIT:', msg);
      }
    };

    ws.current.onmessage = (e) => {
      try {
        const { messageType, payload, meta } = JSON.parse(e.data);
        console.log('RECEIVED:', e.data);
        console.log('type:', messageType);
        console.log('payload:', payload);
        console.log('meta:', meta);

        const iMessage: IMessage[] = [
          {
            _id: meta.messageId,
            text: payload.content,
            createdAt: new Date(meta.timestamp),
            user: { _id: meta.senderId },
          },
        ];

        if (messageType === 'ChatMessage') {
          setMessages((prev) => GiftedChat.append(prev, iMessage));
          console.log('Message appended');
        }
        if (messageType === 'history') {
          setMessages(GiftedChat.append([], iMessage));
        }
      } catch (e) {
        console.warn('Invalid message from server', e.data);
      }
    };

    ws.current.onerror = (e) => {
      console.warn('WebSocket error', e);
    };

    const cur = ws.current;
    return () => {
      cur && cur.close();
      console.log('CLOSED');
    };
  }, []);

  const onSend = useCallback((newMsgs: IMessage[] = []) => {
    console.log('New Messges', newMsgs);
    const msg = newMsgs[0];
    setMessages((prev) => GiftedChat.append(prev, [{ ...msg, pending: true }]));

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msgConst = JSON.stringify({
        messageType: 'ChatMessage',
        payload: {
          targetType: 'user',
          targetId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          content: msg.text,
        },
        meta: {
          messageId: '4a9f3e7b-8c2d-4d6f-b654-abcdef654321',
          senderId: '550e8400-e29b-41d4-a716-446655440000',
          timestamp: '2025-04-19T13:00:05Z',
        },
      });
      ws.current.send(msgConst);
      console.log('SEND:', msgConst);
    }
  }, []);

  const handleTyping = useCallback(() => {
    setIsTyping(true);
    // Optionally, send typing events to server here
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      onInputTextChanged={handleTyping}
      // isTyping={isTyping}
      user={{ _id: 'u42', name: 'Ada' }}
      scrollToBottom
    />
  );
}
