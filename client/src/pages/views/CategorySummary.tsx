import { Leaf } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";
import { getMonthKey } from "@/utils/date";
import { calculateCategoryBreakdown, formatCurrency } from "@/utils/format";

interface CategorySummaryProps {
  categories: Category[];
  expenses: Expense[];
}

export function CategorySummary({ categories, expenses }: CategorySummaryProps) {
  const currentMonthKey = getMonthKey();
  const monthExpenses = expenses.filter(
    (expense) => expense.date.slice(0, 7) === currentMonthKey
  );
  const topCategories = calculateCategoryBreakdown(categories, monthExpenses).slice(0, 4);

  return (
    <section className="p-4 rounded-2xl border border-[#e0d8ca] bg-[#fffdf8]/75">
      <h3 className="m-0 mb-3 text-[#18342a] text-xs font-bold">
        This month’s leading types
      </h3>
      {topCategories.length ? (
        topCategories.map((category, idx) => (
          <div
            className={`grid grid-cols-[28px_1fr_auto] items-center gap-2.5 py-2 ${
              idx > 0 ? "border-t border-[#eee7dc]" : ""
            }`}
            key={category.id}
          >
            <CategoryBadge
              category={category}
              className="grid place-items-center w-7 h-7 rounded-lg [&_svg]:w-3.5 [&_svg]:h-3.5"
            />
            <div className="min-w-0">
              <strong className="block text-[#18342a] text-[11px] font-semibold truncate">
                {category.name}
              </strong>
              <span className="block text-[#3c5043] font-mono text-[9px] mt-0.5 font-medium">
                {formatCurrency(category.amount)}
              </span>
            </div>
            <span className="text-[#154734] font-mono text-[10px] font-semibold">
              {formatCurrency(category.amount)}
            </span>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[135px] text-center text-[#3c5043] text-[11px] leading-relaxed">
          <Leaf className="w-6 h-6 text-[#4f8b83] mb-2" />
          <span>Add an expense to see what leads your month.</span>
        </div>
      )}
    </section>
  );
}
