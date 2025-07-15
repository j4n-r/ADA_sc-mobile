import { eq, desc } from 'drizzle-orm';
import { db } from './client';
import { conversations, messages, conversationMembers } from './schema';
import type { NewConversation, NewMessage, Conversation, Message } from './schema';

export async function initializeDatabase() {
  // With Drizzle ORM and expo-sqlite, tables are created automatically
  // when first accessed. No manual initialization needed.
  console.log('Database ready');
}

export async function saveConversation(
  conversationData: NewConversation
): Promise<Conversation | null> {
  try {
    const [conversation] = await db.insert(conversations).values(conversationData).returning();
    return conversation;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return null;
  }
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    return conversation || null;
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return null;
  }
}

export async function saveMessage(messageData: NewMessage): Promise<Message | null> {
  try {
    const [message] = await db.insert(messages).values(messageData).returning();

    await db
      .update(conversations)
      .set({ updated_at: new Date().toISOString() })
      .where(eq(conversations.id, messageData.conversation_id));

    return message;
  } catch (error) {
    console.error('Failed to save message:', error);
    return null;
  }
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(messages.sent_from_client);

    return conversationMessages;
  } catch (error) {
    console.error('Failed to get conversation messages:', error);
    return [];
  }
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const userConversations = await db
      .select({
        id: conversations.id,
        owner_id: conversations.owner_id,
        name: conversations.name,
        description: conversations.description,
        created_at: conversations.created_at,
        updated_at: conversations.updated_at,
      })
      .from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversation_id))
      .where(eq(conversationMembers.user_id, userId))
      .orderBy(desc(conversations.updated_at));

    return userConversations;
  } catch (error) {
    console.error('Failed to get user conversations:', error);
    return [];
  }
}

export async function ensureConversationExists(
  conversationId: string,
  conversationName: string,
  userId: string
): Promise<void> {
  try {
    const existingConversation = await getConversation(conversationId);

    if (!existingConversation) {
      await saveConversation({
        id: conversationId,
        owner_id: userId,
        name: conversationName,
        description: null,
      });

      await db.insert(conversationMembers).values({
        conversation_id: conversationId,
        user_id: userId,
        role: 'owner',
      });
    }
  } catch (error) {
    console.error('Failed to ensure conversation exists:', error);
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    await db.delete(conversations).where(eq(conversations.id, conversationId));
    return true;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return false;
  }
}

export async function updateConversationName(
  conversationId: string,
  name: string
): Promise<boolean> {
  try {
    await db
      .update(conversations)
      .set({
        name,
        updated_at: new Date().toISOString(),
      })
      .where(eq(conversations.id, conversationId));
    return true;
  } catch (error) {
    console.error('Failed to update conversation name:', error);
    return false;
  }
}
