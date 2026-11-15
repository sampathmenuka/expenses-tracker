import { useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/common/Skeleton";
import { eyebrowClass, panelClass, sectionTitleClass } from "@/components/common/styles";
import { CategoryChangeChart } from "@/components/insights/CategoryChangeChart";
import { MonthlyTrendChart } from "@/components/insights/MonthlyTrendChart";
import { PacingChart } from "@/components/insights/PacingChart";
import { SpendingHeatmap } from "@/components/insights/SpendingHeatmap";
import { StatTile } from "@/components/insights/StatTile";
import { WeekdayChart } from "@/components/insights/WeekdayChart";
import { ExpenseDialog } from "@/components/modals/ExpenseDialog";
import { getCategoryById } from "@/constants/categories";
import { usePacing, useTrends } from "@/hooks/useAnalytics";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";
import type { Trends } from "@/types/api";
import { formatShortDate, fromKey } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { buildInsights, type InsightTone } from "@/utils/insights";
import { projectMonthEnd } from "@/utils/projection";

const RANGES = [3, 6, 12] as const;

const TONE: Record<InsightTone, { icon: typeof Info; className: string }> = {
  good: { icon: CheckCircle2, className: "text-[#3a7048]" },
  warning: { icon: TriangleAlert, className: "text-[#a74830]" },
  neutral: { icon: Info, className: "text-[#526c5b]" },
};

function percentChange(now: number, before: number): number | null {
  return before ? ((now - before) / before) * 100 : null;
}

export function InsightsView() {
  const [months, setMonths] = useState<(typeof RANGES)[number]>(6);
  const [editing, setEditing] = useState<Expense | null>(null);
  const { categories } = useCategories();
  const pacingQuery = usePacing();
  const trendsQuery = useTrends(months);
  const pacing = pacingQuery.data;
  const trends = trendsQuery.data;
  const stale = trendsQuery.isPlaceholderData;

  const insights = useMemo(
    () => (pacing && trends ? buildInsights(pacing, trends, categories) : []),
    [pacing, trends, categories]
  );

  return (
    <>
      <PageHeader eyebrow="Understand your spending" title="Insights" />

      {/* This month - not affected by the range control below. */}
      <section className="mb-8">
        <div className="mb-3">
          <h2 className={sectionTitleClass}>This month so far</h2>
          <p className="m-0 text-[#606861] text-xs">How you're tracking, compared with last month.</p>
        </div>

        {pacing ? (
          <>
            <ThisMonthTiles pacing={pacing} />
            <div className="grid grid-cols-1 2xl:grid-cols-[1.25fr_1fr] gap-4">
              <PacingChart pacing={pacing} />
              <CategoryChangeChart pacing={pacing} categories={categories} />
            </div>
          </>
        ) : (
          <LoadingBlock />
        )}
      </section>

      {/* One control, scoping everything below it. */}
      <div className="sticky top-0 md:top-0 z-10 -mx-1 px-1 py-2 mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#f7f1e5]/90 backdrop-blur-md">
        <div>
          <h2 className={sectionTitleClass}>Patterns over time</h2>
          {trends && (
            <p className="m-0 text-[#606861] text-xs">
              {formatShortDate(fromKey(trends.start))} – {formatShortDate(fromKey(trends.end))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {trendsQuery.isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#506d5b]" aria-label="Updating" />}
          <div
            className="inline-flex p-1 gap-1 rounded-xl bg-[#fffdf8] border border-[#154734]/15"
            role="radiogroup"
            aria-label="Time range"
          >
            {RANGES.map((range) => (
              <button
                key={range}
                role="radio"
                aria-checked={months === range}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  months === range ? "bg-[#154734] text-[#fffaf0] shadow-sm" : "text-[#526c5b] hover:text-[#154734]"
                }`}
                onClick={() => setMonths(range)}
              >
                {range} months
              </button>
            ))}
          </div>
        </div>
      </div>

      {trends ? (
        <div className="grid gap-4">
          {insights.length > 0 && (
            <section className={`${panelClass} p-5`} aria-label="Key findings">
              <span className={eyebrowClass}>Key findings</span>
              <ul className="m-0 mt-3 p-0 list-none grid gap-2.5">
                {insights.map((insight) => {
                  const tone = TONE[insight.tone];
                  return (
                    <li key={insight.text} className="flex gap-2.5 text-[13px] leading-snug text-[#2f4a3d]">
                      <tone.icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone.className}`} aria-hidden="true" />
                      <span>{insight.text}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity ${stale ? "opacity-50" : ""}`}>
            <StatTile
              label={`Spent in ${months} months`}
              value={formatCurrency(trends.stats.total)}
              detail={`${trends.stats.count} expenses`}
            />
            <StatTile label="Average per month" value={formatCurrency(trends.stats.averagePerMonth)} />
            <StatTile
              label="Typical expense"
              value={formatCurrency(trends.stats.medianTransaction)}
              detail={`Median. The mean is ${formatCurrency(trends.stats.averageTransaction)}.`}
            />
            <StatTile
              label="Days with spending"
              value={`${trends.stats.spendingDays} / ${trends.stats.days}`}
              detail={`${Math.round((trends.stats.spendingDays / Math.max(trends.stats.days, 1)) * 100)}% of days`}
            />
          </div>

          <MonthlyTrendChart trends={trends} categories={categories} stale={stale} />
          <SpendingHeatmap trends={trends} stale={stale} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <WeekdayChart trends={trends} stale={stale} />
            <FrequentPurchases trends={trends} categories={categories} stale={stale} />
          </div>

          <LargestExpenses trends={trends} categories={categories} stale={stale} onSelect={setEditing} />
        </div>
      ) : (
        <LoadingBlock />
      )}

      <ExpenseDialog expense={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function ThisMonthTiles({ pacing }: { pacing: NonNullable<ReturnType<typeof usePacing>["data"]> }) {
  const change = percentChange(pacing.thisMonthTotal, pacing.lastMonthSamePoint);
  const projected = projectMonthEnd(pacing);
  const budget = pacing.monthlyBudget;
  const remainingDays = pacing.daysInMonth - pacing.daysElapsed;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <StatTile
        label="Spent so far"
        value={formatCurrency(pacing.thisMonthTotal)}
        trend={change === null ? undefined : Math.abs(change) < 5 ? "flat" : change > 0 ? "up" : "down"}
        trendText={
          change === null
            ? undefined
            : `${Math.abs(change).toFixed(0)}% ${change >= 0 ? "more" : "less"} than by day ${pacing.daysElapsed} last month`
        }
        detail={change === null ? `Day ${pacing.daysElapsed} of ${pacing.daysInMonth}` : undefined}
      />
      <StatTile
        label="Projected by month-end"
        value={formatCurrency(projected)}
        trend={budget ? (projected > budget ? "alert" : "down") : undefined}
        trendText={
          budget
            ? projected > budget
              ? `${formatCurrency(projected - budget)} over budget`
              : `${formatCurrency(budget - projected)} under budget`
            : undefined
        }
        detail={`Last month: ${formatCurrency(pacing.lastMonthTotal)}`}
      />
      <StatTile
        label="Daily average"
        value={formatCurrency(pacing.daysElapsed ? pacing.thisMonthTotal / pacing.daysElapsed : 0)}
        detail={`Last month: ${formatCurrency(pacing.lastMonthTotal / Math.max(pacing.lastMonthDaily.length, 1))}`}
      />
      {budget ? (
        <StatTile
          label="Left in budget"
          value={formatCurrency(Math.max(budget - pacing.thisMonthTotal, 0))}
          trend={pacing.thisMonthTotal > budget ? "alert" : undefined}
          trendText={pacing.thisMonthTotal > budget ? `${formatCurrency(pacing.thisMonthTotal - budget)} over` : undefined}
          detail={
            pacing.thisMonthTotal <= budget && remainingDays > 0
              ? `${formatCurrency((budget - pacing.thisMonthTotal) / remainingDays)} a day for ${remainingDays} days`
              : undefined
          }
        />
      ) : (
        <StatTile label="Days left" value={String(remainingDays)} detail="Set a monthly budget in Settings to track it here." />
      )}
    </div>
  );
}

function FrequentPurchases({ trends, categories, stale }: { trends: Trends; categories: Category[]; stale?: boolean }) {
  return (
    <section className={`${panelClass} p-5 transition-opacity ${stale ? "opacity-50" : ""}`}>
      <h3 className="m-0 font-serif text-lg font-bold text-[#315542] tracking-tight">Repeat purchases</h3>
      <p className="mt-0.5 mb-3 text-[#5e6861] text-xs">Things you buy again and again add up.</p>
      {trends.frequent.length ? (
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="text-[#5e6963] font-mono text-[9px] uppercase tracking-wider">
              <th scope="col" className="text-left font-medium pb-2">Item</th>
              <th scope="col" className="text-right font-medium pb-2">Times</th>
              <th scope="col" className="text-right font-medium pb-2">Each</th>
              <th scope="col" className="text-right font-medium pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {trends.frequent.map((item) => (
              <tr key={item.title} className="border-t border-[#eee6d8]">
                <td className="py-2 pr-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <CategoryBadge
                      category={getCategoryById(categories, item.categoryId)}
                      className="grid place-items-center shrink-0 w-6 h-6 rounded-lg [&_svg]:w-3 [&_svg]:h-3"
                    />
                    <span className="truncate font-semibold text-[#244336]">{item.title}</span>
                  </span>
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-[#52675a]">{item.count}×</td>
                <td className="py-2 text-right font-mono tabular-nums text-[#52675a]">{formatCurrency(item.average)}</td>
                <td className="py-2 text-right font-mono tabular-nums font-semibold text-[#154734]">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="m-0 py-8 text-center text-[#5c6861] text-xs">
          Nothing repeated yet. Items you log more than once show up here.
        </p>
      )}
    </section>
  );
}

function LargestExpenses({
  trends,
  categories,
  stale,
  onSelect,
}: {
  trends: Trends;
  categories: Category[];
  stale?: boolean;
  onSelect: (expense: Expense) => void;
}) {
  if (!trends.largest.length) return null;
  const max = trends.largest[0].amount;

  return (
    <section className={`${panelClass} p-5 transition-opacity ${stale ? "opacity-50" : ""}`}>
      <h3 className="m-0 font-serif text-lg font-bold text-[#315542] tracking-tight">Largest expenses</h3>
      <p className="mt-0.5 mb-3 text-[#5e6861] text-xs">The big-ticket items in this period. Click one to edit it.</p>
      <ol className="m-0 p-0 list-none grid gap-1">
        {trends.largest.map((expense) => {
          const category = getCategoryById(categories, expense.categoryId);
          return (
            <li key={expense.id}>
              <button
                className="w-full grid grid-cols-[28px_minmax(0,1fr)_auto] sm:grid-cols-[28px_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-3 px-2 py-2 rounded-xl text-left hover:bg-[#f6f0e5]"
                onClick={() => onSelect(expense)}
              >
                <CategoryBadge
                  category={category}
                  className="grid place-items-center w-7 h-7 rounded-lg [&_svg]:w-3.5 [&_svg]:h-3.5"
                />
                <span className="min-w-0">
                  <strong className="block truncate text-xs text-[#244336]">{expense.title}</strong>
                  <span className="block font-mono text-[10px] text-[#5d6961]">
                    {category.name} · {formatShortDate(fromKey(expense.date))}
                  </span>
                </span>
                {/* Length bar relative to the largest; the amount is always printed beside it. */}
                <span className="hidden sm:block h-2 rounded-full bg-[#f0eadf]" aria-hidden="true">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(expense.amount / max) * 100}%`, backgroundColor: category.color }}
                  />
                </span>
                <span className="font-mono text-xs font-semibold text-[#154734] tabular-nums">
                  {formatCurrency(expense.amount)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LoadingBlock() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[92px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
