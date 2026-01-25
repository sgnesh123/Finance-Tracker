import { Transaction } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = [
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#64748b", // Slate
];

export function CategoryChart({ transactions }: CategoryChartProps) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  
  const categoryTotals = expenseTransactions.reduce((acc, curr) => {
    const existing = acc.find((item) => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Sort by value desc
  categoryTotals.sort((a, b) => b.value - a.value);

  const totalExpense = categoryTotals.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);

  if (categoryTotals.length === 0) {
    return (
      <Card className="h-full border-none shadow-md">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No expenses recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="whitespace-nowrap">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryTotals}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryTotals.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), "Amount"]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => {
                const item = categoryTotals.find(c => c.name === value);
                const percent = item ? Math.round((item.value / totalExpense) * 100) : 0;
                return <span className="text-xs text-slate-600 ml-1 whitespace-nowrap">{value} ({percent}%)</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
