import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TransactionInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { InsertBudget } from "@shared/schema";

/**
 * Custom hook to fetch all transactions using React Query.
 */
export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

/**
 * Custom hook to handle transaction creation with optimistic updates/invalidation.
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TransactionInput) => {
      const validated = api.transactions.create.input.parse(data);
      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.transactions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create transaction");
      }
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate the transactions list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<TransactionInput>) => {
      const validated = api.transactions.update.input.parse(updates);
      const url = buildUrl(api.transactions.update.path, { id });
      
      const res = await fetch(url, {
        method: api.transactions.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.transactions.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Transaction not found");
        throw new Error("Failed to update transaction");
      }
      return api.transactions.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.transactions.delete.path, { id });
      const res = await fetch(url, { method: api.transactions.delete.method });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Transaction not found");
        throw new Error("Failed to delete transaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: [api.budgets.list.path],
    queryFn: async () => {
      const res = await fetch(api.budgets.list.path);
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return api.budgets.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertBudget) => {
      const res = await fetch(api.budgets.upsert.path, {
        method: api.budgets.upsert.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update budget");
      return api.budgets.upsert.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    },
  });
}
