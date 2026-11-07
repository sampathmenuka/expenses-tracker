export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note: string | null;
}

/** Form state: amount stays a string while the user is typing. */
export interface ExpenseDraft {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
  note: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note: string | null;
}

export type ExpenseSort = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export interface ExpenseFilters {
  start?: string;
  end?: string;
  categoryId?: string;
  q?: string;
  sort?: ExpenseSort;
}

export interface ExpensePage {
  items: Expense[];
  total: number;
  totalAmount: number;
}
