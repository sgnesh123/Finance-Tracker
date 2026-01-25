import { db } from "./db";
import {
  transactions,
  budgets,
  type InsertTransaction,
  type Transaction,
  type InsertBudget,
  type Budget
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;
  
  getBudgets(): Promise<Budget[]>;
  upsertBudget(budget: InsertBudget): Promise<Budget>;
}

export class DatabaseStorage implements IStorage {
  /**
   * Fetches all transactions from the database, ordered by date descending.
   */
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }

  /**
   * Retrieves a single transaction by its unique ID.
   */
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  /**
   * Inserts a new transaction into the database and returns the created record.
   */
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  /**
   * Updates an existing transaction's fields based on its ID.
   */
  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  /**
   * Removes a transaction from the database by its ID.
   */
  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  /**
   * Fetches all category budgets defined by the user.
   */
  async getBudgets(): Promise<Budget[]> {
    return await db.select().from(budgets);
  }

  /**
   * Creates or updates a category budget.
   * If a budget for the category exists, it updates the limit; otherwise, it inserts a new one.
   */
  async upsertBudget(budget: InsertBudget): Promise<Budget> {
    const [existing] = await db.select().from(budgets).where(eq(budgets.category, budget.category));
    if (existing) {
      const [updated] = await db.update(budgets)
        .set({ limit: budget.limit })
        .where(eq(budgets.category, budget.category))
        .returning();
      return updated;
    }
    const [inserted] = await db.insert(budgets).values(budget).returning();
    return inserted;
  }
}

export const storage = new DatabaseStorage();
