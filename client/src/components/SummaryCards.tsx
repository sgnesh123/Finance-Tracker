import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Balance Card */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Wallet className="w-24 h-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">
            Net Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black tracking-tighter">
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-blue-100/80 mt-2 font-medium">
            Your current financial standing
          </p>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="border-none shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Total Income
          </CardTitle>
          <div className="bg-emerald-50 p-2 rounded-xl">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-slate-900">
            {formatCurrency(totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold tracking-tighter">
              <TrendingUp className="h-3 w-3" />
              EARNINGS
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card className="border-none shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Total Expenses
          </CardTitle>
          <div className="bg-rose-50 p-2 rounded-xl">
            <ArrowDownRight className="w-5 h-5 text-rose-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-slate-900">
            {formatCurrency(totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold tracking-tighter">
              <TrendingDown className="h-3 w-3" />
              SPENDING
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
