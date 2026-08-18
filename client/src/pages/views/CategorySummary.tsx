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
    <section className="category-summary">
      <h3>This month’s leading types</h3>
      {topCategories.length ? (
        topCategories.map((category) => (
          <div className="category-summary-row" key={category.id}>
            <CategoryBadge category={category} className="summary-icon" />
            <div>
              <strong>{category.name}</strong>
              <span>{formatCurrency(category.amount)}</span>
            </div>
            <span className="summary-amount">
              {formatCurrency(category.amount)}
            </span>
          </div>
        ))
      ) : (
        <div className="breakdown-empty" style={{ minHeight: 135 }}>
          <Leaf />
          <span>Add an expense to see what leads your month.</span>
        </div>
      )}
    </section>
  );
}
