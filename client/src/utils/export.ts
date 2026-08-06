import { toast } from "sonner";
import { getCategoryById } from "@/constants/categories";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";

export function exportExpensesToCSV(
  expenses: Expense[],
  categories: Category[],
  fileNameDate: string
): void {
  if (!expenses.length) {
    toast.error("No expenses to export yet.");
    return;
  }

  const headers = ["ID", "Date", "Title", "Category", "Amount"];
  const rows = expenses.map((e) => {
    const cat = getCategoryById(categories, e.categoryId);
    return [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${cat.name.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `expenses-${fileNameDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Ledger exported as CSV.");
}
