import { Plus, Trash2 } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";

interface CategoriesViewProps {
  categories: Category[];
  expenses: Expense[];
  onAdd: () => void;
  onRemoveCategory: (id: string) => void;
}

export function CategoriesView({
  categories,
  expenses,
  onAdd,
  onRemoveCategory,
}: CategoriesViewProps) {
  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[#3c5043] text-[9px] font-mono font-semibold uppercase tracking-wider">
            Your spending vocabulary
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#154734] leading-tight tracking-tight">
            Categories
          </h1>
        </div>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#154734] text-[#fffaf0] text-xs font-bold shadow-md shadow-[#154734]/15 transition-all hover:bg-[#0f392a] active:scale-95 self-start sm:self-auto cursor-pointer"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" /> New category
        </button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden p-6 sm:p-7 mb-7 rounded-3xl border border-[#154734]/15 bg-gradient-to-br from-[#fffdf8]/95 via-[#f2ebde]/90 to-[#eae0cd]/85 shadow-lg shadow-black/5 animate-surface">
        <span className="text-[#3c5043] text-[9px] font-mono font-semibold uppercase tracking-wider">
          Made to flex with your life
        </span>
        <h2 className="mt-2 mb-1.5 font-serif text-2xl sm:text-[28px] font-bold text-[#154734] tracking-tight leading-tight">
          Every expense needs a home.
        </h2>
        <p className="m-0 max-w-md text-[#234437] text-xs sm:text-[13px] leading-relaxed font-medium">
          Your original categories are ready. Add as many personal expense types
          as you need.
        </p>
      </section>

      {/* Categories grid */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="m-0 font-serif text-xl sm:text-[22px] font-bold text-[#154734] tracking-tight">
              Available categories
            </h2>
            <p className="m-0 text-[#3c5043] text-xs">
              {categories.length} ways to organize your spending.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:[&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(odd)]:border-r border-[#eee7dc]">
            {categories.map((category) => {
              const entries = expenses.filter(
                (expense) => expense.categoryId === category.id
              ).length;

              return (
                <article
                  className="p-5 flex items-start gap-3.5 hover:bg-[#fffaf2] transition-colors"
                  key={category.id}
                >
                  <CategoryBadge
                    category={category}
                    className="grid place-items-center shrink-0 w-9 h-9 rounded-xl [&_svg]:w-4 [&_svg]:h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="m-0 text-[#18342a] text-xs sm:text-sm font-bold truncate">
                        {category.name}
                      </h3>
                      {category.isCustom && (
                        <button
                          className="w-6 h-6 grid place-items-center rounded-lg text-[#825e53] hover:text-[#ad4a37] hover:bg-[#fae9e4] transition-all cursor-pointer"
                          onClick={() => onRemoveCategory(category.id)}
                          title="Delete custom category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 mb-0 text-[#3c5043] font-mono text-[10px] font-medium">
                      {entries} recorded item{entries === 1 ? "" : "s"}
                    </p>
                    {category.isCustom && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-[#6f8775]/20 text-[#154734] font-mono text-[8px] font-bold uppercase tracking-wider">
                        Custom
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
