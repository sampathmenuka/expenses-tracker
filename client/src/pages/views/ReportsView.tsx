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
import { Receipt } from "lucide-react";
import { ChartTooltip } from "@/components/reports/ChartTooltip";
import { EmptyReport } from "@/components/reports/EmptyReport";
import { MetricCard } from "@/components/reports/MetricCard";
import type { ReportPeriod } from "@/types/navigation";
import { formatShortDate } from "@/utils/date";
import { formatCurrency, type CategoryBreakdownItem } from "@/utils/format";

interface ReportsViewProps {
  period: ReportPeriod;
  setPeriod: (period: ReportPeriod) => void;
  periodTotal: number;
  previousTotal: number;
  percentChange: number;
  averageSpend: number;
  highestCategory: CategoryBreakdownItem | undefined;
  categoryBreakdown: CategoryBreakdownItem[];
  chartSeries: { label: string; amount: number }[];
  periodStart: Date;
  periodEnd: Date;
}

export function ReportsView({
  period,
  setPeriod,
  periodTotal,
  previousTotal,
  percentChange,
  averageSpend,
  highestCategory,
  categoryBreakdown,
  chartSeries,
  periodStart,
  periodEnd,
}: ReportsViewProps) {
  const hasData = periodTotal > 0;
  const periodTitle =
    period === "weekly"
      ? "This week"
      : new Intl.DateTimeFormat(undefined, { month: "long" }).format(
          periodStart
        );
  const rangeText = `${formatShortDate(periodStart)} — ${formatShortDate(periodEnd)}`;
  const changeText = previousTotal
    ? `${Math.abs(percentChange).toFixed(0)}% ${percentChange > 0 ? "more" : "less"} than the prior ${period === "weekly" ? "week" : "month"}`
    : hasData
    ? "First recorded period"
    : "No expenses yet";

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[#3c5043] text-[9px] font-mono font-semibold uppercase tracking-wider">
            Spending reports · {rangeText}
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#154734] leading-tight tracking-tight">
            {periodTitle}
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[#3c5043] text-xs font-bold pt-1">
          <Receipt className="w-4 h-4 text-[#154734]" />
          <span>Your money, seen clearly</span>
        </div>
      </header>

      {/* Period Selector Card */}
      <section className="relative overflow-hidden p-6 sm:p-7 mb-7 rounded-3xl border border-[#154734]/15 bg-gradient-to-br from-[#fffdf8]/95 via-[#f2ebde]/90 to-[#eae0cd]/85 shadow-lg shadow-black/5 animate-surface">
        <span className="text-[#3c5043] text-[9px] font-mono font-semibold uppercase tracking-wider">
          Report reading
        </span>
        <h2 className="mt-2 mb-1.5 font-serif text-2xl sm:text-[28px] font-bold text-[#154734] tracking-tight leading-tight">
          See the rhythm, then choose the next move.
        </h2>
        <p className="m-0 max-w-md text-[#234437] text-xs sm:text-[13px] leading-relaxed font-medium">
          Switch between the week and month to spot where your money has been
          going.
        </p>
        <div className="inline-flex mt-5 p-1 gap-1 rounded-xl bg-[#fffdf8]/80 border border-[#154734]/15 shadow-xs">
          <button
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              period === "weekly"
                ? "bg-[#154734] text-[#fffaf0] shadow-sm"
                : "bg-transparent text-[#2c3d31] hover:text-[#154734]"
            }`}
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              period === "monthly"
                ? "bg-[#154734] text-[#fffaf0] shadow-sm"
                : "bg-transparent text-[#2c3d31] hover:text-[#154734]"
            }`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <MetricCard
          label="Total spent"
          value={formatCurrency(periodTotal)}
          trend={changeText}
          direction={percentChange > 0 ? "up" : "down"}
        />
        <MetricCard
          label="Daily average"
          value={formatCurrency(averageSpend)}
          trend={
            period === "weekly" ? "Across 7 days" : "Across this month"
          }
          direction="neutral"
        />
        <MetricCard
          label="Highest category"
          value={highestCategory?.name ?? "—"}
          trend={
            highestCategory
              ? formatCurrency(highestCategory.amount)
              : "No entries yet"
          }
          direction="neutral"
        />
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-4">
        {/* Bar chart panel */}
        <div className="overflow-hidden rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 p-5 shadow-sm">
          <h3 className="m-0 font-serif text-lg sm:text-xl font-bold text-[#315542] tracking-tight">
            Daily rhythm
          </h3>
          <p className="mt-1 mb-0 text-[#3c5043] text-xs">
            How expenses gathered over the period.
          </p>
          {hasData ? (
            <div className="h-56 mt-3 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartSeries}
                  margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#3c5043",
                      fontSize: 10,
                      fontFamily: "IBM Plex Mono",
                    }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#3c5043",
                      fontSize: 9,
                      fontFamily: "IBM Plex Mono",
                    }}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
                    }
                  />
                  <RechartsTooltip
                    cursor={{ fill: "#f0eadf" }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[6, 6, 2, 2]}
                    fill="#154734"
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyReport text="No expenses recorded for this period yet." />
          )}
        </div>

        {/* Category breakdown panel */}
        <div className="overflow-hidden rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 p-5 shadow-sm flex flex-col">
          <h3 className="m-0 font-serif text-lg sm:text-xl font-bold text-[#315542] tracking-tight">
            Category share
          </h3>
          <p className="mt-1 mb-0 text-[#3c5043] text-xs">
            Where your money went by proportion.
          </p>
          {hasData && categoryBreakdown.length ? (
            <>
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-[#eee7dc] mt-2">
                {categoryBreakdown.map((item) => (
                  <div
                    className="grid grid-cols-[10px_1fr_auto] items-center gap-2.5 py-2"
                    key={item.id}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <strong className="text-[#18342a] text-xs font-semibold truncate">
                      {item.name}
                    </strong>
                    <span className="text-[#154734] font-mono text-[11px] font-semibold">
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
