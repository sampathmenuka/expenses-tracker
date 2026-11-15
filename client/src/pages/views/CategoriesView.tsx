import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { BudgetBar } from "@/components/common/BudgetBar";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/common/Skeleton";
import {
  eyebrowClass,
  heroClass,
  panelClass,
  primaryButton,
  sectionTitleClass,
} from "@/components/common/styles";
import { CategoryDialog } from "@/components/modals/CategoryDialog";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { useDashboard } from "@/hooks/useReports";
import type { Category } from "@/types/category";
import { formatCurrency } from "@/utils/format";

export function CategoriesView() {
  const { categories, isLoading } = useCategories();
  const { data: dashboard } = useDashboard();
  const remove = useDeleteCategory();
  const [dialog, setDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const monthSpend = new Map(
    (dashboard?.monthByCategory ?? []).map((row) => [row.categoryId, row.amount])
  );

  return (
    <>
      <PageHeader eyebrow="Your spending vocabulary" title="Categories">
        <button
          className={`${primaryButton} self-start sm:self-auto`}
          onClick={() => setDialog({ open: true, category: null })}
        >
          <Plus className="w-4 h-4" /> New category
        </button>
      </PageHeader>

      <section className={heroClass}>
        <span className={eyebrowClass}>Made to flex with your life</span>
        <h2 className="mt-2 mb-1.5 font-serif text-2xl sm:text-[28px] font-bold text-[#154734] tracking-tight leading-tight">
          Every expense needs a home.
        </h2>
        <p className="m-0 max-w-md text-[#4f6858] text-xs sm:text-[13px] leading-relaxed font-medium">
          Rename, recolour, and give any category a monthly limit. We'll show how close you are as
          the month goes on.
        </p>
      </section>

      <section>
        <div className="mb-3">
          <h2 className={sectionTitleClass}>Available categories</h2>
          <p className="m-0 text-[#606861] text-xs">
            {categories.length} ways to organize your spending.
          </p>
        </div>

        <div className={panelClass}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:[&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(odd)]:border-r border-[#eee7dc]">
              {categories.map((category) => {
                const spent = monthSpend.get(category.id) ?? 0;
                const confirming = pendingDelete === category.id;
                const canDelete = category.isCustom && !category.isFallback;

                return (
                  <article
                    className="p-5 flex items-start gap-3.5 hover:bg-[#fffaf2] transition-colors group"
                    key={category.id}
                  >
                    <CategoryBadge
                      category={category}
                      className="grid place-items-center shrink-0 w-9 h-9 rounded-xl [&_svg]:w-4 [&_svg]:h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="m-0 text-[#315542] text-xs sm:text-sm font-bold truncate">
                          {category.name}
                          {category.isCustom && (
                            <span className="ml-2 align-middle px-1.5 py-0.5 rounded-md bg-[#586b5d]/15 text-[#3d5c45] font-mono text-[8px] font-bold uppercase tracking-wider">
                              Custom
                            </span>
                          )}
                        </h3>
                        <div className="flex gap-1 shrink-0">
                          <button
                            className="w-6 h-6 grid place-items-center rounded-lg text-[#586b5d] hover:text-[#154734] hover:bg-[#e7efe4] transition-all"
                            onClick={() => setDialog({ open: true, category })}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              className="w-6 h-6 grid place-items-center rounded-lg text-[#805e52] hover:text-[#a94836] hover:bg-[#fae9e4] transition-all"
                              onClick={() => setPendingDelete(category.id)}
                              aria-label={`Delete ${category.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 mb-0 text-[#5f6861] font-mono text-[10px]">
                        {category.expenseCount} recorded item{category.expenseCount === 1 ? "" : "s"}
                        {spent > 0 && ` · ${formatCurrency(spent)} this month`}
                      </p>

                      {category.monthlyBudget ? (
                        <BudgetBar spent={spent} budget={category.monthlyBudget} className="mt-2.5" />
                      ) : null}

                      {confirming && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#fbeee9] text-[#8d4430] text-[11px]">
                          <p className="m-0 mb-2">
                            {category.expenseCount
                              ? `Its ${category.expenseCount} expense${category.expenseCount === 1 ? "" : "s"} will move to Other.`
                              : "Delete this category?"}
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              className="px-2 py-1 rounded-md bg-[#ece7dc] text-[#5e6860] text-[10px] font-bold"
                              onClick={() => setPendingDelete(null)}
                            >
                              Keep
                            </button>
                            <button
                              className="px-2 py-1 rounded-md bg-[#c4553b] text-white text-[10px] font-bold disabled:opacity-60"
                              disabled={remove.isPending}
                              onClick={() =>
                                remove.mutate(category.id, { onSettled: () => setPendingDelete(null) })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CategoryDialog
        isOpen={dialog.open}
        category={dialog.category}
        onClose={() => setDialog({ open: false, category: null })}
      />
    </>
  );
}
