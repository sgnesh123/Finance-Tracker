import { Transaction } from "@shared/schema";
import { format } from "date-fns";
import { MoreHorizontal, Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTransaction } from "@/hooks/use-transactions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TransactionForm } from "./TransactionForm";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  const deleteTransaction = useDeleteTransaction();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
        <p className="text-sm text-muted-foreground">
          Start tracking your finances by adding your first income or expense.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  transaction.type === "income"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                {transaction.type === "income" ? (
                  <TrendingUp className="w-7 h-7" />
                ) : (
                  <TrendingDown className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 tracking-tight text-lg">
                  {transaction.description}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    {transaction.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span
                className={`text-xl font-black tabular-nums tracking-tighter ${
                  transaction.type === "income"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(transaction.amount / 100)}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Dialog
                    open={editingId === transaction.id}
                    onOpenChange={(open) => setEditingId(open ? transaction.id : null)}
                  >
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                          Make changes to your transaction here.
                        </DialogDescription>
                      </DialogHeader>
                      <TransactionForm
                        defaultValues={transaction}
                        onSuccess={() => setEditingId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteTransaction.mutate(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
