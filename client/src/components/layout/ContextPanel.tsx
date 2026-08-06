import { ChartBar, ChevronRight, Download, Plus } from "lucide-react";
import { CategorySummary } from "@/pages/views/CategorySummary";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";
import type { PageTab } from "@/types/navigation";
import { getWeekRange } from "@/utils/date";
import { formatCurrency, sumExpenses } from "@/utils/format";

interface ContextPanelProps {
  categories: Category[];
  expenses: Expense[];
  onOpenCategoryDialog: () => void;
  onSelectPage: (page: PageTab) => void;
  onExportCSV: () => void;
}

export function ContextPanel({
  categories,
  expenses,
  onOpenCategoryDialog,
  onSelectPage,
  onExportCSV,
}: ContextPanelProps) {
  const { startKey, endKey } = getWeekRange();

  const weekExpenses = expenses.filter(
    (expense) => expense.date >= startKey && expense.date <= endKey
  );
  const weekTotal = sumExpenses(weekExpenses);

  return (
    <aside className="context-column">
      <section className="context-heading">
        <h2>At a glance</h2>
        <button
          className="icon-button"
          onClick={onOpenCategoryDialog}
          aria-label="Add a custom category"
        >
          <Plus />
        </button>
      </section>

      <div className="snapshot-card">
        <div className="snapshot-top">
          <span className="summary-label">This week</span>
          <div className="snapshot-total">
            <strong>{formatCurrency(weekTotal)}</strong>
            <span className="snapshot-pill">{weekExpenses.length} items</span>
          </div>
        </div>
        <div className="snapshot-foot">
          Each entry you add builds a clearer picture of your everyday spending.
        </div>
      </div>

      <CategorySummary categories={categories} expenses={expenses} />

      <button className="side-link" onClick={() => onSelectPage("reports")}>
        <ChartBar /> View weekly and monthly reports <ChevronRight />
      </button>
      <button
        className="side-link"
        style={{ marginTop: 4 }}
        onClick={onExportCSV}
      >
        <Download /> Export expenses as CSV <ChevronRight />
      </button>
    </aside>
  );
}
