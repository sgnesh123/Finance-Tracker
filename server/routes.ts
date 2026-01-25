import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.transactions.list.path, async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.get(api.transactions.get.path, async (req, res) => {
    const transaction = await storage.getTransaction(Number(req.params.id));
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      // Coerce amount to number if it comes as string
      const bodySchema = api.transactions.create.input.extend({
        amount: z.coerce.number(),
        date: z.coerce.date(),
      });
      const input = bodySchema.parse(req.body);
      const transaction = await storage.createTransaction(input);
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.transactions.update.path, async (req, res) => {
    try {
       const bodySchema = api.transactions.update.input.extend({
        amount: z.coerce.number().optional(),
        date: z.coerce.date().optional(),
      });
      const input = bodySchema.parse(req.body);
      const transaction = await storage.updateTransaction(Number(req.params.id), input);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.transactions.delete.path, async (req, res) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.budgets.list.path, async (req, res) => {
    const budgets = await storage.getBudgets();
    res.json(budgets);
  });

  app.post(api.budgets.upsert.path, async (req, res) => {
    try {
      const input = api.budgets.upsert.input.parse({
        ...req.body,
        limit: Number(req.body.limit)
      });
      const budget = await storage.upsertBudget(input);
      res.json(budget);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
