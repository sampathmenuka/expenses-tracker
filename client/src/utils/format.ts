import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export interface CategoryBreakdownItem extends Category {
  amount: number;
}

export function calculateCategoryBreakdown(
  categories: Category[],
  expenses: Expense[]
): CategoryBreakdownItem[] {
  return categories
    .map((category) => ({
      ...category,
      amount: sumExpenses(
        expenses.filter((expense) => expense.categoryId === category.id)
      ),
    }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}
