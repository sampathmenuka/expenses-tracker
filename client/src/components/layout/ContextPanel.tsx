import { useState } from "react";
import { AlertTriangle, ChartBar, ChevronRight, Download, Plus } from "lucide-react";
import { Link } from "wouter";
import { iconButton } from "@/components/common/styles";
import { CategoryDialog } from "@/components/modals/CategoryDialog";
import { getCategoryById } from "@/constants/categories";
import { useCategories } from "@/hooks/useCategories";
import { useDashboard } from "@/hooks/useReports";
import { CategorySummary } from "@/pages/views/CategorySummary";
import { exportExpensesToCSV } from "@/utils/export";
import { formatCurrency } from "@/utils/format";

export function ContextPanel() {
  const { data } = useDashboard();
  const { categories } = useCategories();
  const [categoryDialog, setCategoryDialog] = useState(false);

  // Categories at or past 80% of their monthly limit deserve a heads-up.
  const warnings = (data?.categoryBudgets ?? [])
    .filter((b) => b.budget > 0 && b.spent / b.budget >= 0.8)
    .sort((a, b) => b.spent / b.budget - a.spent / a.budget);

  return (
    <aside aria-label="At a glance" className="p-7 bg-[#fffdf8]/45 border-l border-[#154734]/10 hidden xl:block">
      <section className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-[#154734] font-serif text-[21px] tracking-tight font-bold m-0">
          At a glance
        </h2>
        <button
          className={iconButton}
          onClick={() => setCategoryDialog(true)}
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
          <div className="flex flex-wrap justify-between items-end gap-2 mt-2">
            <strong className="font-serif text-[28px] leading-none tracking-tight">
              {formatCurrency(data?.weekTotal ?? 0)}
            </strong>
            <span className="shrink-0 whitespace-nowrap px-2 py-1 rounded-lg text-[#ecf5e9] bg-white/15 font-mono text-[9px]">
              {data?.weekCount ?? 0} items
            </span>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-white/15 text-[#c7d6cc] text-[10px] leading-relaxed">
          Each entry you add builds a clearer picture of your everyday spending.
        </div>
      </div>

      {warnings.length > 0 && (
        <section className="mb-4 p-4 rounded-2xl border border-[#e3b9a6] bg-[#fbeee9]">
          <h3 className="flex items-center gap-1.5 m-0 mb-2 text-[#8d4430] text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Budget watch
          </h3>
          {warnings.map((b) => {
            const category = getCategoryById(categories, b.categoryId);
            const over = b.spent > b.budget;
            return (
              <p key={b.categoryId} className="m-0 py-1 text-[11px] text-[#7a4a3a] flex justify-between gap-2">
                <span className="truncate font-semibold">{category.name}</span>
                <span className="font-mono text-[10px] shrink-0">
                  {over
                    ? `${formatCurrency(b.spent - b.budget)} over`
                    : `${Math.round((b.spent / b.budget) * 100)}% used`}
                </span>
              </p>
            );
          })}
        </section>
      )}

      <CategorySummary />

      <Link
        href="/reports"
        className="flex items-center gap-2 w-full mt-3 p-1.5 no-underline text-[#154734] text-[11px] font-bold transition-colors hover:text-[#0f392a]"
      >
        <ChartBar className="w-3.5 h-3.5" />
        <span>View weekly and monthly reports</span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </Link>
      <button
        className="flex items-center gap-2 w-full mt-1 p-1.5 bg-transparent text-[#154734] text-[11px] font-bold text-left transition-colors hover:text-[#0f392a]"
        onClick={() => exportExpensesToCSV()}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export expenses as CSV</span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </button>

      <CategoryDialog isOpen={categoryDialog} onClose={() => setCategoryDialog(false)} />
    </aside>
  );
}
