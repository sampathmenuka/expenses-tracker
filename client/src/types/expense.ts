export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
}

export interface ExpenseDraft {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
}
