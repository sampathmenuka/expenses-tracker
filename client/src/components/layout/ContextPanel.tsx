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
    <aside className="p-7 bg-[#fffdf8]/45 border-l border-[#154734]/10 hidden xl:block">
      <section className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-[#154734] font-serif text-[21px] tracking-tight font-bold m-0">
          At a glance
        </h2>
        <button
          className="w-8 h-8 border border-[#ded4c5] bg-[#fffdf8] text-[#315542] rounded-xl grid place-items-center transition-all hover:bg-[#e7efe4] active:scale-95"
          onClick={onOpenCategoryDialog}
          aria-label="Add a custom category"
        >
          <Plus className="w-4 h-4" />
        </button>
      </section>

      <div className="overflow-hidden mb-4 rounded-2xl bg-[#154734] text-[#fffaf0] shadow-xl shadow-[#154734]/15">
        <div className="p-5 pb-4">
          <span className="text-[#c5d9c4] text-[9px] font-mono uppercase tracking-wider">
            This week
          </span>
          <div className="flex justify-between items-end mt-2">
            <strong className="font-serif text-[28px] leading-none tracking-tight">
              {formatCurrency(weekTotal)}
            </strong>
            <span className="px-2 py-1 rounded-lg text-[#ecf5e9] bg-white/15 font-mono text-[9px]">
              {weekExpenses.length} items
            </span>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-white/15 text-[#c7d6cc] text-[10px] leading-relaxed">
          Each entry you add builds a clearer picture of your everyday spending.
        </div>
      </div>

      <CategorySummary categories={categories} expenses={expenses} />

      <button
        className="flex items-center gap-2 w-full mt-3 p-1.5 bg-transparent text-[#154734] text-[11px] font-bold text-left transition-colors hover:text-[#0f392a]"
        onClick={() => onSelectPage("reports")}
      >
        <ChartBar className="w-3.5 h-3.5" />
        <span>View weekly and monthly reports</span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </button>
      <button
        className="flex items-center gap-2 w-full mt-1 p-1.5 bg-transparent text-[#154734] text-[11px] font-bold text-left transition-colors hover:text-[#0f392a]"
        onClick={onExportCSV}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export expenses as CSV</span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </button>
    </aside>
  );
}
