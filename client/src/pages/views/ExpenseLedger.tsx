import { Fragment } from "react";
import { Pencil, StickyNote, Trash2 } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { LedgerSkeleton } from "@/components/common/Skeleton";
import { panelClass } from "@/components/common/styles";
import { getCategoryById } from "@/constants/categories";
import { useDeleteExpense } from "@/hooks/useExpenses";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";
import { dateKey, formatRelativeDay, formatShortDate, fromKey } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

interface ExpenseLedgerProps {
  expenses: Expense[];
  categories: Category[];
  isLoading?: boolean;
  /** Adds a header with a subtotal before each day's entries. */
  groupByDay?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  onEdit: (expense: Expense) => void;
  footer?: React.ReactNode;
}

export function ExpenseLedger({
  expenses,
  categories,
  isLoading = false,
  groupByDay = false,
  emptyTitle = "The ledger is waiting.",
  emptyText = "Start with the first thing you spent today. Your totals and reports update right away.",
  onEdit,
  footer,
}: ExpenseLedgerProps) {
  const remove = useDeleteExpense();
  const today = dateKey(new Date());

  if (isLoading) {
    return (
      <div className={panelClass}>
        <LedgerSkeleton />
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className={panelClass}>
        <div className="grid justify-items-center py-10 px-5 text-center">
          <img src="/empty-sprout.svg" alt="" className="w-20 h-20 object-contain mb-1" />
          <h3 className="m-0 mt-1 mb-1 text-[#154734] font-serif text-xl font-bold tracking-tight">
            {emptyTitle}
          </h3>
          <p className="m-0 max-w-[290px] text-[#5f6962] text-xs leading-relaxed">{emptyText}</p>
        </div>
      </div>
    );
  }

  const dayTotals = new Map<string, number>();
  if (groupByDay) {
    for (const expense of expenses) {
      dayTotals.set(expense.date, (dayTotals.get(expense.date) ?? 0) + expense.amount);
    }
  }

  return (
    <div className={panelClass}>
      {!groupByDay && (
        <div className="hidden sm:grid grid-cols-[1fr_120px_90px_150px] items-center gap-3 px-5 py-3 bg-[#f0eadf] text-[#5e6963] font-mono text-[9px] uppercase tracking-wider">
          <span>Expense</span>
          <span>Type</span>
          <span>Date</span>
          <span className="text-right pr-16">Amount</span>
        </div>
      )}

      <ul className="divide-y divide-[#eee6d8] m-0 p-0 list-none">
        {expenses.map((expense, index) => {
          const category = getCategoryById(categories, expense.categoryId);
          const newDay = groupByDay && expense.date !== expenses[index - 1]?.date;

          return (
            <Fragment key={expense.id}>
              {newDay && (
                <li className="flex justify-between items-center px-5 py-2 bg-[#f0eadf] text-[#586a5f] font-mono text-[10px] uppercase tracking-wider">
                  <span>{formatRelativeDay(expense.date, today)}</span>
                  <span className="font-semibold text-[#154734]">
                    {formatCurrency(dayTotals.get(expense.date) ?? 0)}
                  </span>
                </li>
              )}
              <li
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_90px_150px] items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-[#fffaf2] transition-colors group animate-row cursor-pointer"
                onClick={() => onEdit(expense)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryBadge
                    category={category}
                    className="grid place-items-center shrink-0 w-8 h-8 rounded-xl [&_svg]:w-4 [&_svg]:h-4"
                  />
                  <div className="min-w-0">
                    <strong className="flex items-center gap-1.5 text-[#244336] text-xs font-bold">
                      <span className="truncate">{expense.title}</span>
                      {expense.note && (
                        <StickyNote
                          className="w-3 h-3 shrink-0 text-[#73644d]"
                          aria-label="Has a note"
                        />
                      )}
                    </strong>
                    {expense.note ? (
                      <span className="block mt-0.5 text-[#5f6962] text-[10px] truncate">
                        {expense.note}
                      </span>
                    ) : (
                      <span className="block mt-0.5 text-[#5d6961] font-mono text-[10px] sm:hidden">
                        {category.name}
                      </span>
                    )}
                  </div>
                </div>

                <span className="hidden sm:block text-[#52675a] text-xs font-bold truncate">
                  {category.name}
                </span>

                <span className="hidden sm:block text-[#5d6961] text-[10px] font-mono">
                  {formatShortDate(fromKey(expense.date))}
                </span>

                <div className="flex justify-end items-center gap-1">
                  <span className="font-mono text-xs font-semibold text-[#154734] text-right mr-1">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    className="w-7 h-7 grid place-items-center rounded-lg text-[#586b5d] hover:text-[#154734] hover:bg-[#e7efe4] transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(expense);
                    }}
                    aria-label={`Edit ${expense.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="w-7 h-7 grid place-items-center rounded-lg text-[#805e52] hover:text-[#a94836] hover:bg-[#fae9e4] transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove.mutate(expense);
                    }}
                    disabled={remove.isPending && remove.variables?.id === expense.id}
                    aria-label={`Delete ${expense.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ul>
      {footer}
    </div>
  );
}
