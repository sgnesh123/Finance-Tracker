import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 'Drizzle ORM' schema definition for transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  // All monetary amounts are stored as integers (cents) to avoid floating-point arithmetic errors
  amount: integer("amount").notNull(), 
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
});

// 'Drizzle ORM' schema definition for category budgets table
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().unique(),
  // Budget limit stored in cents
  limit: integer("limit").notNull(), 
});

// Zod schemas for input validation, generated from Drizzle table schemas
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
