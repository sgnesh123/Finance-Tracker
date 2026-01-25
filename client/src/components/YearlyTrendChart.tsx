import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

interface YearlyTrendChartProps {
  transactions: Transaction[];
}

export function YearlyTrendChart({ transactions }: YearlyTrendChartProps) {
  // Get last 12 months
  const now = new Date();
  const months = eachMonthOfInterval({
    start: subMonths(now, 11),
    end: now,
  });

  const data = months.map((month) => {
    const monthStr = format(month, "MMM yy");
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0) / 100;

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0) / 100;

    return {
      name: monthStr,
      income,
      expense,
    };
  });

  return (
    <Card className="border-none shadow-lg bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-slate-800">Yearly Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}
            />
            <Bar 
              dataKey="income" 
              name="Income" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={16}
            />
            <Bar 
              dataKey="expense" 
              name="Expense" 
              fill="#f43f5e" 
              radius={[4, 4, 0, 0]} 
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
