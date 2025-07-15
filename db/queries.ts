import { messages, conversations, users } from './schema';
import { eq, and } from 'drizzle-orm';

// Save a message to the database
export async function saveMessage(message) {
  try {
    await db
      .insert(messages)
      .values({
        id: message.id,
        sender_id: message.sender_id,
        conversation_id: message.conversation_id,
        content: message.content,
        created_at: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: messages.id,
        set: {
          content: message.content,
          created_at: new Date().toISOString(),
        },
      });

    console.log('Message saved successfully:', message.id);
  } catch (error) {
    console.error('Failed to save message:', error);
    throw error;
  }
}

// Get all messages for a conversation
export async function getConversationMessages(conversationId) {
  try {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(messages.created_at);

    return result;
  } catch (error) {
    console.error('Failed to get conversation messages:', error);
    throw error;
  }
}

// Ensure a conversation exists in the database
export async function ensureConversationExists(conversationId, name, ownerId) {
  try {
    await db
      .insert(conversations)
      .values({
        id: conversationId,
        name: name,
        owner_id: ownerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: conversations.id,
        set: {
          name: name,
          updated_at: new Date().toISOString(),
        },
      });

    console.log('Conversation ensured:', conversationId);
  } catch (error) {
    console.error('Failed to ensure conversation exists:', error);
    throw error;
  }
}

// Get a conversation by ID
export async function getConversation(conversationId) {
  try {
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Failed to get conversation:', error);
    throw error;
  }
}

// Get all conversations for a user
export async function getUserConversations(userId) {
  try {
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.owner_id, userId))
      .orderBy(conversations.updated_at);

    return result;
  } catch (error) {
    console.error('Failed to get user conversations:', error);
    throw error;
  }
}
