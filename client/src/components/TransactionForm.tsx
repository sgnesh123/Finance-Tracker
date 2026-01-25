import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTransactionSchema } from "@shared/schema";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

// Frontend validation schema
const formSchema = insertTransactionSchema.extend({
  description: z.string().min(1, "Description is required").max(100, "Description is too long"),
  amount: z.coerce.number({ invalid_type_error: "Amount is required" }).positive("Amount must be greater than 0"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date({ invalid_type_error: "Date is required" }).refine((date) => date <= new Date(), {
    message: "Date cannot be in the future",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  defaultValues?: Partial<FormValues> & { id?: number };
  onSuccess?: () => void;
}

export const CATEGORIES = [
  "Salary",
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Other",
];

export function TransactionForm({ defaultValues, onSuccess }: TransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const [dateOpen, setDateOpen] = useState(false);

  const isEditing = !!defaultValues?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: defaultValues?.description || "",
      amount: defaultValues?.amount ? defaultValues.amount / 100 : undefined, // Convert cents to dollars for input
      type: (defaultValues?.type as "income" | "expense") || undefined,
      category: defaultValues?.category || undefined,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
    } as any,
  });

  const onSubmit = async (values: FormValues) => {
    // Convert dollars back to cents for API
    const apiData = {
      description: values.description,
      amount: Math.round(values.amount * 100),
      type: values.type as "income" | "expense",
      category: values.category,
      date: values.date,
    };

    if (isEditing && defaultValues?.id) {
      await updateTransaction.mutateAsync({
        id: defaultValues.id,
        ...apiData,
      });
    } else {
      await createTransaction.mutateAsync(apiData);
    }
    
    onSuccess?.();
    if (!isEditing) form.reset();
  };

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Weekly Groceries" {...field} className="rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    className="rounded-xl font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select an Option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select an Option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-xl",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setDateOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full rounded-xl"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Transaction" : "Add Transaction"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
