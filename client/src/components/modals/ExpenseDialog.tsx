import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import {
  dangerButton,
  inputClass,
  selectClass,
  labelClass,
  primaryButton,
  secondaryButton,
} from "@/components/common/styles";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteExpense, useUpdateExpense } from "@/hooks/useExpenses";
import type { Expense, ExpenseDraft } from "@/types/expense";
import { getCurrency } from "@/utils/format";
import { draftToInput, expenseToDraft } from "@/utils/expense";

interface ExpenseDialogProps {
  expense: Expense | null;
  onClose: () => void;
}

export function ExpenseDialog({ expense, onClose }: ExpenseDialogProps) {
  const { categories } = useCategories();
  const update = useUpdateExpense();
  const remove = useDeleteExpense();
  const [draft, setDraft] = useState<ExpenseDraft | null>(null);

  useEffect(() => {
    setDraft(expense ? expenseToDraft(expense) : null);
  }, [expense]);

  const set = (patch: Partial<ExpenseDraft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!expense || !draft) return;
    const input = draftToInput(draft);
    if (typeof input === "string") {
      toast.error(input);
      return;
    }
    update.mutate({ id: expense.id, input }, { onSuccess: onClose });
  };

  const handleDelete = () => {
    if (!expense) return;
    remove.mutate(expense, { onSuccess: onClose });
  };

  return (
    <Modal open={Boolean(expense)} onClose={onClose} eyebrow="Edit entry" title="Expense details">
      {draft && (
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <label htmlFor="edit-title" className={labelClass}>What was it?</label>
            <input
              id="edit-title"
              className={inputClass}
              value={draft.title}
              maxLength={120}
              onChange={(e) => set({ title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="edit-amount" className={labelClass}>
                Amount ({getCurrency()})
              </label>
              <input
                id="edit-amount"
                className={`${inputClass} font-mono`}
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={draft.amount}
                onChange={(e) => set({ amount: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="edit-date" className={labelClass}>Date</label>
              <input
                id="edit-date"
                className={inputClass}
                type="date"
                value={draft.date}
                onChange={(e) => set({ date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="edit-category" className={labelClass}>Expense type</label>
            <select
              id="edit-category"
              className={selectClass}
              value={draft.categoryId}
              onChange={(e) => set({ categoryId: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="edit-note" className={labelClass}>Note (optional)</label>
            <textarea
              id="edit-note"
              className={`${inputClass} h-20 py-2 resize-none font-medium`}
              maxLength={1000}
              placeholder="Anything worth remembering about this?"
              value={draft.note}
              onChange={(e) => set({ note: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-between mt-1">
            <button
              type="button"
              className={dangerButton}
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button type="button" className={secondaryButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={primaryButton} disabled={update.isPending}>
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
