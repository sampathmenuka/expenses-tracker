import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/constants/storage";
import type { Expense, ExpenseDraft } from "@/types/expense";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch {
      toast.error("Your saved ledger could not be opened.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
  }, [expenses, isHydrated]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
  }, [expenses]);

  const addExpense = (draft: ExpenseDraft): boolean => {
    const amount = Number(draft.amount);
    if (!draft.title.trim() || !amount || amount <= 0) {
      toast.error("Add a name and an amount greater than zero.");
      return false;
    }

    const entry: Expense = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      amount,
      categoryId: draft.categoryId,
      date: draft.date,
    };

    setExpenses((current) => [entry, ...current]);
    toast.success("Expense recorded in today’s ledger.");
    return true;
  };

  const removeExpense = (id: string): void => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
    toast.success("Expense removed from the ledger.");
  };

  return {
    expenses,
    sortedExpenses,
    isHydrated,
    addExpense,
    removeExpense,
  };
}
