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
      <div className="overflow-hidden rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 shadow-sm">
        <div className="grid justify-items-center py-10 px-5 text-center">
          <img
            src="/empty-sprout.svg"
            alt="Empty Ledger Illustration"
            className="w-20 h-20 object-contain mb-1"
          />
          <h3 className="m-0 mt-1 mb-1 text-[#154734] font-serif text-xl font-bold tracking-tight">
            The ledger is waiting.
          </h3>
          <p className="m-0 max-w-[270px] text-[#748077] text-xs leading-relaxed">
            Start with the first thing you spent today. Your totals and reports
            update right away.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 shadow-sm">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[1fr_120px_100px_42px] items-center gap-3 px-5 py-3 bg-[#f0eadf] text-[#738078] font-mono text-[9px] uppercase tracking-wider">
        <span>Expense</span>
        <span>Type</span>
        <span>Date</span>
        <span aria-hidden="true" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#eee6d8]">
        {expenses.map((expense) => {
          const category = getCategoryById(categories, expense.categoryId);
          const deleting = pendingDelete === expense.id;

          return (
            <div
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_42px] items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-[#fffaf2] transition-colors group animate-row"
              key={expense.id}
            >
              {/* Description */}
              <div className="flex items-center gap-3 min-w-0">
                <CategoryBadge
                  category={category}
                  className="grid place-items-center shrink-0 w-8 h-8 rounded-xl [&_svg]:w-4 [&_svg]:h-4"
                />
                <div className="min-w-0">
                  <strong className="block text-[#244336] text-xs font-bold truncate">
                    {expense.title}
                  </strong>
                  <span className="block mt-0.5 text-[#829087] font-mono text-[10px] sm:hidden">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              </div>

              {/* Category */}
              <span className="hidden sm:block text-[#52675a] text-xs font-bold truncate">
                {category.name}
              </span>

              {/* Date */}
              <span className="hidden sm:block text-[#829087] text-[10px] font-mono">
                {formatShortDate(fromKey(expense.date))}
              </span>

              {/* Amount / Action */}
              <div className="flex sm:justify-end items-center gap-2">
                <span className="hidden sm:inline font-mono text-xs font-semibold text-[#154734] text-right">
                  {formatCurrency(expense.amount)}
                </span>

                {deleting ? (
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <button
                      className="px-2 py-1 rounded-md bg-[#ece7dc] text-[#6d786f] text-[10px] font-bold"
                      onClick={() => onRequestDelete(null)}
                    >
                      Keep
                    </button>
                    <button
                      className="px-2 py-1 rounded-md bg-[#f4dfd8] text-[#9f482f] text-[10px] font-bold"
                      onClick={() => onRemove(expense.id)}
                    >
                      Remove
                    </button>
                  </span>
                ) : (
                  <button
                    className="w-7 h-7 grid place-items-center rounded-lg text-[#a0786b] hover:text-[#ad4a37] hover:bg-[#fae9e4] transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    onClick={() => onRequestDelete(expense.id)}
                    aria-label={`Delete ${expense.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
