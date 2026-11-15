import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/common/Skeleton";
import { eyebrowClass, heroClass, iconButton, panelClass } from "@/components/common/styles";
import { ChartTooltip } from "@/components/reports/ChartTooltip";
import { EmptyReport } from "@/components/reports/EmptyReport";
import { MetricCard } from "@/components/reports/MetricCard";
import { useCategories } from "@/hooks/useCategories";
import { useReport } from "@/hooks/useReports";
import type { ReportPeriod } from "@/types/navigation";
import {
  dateKey,
  formatMonthYear,
  formatShortDate,
  fromKey,
  getPeriodRange,
  shiftPeriod,
  shortDay,
} from "@/utils/date";
import { compactNumber, formatCurrency, joinCategoryTotals } from "@/utils/format";

export function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [offset, setOffset] = useState(0);
  const { categories } = useCategories();

  const todayKey = dateKey(new Date());
  const { current: range } = useMemo(
    () => getPeriodRange(period, shiftPeriod(period, new Date(), offset)),
    [period, offset]
  );
  const { data: report, isLoading } = useReport(range.startKey, range.endKey);

  const total = report?.total ?? 0;
  const previousTotal = report?.previousTotal ?? 0;
  const percentChange = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0;
  const hasData = total > 0;
  const isCurrent = offset === 0;

  // In the running period, average over the days that have actually happened.
  const totalDays = report?.daily.length ?? 1;
  const elapsedDays = isCurrent
    ? (report?.daily.filter((d) => d.date <= todayKey).length ?? 1)
    : totalDays;
  const averageSpend = total / Math.max(elapsedDays, 1);

  const breakdown = useMemo(
    () => joinCategoryTotals(categories, report?.byCategory ?? []),
    [categories, report]
  );
  const highest = breakdown[0];

  const chartSeries = useMemo(
    () =>
      (report?.daily ?? []).map((point) => {
        const date = fromKey(point.date);
        return {
          label: period === "weekly" ? shortDay(date) : String(date.getDate()),
          amount: point.amount,
        };
      }),
    [report, period]
  );

  const periodNoun = period === "weekly" ? "week" : "month";
  const periodTitle =
    period === "weekly"
      ? offset === 0
        ? "This week"
        : offset === -1
          ? "Last week"
          : `Week of ${formatShortDate(range.start)}`
      : formatMonthYear(range.start);
  const rangeText = `${formatShortDate(range.start)} — ${formatShortDate(range.end)}`;
  const changeText = previousTotal
    ? `${Math.abs(percentChange).toFixed(0)}% ${percentChange > 0 ? "more" : "less"} than the prior ${periodNoun}`
    : hasData
      ? `Nothing recorded the prior ${periodNoun}`
      : "No expenses yet";

  const switchPeriod = (next: ReportPeriod) => {
    setPeriod(next);
    setOffset(0);
  };

  return (
    <>
      <PageHeader eyebrow={`Spending reports · ${rangeText}`} title={periodTitle}>
        <div className="flex items-center gap-2 self-start">
          <button
            className={iconButton}
            onClick={() => setOffset((o) => o - 1)}
            aria-label={`Previous ${periodNoun}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="px-3 h-8 rounded-xl text-[11px] font-bold text-[#154734] border border-[#ded4c5] bg-[#fffdf8] disabled:opacity-40"
            onClick={() => setOffset(0)}
            disabled={isCurrent}
          >
            Current
          </button>
          <button
            className={`${iconButton} disabled:opacity-40 disabled:pointer-events-none`}
            onClick={() => setOffset((o) => o + 1)}
            disabled={isCurrent}
            aria-label={`Next ${periodNoun}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </PageHeader>

      <section className={heroClass}>
        <span className={eyebrowClass}>Report reading</span>
        <h2 className="mt-2 mb-1.5 font-serif text-2xl sm:text-[28px] font-bold text-[#154734] tracking-tight leading-tight">
          See the rhythm, then choose the next move.
        </h2>
        <p className="m-0 max-w-md text-[#4f6858] text-xs sm:text-[13px] leading-relaxed font-medium">
          Switch between weeks and months, and step back in time to compare.
        </p>
        <div
          className="inline-flex mt-5 p-1 gap-1 rounded-xl bg-[#fffdf8]/80 border border-[#154734]/15 shadow-xs"
          role="tablist"
        >
          {(["weekly", "monthly"] as const).map((option) => (
            <button
              key={option}
              role="tab"
              aria-selected={period === option}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all active:scale-95 ${
                period === option
                  ? "bg-[#154734] text-[#fffaf0] shadow-sm"
                  : "bg-transparent text-[#526c5b] hover:text-[#154734]"
              }`}
              onClick={() => switchPeriod(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-[92px] rounded-2xl" />)
        ) : (
          <>
            <MetricCard
              label="Total spent"
              value={formatCurrency(total)}
              trend={changeText}
              direction={previousTotal ? (percentChange > 0 ? "up" : "down") : "neutral"}
            />
            <MetricCard
              label="Daily average"
              value={formatCurrency(averageSpend)}
              trend={`Across ${elapsedDays} day${elapsedDays === 1 ? "" : "s"} · ${report?.count ?? 0} entries`}
              direction="neutral"
            />
            <MetricCard
              label="Highest category"
              value={highest?.name ?? "—"}
              trend={
                highest
                  ? `${formatCurrency(highest.amount)} · ${Math.round((highest.amount / total) * 100)}% of spend`
                  : "No entries yet"
              }
              direction="neutral"
            />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-4">
        <div className={`${panelClass} p-5`}>
          <h3 className="m-0 font-serif text-lg sm:text-xl font-bold text-[#315542] tracking-tight">
            Daily rhythm
          </h3>
          <p className="mt-1 mb-0 text-[#5e6861] text-xs">How expenses gathered over the period.</p>
          {isLoading ? (
            <Skeleton className="h-56 mt-3" />
          ) : hasData ? (
            <div className="h-56 mt-3 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSeries} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#5e6962", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                    dy={6}
                    interval={period === "monthly" ? 2 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#5e6962", fontSize: 9, fontFamily: "IBM Plex Mono" }}
                    tickFormatter={compactNumber}
                  />
                  <RechartsTooltip cursor={{ fill: "#f0eadf" }} content={<ChartTooltip />} />
                  <Bar dataKey="amount" radius={[6, 6, 2, 2]} fill="#154734" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyReport text={`No expenses recorded this ${periodNoun}.`} />
          )}
        </div>

        <div className={`${panelClass} p-5 flex flex-col`}>
          <h3 className="m-0 font-serif text-lg sm:text-xl font-bold text-[#315542] tracking-tight">
            Category share
          </h3>
          <p className="mt-1 mb-0 text-[#5e6861] text-xs">Where your money went by proportion.</p>
          {isLoading ? (
            <Skeleton className="h-44 mt-3" />
          ) : hasData && breakdown.length ? (
            <>
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {breakdown.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-[#eee7dc] mt-2">
                {breakdown.map((item) => (
                  <div className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-2.5 py-2" key={item.id}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <strong className="text-[#45614f] text-xs font-semibold truncate">{item.name}</strong>
                    <span className="text-[#5f6962] font-mono text-[10px]">
                      {Math.round((item.amount / total) * 100)}%
                    </span>
                    <span className="text-[#315542] font-mono text-[11px] font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyReport text="No categories to display for this period." />
          )}
        </div>
      </section>
    </>
  );
}
