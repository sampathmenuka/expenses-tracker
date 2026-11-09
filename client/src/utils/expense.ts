import type { Expense, ExpenseDraft, ExpenseInput } from "@/types/expense";

/** Validates a form draft; returns the API payload or a message for the user. */
export function draftToInput(draft: ExpenseDraft): ExpenseInput | string {
  const title = draft.title.trim();
  const amount = Number(draft.amount);
  if (!title) return "Give the expense a name.";
  if (!draft.amount || !Number.isFinite(amount) || amount <= 0)
    return "Enter an amount greater than zero.";
  if (!/^\d+(\.\d{1,2})?$/.test(draft.amount.trim()))
    return "Amounts can have at most two decimal places.";
  if (!draft.categoryId) return "Choose an expense type.";
  if (!draft.date) return "Pick a date.";
  return {
    title,
    amount,
    categoryId: draft.categoryId,
    date: draft.date,
    note: draft.note.trim() || null,
  };
}

export function expenseToDraft(expense: Expense): ExpenseDraft {
  return {
    title: expense.title,
    amount: String(expense.amount),
    categoryId: expense.categoryId,
    date: expense.date,
    note: expense.note ?? "",
  };
}
