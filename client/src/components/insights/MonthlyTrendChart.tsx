import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/insights/ChartCard";
import { ChartLegend } from "@/components/insights/ChartLegend";
import { SeriesTooltip } from "@/components/insights/SeriesTooltip";
import { EmptyReport } from "@/components/reports/EmptyReport";
import { AXIS_TICK, CHART_SURFACE, GRID_COLOR, MUTED_SERIES } from "@/constants/chart";
import type { Trends } from "@/types/api";
import type { Category } from "@/types/category";
import { compactNumber, formatCurrency } from "@/utils/format";

/** Past this many categories the tail folds into one grey series. */
const MAX_SERIES = 6;
const REST_KEY = "rest";

function monthLabel(key: string, long = false): string {
  return new Intl.DateTimeFormat(undefined, long ? { month: "long", year: "numeric" } : { month: "short" }).format(
    new Date(`${key}-01T12:00:00`)
  );
}

interface Series {
  key: string;
  name: string;
  color: string;
}

export function MonthlyTrendChart({
  trends,
  categories,
  stale,
}: {
  trends: Trends;
  categories: Category[];
  stale?: boolean;
}) {
  // Rank categories by total over the range; keep the leaders, fold the rest.
  const totals = new Map<string, number>();
  for (const month of trends.monthly) {
    for (const c of month.byCategory) totals.set(c.categoryId, (totals.get(c.categoryId) ?? 0) + c.amount);
  }
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const kept = new Set(ranked.slice(0, ranked.length > MAX_SERIES ? MAX_SERIES - 1 : MAX_SERIES));
  const folded = ranked.length > kept.size;

  // Stack in the user's category order so colours stay in their validated sequence.
  const series: Series[] = categories
    .filter((c) => kept.has(c.id))
    .map((c) => ({ key: c.id, name: c.name, color: c.color }));
  if (folded) series.push({ key: REST_KEY, name: "Everything else", color: MUTED_SERIES });

  const data = trends.monthly.map((month) => {
    const row: Record<string, string | number> = {
      month: month.month,
      label: monthLabel(month.month),
      total: month.total,
    };
    for (const s of series) row[s.key] = 0;
    for (const c of month.byCategory) {
      const key = kept.has(c.categoryId) ? c.categoryId : REST_KEY;
      row[key] = Number(row[key] ?? 0) + c.amount;
    }
    // The highest non-empty segment gets the rounded data-end.
    row.top = [...series].reverse().find((s) => Number(row[s.key]) > 0)?.key ?? "";
    return row;
  });

  const average = trends.stats.averagePerMonth;
  const hasData = trends.stats.total > 0;

  return (
    <ChartCard
      title="Month by month"
      subtitle="Where each month's money went. The line marks your monthly average."
      stale={stale}
      legend={hasData ? <ChartLegend items={series.map((s) => ({ label: s.name, color: s.color }))} /> : undefined}
      table={{
        columns: ["Month", ...series.map((s) => s.name), "Total"],
        numeric: series.map((_, i) => i + 1).concat(series.length + 1),
        rows: data.map((row) => [
          monthLabel(String(row.month), true),
          ...series.map((s) => formatCurrency(Number(row[s.key]))),
          formatCurrency(Number(row.total)),
        ]),
      }}
    >
      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} tickFormatter={compactNumber} width={48} />
              <Tooltip
                cursor={{ fill: "#f3eee4" }}
                content={
                  <SeriesTooltip
                    hideZero
                    title={(row) => monthLabel(String(row.month), true)}
                    footer={(row) => `Total ${formatCurrency(Number(row.total))}`}
                  />
                }
              />
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stackId="month"
                  fill={s.color}
                  stroke={CHART_SURFACE}
                  strokeWidth={2}
                  maxBarSize={36}
                  isAnimationActive={false}
                  shape={(props: unknown) => {
                    const p = props as React.ComponentProps<typeof Rectangle> & { payload: { top: string } };
                    return <Rectangle {...p} radius={p.payload.top === s.key ? [4, 4, 0, 0] : 0} />;
                  }}
                />
              ))}
              {average > 0 && (
                <ReferenceLine
                  y={average}
                  stroke="#526c5b"
                  strokeDasharray="4 4"
                  label={{
                    value: `avg ${compactNumber(average)}`,
                    position: "insideTopRight",
                    fill: "#526c5b",
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyReport text="No expenses in this range yet." />
      )}
    </ChartCard>
  );
}
