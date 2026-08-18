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
import type { Category } from "@/types/category";
import type { ReportPeriod } from "@/types/navigation";
import { formatShortDate } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

interface CategoryBreakdownItem extends Category {
  amount: number;
}

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
      <header className="page-heading">
        <div>
          <span className="eyebrow">Spending reports · {rangeText}</span>
          <h1>{periodTitle}</h1>
        </div>
        <div className="heading-utility">
          <Receipt /> Your money, seen clearly
        </div>
      </header>

      <section className="report-top">
        <span className="eyebrow">Report reading</span>
        <h2>See the week, then choose the next move.</h2>
        <p>
          Switch between the week and month to spot where your money has been
          going.
        </p>
        <div className="report-segmented">
          <button
            className={`segment ${period === "weekly" ? "active" : ""}`}
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </button>
          <button
            className={`segment ${period === "monthly" ? "active" : ""}`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
        </div>
      </section>

      <section className="report-metrics">
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

      <section className="reports-grid">
        <div className="report-panel">
          <h3>Daily rhythm</h3>
          <p className="panel-subtitle">How expenses gathered over the period.</p>
          {hasData ? (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartSeries}
                  margin={{ top: 12, right: 4, left: -18, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#7d8a82",
                      fontSize: 10,
                      fontFamily: "IBM Plex Mono",
                    }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#7d8a82",
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
            <EmptyReport text="Your daily pattern will appear after you record an expense." />
          )}
        </div>

        <div className="report-panel">
          <h3>By category</h3>
          <p className="panel-subtitle">Your most-used expense types.</p>
          {hasData ? (
            <>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((item) => (
                        <Cell key={item.id} fill={item.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="breakdown-list">
                {categoryBreakdown.slice(0, 4).map((item) => (
                  <div className="breakdown-row" key={item.id}>
                    <i
                      className="breakdown-dot"
                      style={{ background: item.color }}
                    />
                    <strong>{item.name}</strong>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyReport text="Your category breakdown will appear here." />
          )}
        </div>
      </section>
    </>
  );
}
