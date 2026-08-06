import { Trash2 } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { getCategoryById } from "@/constants/categories";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";
import { formatShortDate, fromKey } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

interface ExpenseLedgerProps {
  expenses: Expense[];
  categories: Category[];
  pendingDelete: string | null;
  onRequestDelete: (id: string | null) => void;
  onRemove: (id: string) => void;
}

export function ExpenseLedger({
  expenses,
  categories,
  pendingDelete,
  onRequestDelete,
  onRemove,
}: ExpenseLedgerProps) {
  if (!expenses.length) {
    return (
      <div className="ledger-panel">
        <div className="empty-ledger">
          <img src="/empty-sprout.svg" alt="Empty Ledger Illustration" />
          <h3>The ledger is waiting.</h3>
          <p>
            Start with the first thing you spent today. Your totals and reports
            update right away.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ledger-panel">
      <div className="ledger-header">
        <span>Expense</span>
        <span>Type</span>
        <span>Date</span>
        <span aria-hidden="true" />
      </div>
      {expenses.map((expense) => {
        const category = getCategoryById(categories, expense.categoryId);
        const deleting = pendingDelete === expense.id;

        return (
          <div className="expense-row" key={expense.id}>
            <div className="expense-description">
              <CategoryBadge category={category} className="expense-icon" />
              <div>
                <strong>{expense.title}</strong>
                <span>{formatCurrency(expense.amount)}</span>
              </div>
            </div>
            <span className="expense-category">{category.name}</span>
            <span className="expense-date">
              {formatShortDate(fromKey(expense.date))}
            </span>
            {deleting ? (
              <span className="delete-confirm">
                <button
                  className="mini-action cancel"
                  onClick={() => onRequestDelete(null)}
                >
                  Keep
                </button>
                <button
                  className="mini-action"
                  onClick={() => onRemove(expense.id)}
                >
                  Remove
                </button>
              </span>
            ) : (
              <button
                className="delete-button"
                onClick={() => onRequestDelete(expense.id)}
                aria-label={`Delete ${expense.title}`}
              >
                <Trash2 />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
