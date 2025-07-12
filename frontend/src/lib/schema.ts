import { pgTable, text, varchar, timestamp, integer, primaryKey, uuid } from 'drizzle-orm/pg-core';
import type { AdapterAccount } from '@auth/core/adapters';

export const quiz_list = pgTable('quiz_list', {
  id: integer('id').primaryKey(),
  quiz_name: varchar('quiz_name', { length: 256 }),
  category: varchar('category', { length: 100 }),
  question: text('question'),
  choice1: text('choice1'),
  choice2: text('choice2'),
  choice3: text('choice3'),
  choice4: text('choice4'),
  answer: text('answer'),
  explanation: text('explanation'),
});

export const category_list = pgTable('category_list', {
    id: integer('id').primaryKey(),
    quiz_name: varchar('quiz_name', { length: 256 }),
    category_name: varchar('category_name', { length: 256 }),
});

export const quiz_name_list = pgTable('quiz_name_list', {
    id: integer('id').primaryKey(),
    quiz_name: varchar('quiz_name', { length: 256 }),
    quiz_name_jp: varchar('quiz_name_jp', { length: 256 }),
});

// NextAuth tables
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));
