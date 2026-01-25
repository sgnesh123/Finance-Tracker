import { useTransactions, useBudgets } from "@/hooks/use-transactions";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { CategoryChart } from "@/components/CategoryChart";
import { YearlyTrendChart } from "@/components/YearlyTrendChart";
import { BudgetManager } from "@/components/BudgetManager";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, startOfYear, eachMonthOfInterval } from "date-fns";

export default function Dashboard() {
  // --- Data Fetching ---
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: budgets = [] } = useBudgets();

  // --- Component State ---
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // --- Filtering Logic ---
  const monthStart = startOfMonth(new Date(selectedMonth + "-01T00:00:00"));
  const monthEnd = endOfMonth(monthStart);

  // Generate a list of all months in the currently viewed year for the month picker
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(viewYear, 0, 1)),
    end: endOfMonth(new Date(viewYear, 11, 1)),
  });

  /**
   * Transactions filtered by the currently selected month.
   * This is the base dataset for summary cards and monthly charts.
   */
  const monthFilteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
  });

  // --- Budget Calculations ---
  const getCategorySpending = (category: string) => {
    return monthFilteredTransactions
      .filter((t) => t.category === category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  /**
   * Identifies categories where spending is approaching or exceeding budget limits.
   */
  const budgetAlerts = budgets.map(budget => {
    const spending = getCategorySpending(budget.category);
    const percent = (spending / budget.limit) * 100;
    if (percent >= 100) return { type: 'danger', category: budget.category, percent };
    if (percent >= 80) return { type: 'warning', category: budget.category, percent };
    return null;
  }).filter((alert): alert is { type: string; category: string; percent: number } => alert !== null);

  /**
   * Final subset of transactions for the Recent Transactions list, 
   * applying search query, type filter, and sorting.
   */
  const filteredTransactions = monthFilteredTransactions
    .filter((t) => filterType === "all" || t.type === filterType)
    .filter((t) => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.amount - a.amount;
    });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              FINSIGHT
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full bg-white/50 border-slate-200 gap-2 px-4">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{format(monthStart, "MMMM yyyy")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" onClick={() => setViewYear(v => v - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-bold">{viewYear}</span>
                  <Button variant="ghost" size="icon" onClick={() => setViewYear(v => v + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month) => {
                    const monthVal = format(month, "yyyy-MM");
                    const isSelected = selectedMonth === monthVal;
                    return (
                      <Button
                        key={monthVal}
                        variant={isSelected ? "default" : "ghost"}
                        className={cn(
                          "h-9 w-full text-xs font-medium",
                          isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        onClick={() => setSelectedMonth(monthVal)}
                      >
                        {format(month, "MMM")}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full shadow-lg hover-elevate active-elevate-2 transition-all duration-300 bg-primary hover:bg-primary/90">
                  <Plus className="w-5 h-5 mr-1" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <DialogDescription>
                    Record transactions to monitor your finances
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-12">
          
          {/* Top Summary Section */}
          <section className="relative">
            <div className="flex flex-col gap-1 mb-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome!</h2>
              <p className="text-slate-500 font-medium text-lg">
                Here's a summary of your financial activity for {format(monthStart, "MMMM yyyy")}
              </p>
            </div>
            <SummaryCards transactions={monthFilteredTransactions} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Transaction List */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Transactions</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 bg-white/50 p-4 rounded-3xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search"
                      className="pl-10 bg-white border-slate-200 rounded-2xl h-11 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Select 
                      value={filterType} 
                      onValueChange={(val: any) => setFilterType(val)}
                    >
                      <SelectTrigger className="w-[140px] rounded-2xl bg-white h-11 border-slate-200 shadow-sm">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={sortBy} 
                      onValueChange={(val: any) => setSortBy(val)}
                    >
                      <SelectTrigger className="w-[140px] rounded-2xl bg-white h-11 border-slate-200 shadow-sm">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <TransactionList 
                  transactions={filteredTransactions} 
                  isLoading={isLoading} 
                />
              </div>
            </div>

            {/* Right Column: Analytics & Budgets */}
            <div className="lg:col-span-4 space-y-10">
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Analytics
                </h3>
                <div className="flex flex-col gap-6">
                  <CategoryChart transactions={monthFilteredTransactions} />
                  <YearlyTrendChart transactions={transactions} />
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  Budgets
                </h3>
                <BudgetManager transactions={monthFilteredTransactions} />
              </section>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
