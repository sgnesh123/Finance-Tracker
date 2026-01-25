import { useState } from "react";
import { useBudgets, useUpsertBudget } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "./TransactionForm";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, AlertTriangle, Save, Edit2 } from "lucide-react";
import { Transaction } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BudgetManagerProps {
  transactions: Transaction[];
}

export function BudgetManager({ transactions }: BudgetManagerProps) {
  const { data: budgets = [] } = useBudgets();
  const upsertBudget = useUpsertBudget();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [limit, setLimit] = useState("");

  const getCategorySpending = (category: string) => {
    return transactions
      .filter((t) => t.category === category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSave = (category: string) => {
    const rawValue = parseFloat(limit);
    if (isNaN(rawValue) || rawValue < 0) return;
    
    const amountCents = Math.round(rawValue * 100);
    upsertBudget.mutate({ category, limit: amountCents });
    setEditingCategory(null);
    setLimit("");
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Monthly Budgets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {CATEGORIES.filter(cat => cat !== "Salary").map((category) => {
          const budget = budgets.find((b) => b.category === category);
          const spending = getCategorySpending(category);
          const limitCents = budget?.limit || 0;
          const percent = limitCents > 0 ? (spending / limitCents) * 100 : 0;
          
          const isOver100 = percent >= 100;
          const isOver80 = percent >= 80;

          return (
            <div key={category} className="space-y-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-700">{category}</span>
                  {isOver100 && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {isOver80 && !isOver100 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </div>
                {editingCategory === category ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      className="h-8 w-24 text-sm bg-white"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      autoFocus
                    />
                    <Button size="icon" variant="default" className="h-8 w-8" onClick={() => handleSave(category)}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-primary gap-1.5 font-medium"
                    onClick={() => {
                      setEditingCategory(category);
                      setLimit(budget ? (budget.limit / 100).toString() : "");
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {limitCents > 0 ? `$${(limitCents/100).toLocaleString()}` : "Set budget"}
                  </Button>
                )}
              </div>
              
              {limitCents > 0 && (
                <div className="space-y-1">
                  <Progress 
                    value={Math.min(percent, 100)} 
                    className={cn(
                      "h-1.5",
                      isOver100 ? "[&>div]:bg-red-500" : 
                      isOver80 ? "[&>div]:bg-amber-500" : ""
                    )}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>${(spending/100).toFixed(2)} spent</span>
                    <span className={cn(isOver100 ? "text-red-600 font-bold" : isOver80 ? "text-amber-600" : "")}>
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
