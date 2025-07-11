import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const quiz_list = pgTable('quiz_list', {
  id: serial('id').primaryKey(),
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
    id: serial('id').primaryKey(),
    quiz_name: varchar('quiz_name', { length: 256 }),
    category_name: varchar('category_name', { length: 256 }),
});

export const quiz_name_list = pgTable('quiz_name_list', {
    id: serial('id').primaryKey(),
    quiz_name: varchar('quiz_name', { length: 256 }),
    quiz_name_jp: varchar('quiz_name_jp', { length: 256 }),
});
