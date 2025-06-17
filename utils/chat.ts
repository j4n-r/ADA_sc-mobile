import { config } from './auth';

export interface ChatMessage {
  messageType: 'ChatMessage' | 'IdMessage';
  payload?: {
    content: string;
    displayName: string;
  };
  meta?: {
    messageId?: string;
    senderId: string;
    conversationId: string;
    timestamp: string;
  };
  // For IdMessage
  senderId?: string;
  convId?: string;
  timestamp?: string;
}

export class ChatWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isManualClose = false;

  constructor(
    private onMessage: (data: any) => void,
    private onError: (error: string) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  connect(userId: string, conversationId: string): void {
    this.isManualClose = false;
    console.log('Connecting to WebSocket for conversation:', conversationId);

    try {
      this.ws = new WebSocket(config.WS_BASE_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnectionChange(true);

        // Send initial identification message
        const initMessage: ChatMessage = {
          messageType: 'IdMessage',
          senderId: userId,
          convId: conversationId,
          timestamp: new Date().toISOString(),
        };

        this.send(initMessage);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError('Connection error occurred');
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.onConnectionChange(false);

        // Only attempt to reconnect if it wasn't a manual close
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect(userId, conversationId);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onError('Failed to establish connection');
    }
  }

  private attemptReconnect(userId: string, conversationId: string): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isManualClose) {
        this.connect(userId, conversationId);
      }
    }, delay);
  }

  send(message: ChatMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        this.onError('Failed to send message');
        return false;
      }
    } else {
      console.warn('WebSocket is not open. Cannot send message.');
      this.onError('Connection is not available');
      return false;
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  } else if (diffInMinutes < 1440) {
    // Less than 24 hours
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
