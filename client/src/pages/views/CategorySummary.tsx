import { Leaf } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { useCategories } from "@/hooks/useCategories";
import { useDashboard } from "@/hooks/useReports";
import { formatCurrency, joinCategoryTotals } from "@/utils/format";

export function CategorySummary() {
  const { categories } = useCategories();
  const { data } = useDashboard();
  const topCategories = joinCategoryTotals(categories, data?.monthByCategory ?? []).slice(0, 4);
  const monthTotal = data?.monthTotal ?? 0;

  return (
    <section className="p-4 rounded-2xl border border-[#e0d8ca] bg-[#fffdf8]/75">
      <h3 className="m-0 mb-3 text-[#315542] text-xs font-bold">This month’s leading types</h3>
      {topCategories.length ? (
        topCategories.map((category, idx) => {
          const share = monthTotal ? Math.round((category.amount / monthTotal) * 100) : 0;
          return (
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
                <strong className="block text-[#3d5949] text-[11px] font-semibold truncate">
                  {category.name}
                </strong>
                <span className="block text-[#5f6961] font-mono text-[9px] mt-0.5">
                  {share}% · {category.count} item{category.count === 1 ? "" : "s"}
                </span>
              </div>
              <span className="text-[#315542] font-mono text-[10px] font-medium">
                {formatCurrency(category.amount)}
              </span>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[135px] text-center text-[#5c6861] text-[11px] leading-relaxed">
          <Leaf className="w-6 h-6 text-[#a6bca3] mb-2" />
          <span>Add an expense to see what leads your month.</span>
        </div>
      )}
    </section>
  );
}
