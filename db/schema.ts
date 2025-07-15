import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(), // UUID as TEXT
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password'),
  role: text('role').notNull().$type<'admin' | 'user' | 'guest'>(),
  name: text('name'),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  created_at: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey().notNull(), // UUID
  owner_id: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  created_at: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().notNull(), // UUID as TEXT
  sender_id: text('sender_id')
    .notNull()
    .references(() => users.id),
  conversation_id: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  sent_from_client: text('sent_from_client').notNull(), // ISO8601 string
  sent_from_server: text('sent_from_server').notNull(), // ISO8601 string
});

export const conversationMembers = sqliteTable(
  'conversation_members',
  {
    conversation_id: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'owner'/'admin'/'member'
    joined_at: text('joined_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.conversation_id, table.user_id] }),
  })
);

// Export types for use in your app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type ConversationMember = typeof conversationMembers.$inferSelect;
export type NewConversationMember = typeof conversationMembers.$inferInsert;
