import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/insights/ChartCard";
import { ChartLegend } from "@/components/insights/ChartLegend";
import { SeriesTooltip } from "@/components/insights/SeriesTooltip";
import { ACCENT, AXIS_TICK, CHART_SURFACE, GRID_COLOR, MUTED_SERIES } from "@/constants/chart";
import type { Pacing } from "@/types/api";
import { compactNumber, formatCurrency } from "@/utils/format";
import { typicalDailySpend } from "@/utils/projection";

function cumulative(values: number[]): number[] {
  let running = 0;
  return values.map((v) => (running += v));
}

export function PacingChart({ pacing }: { pacing: Pacing }) {
  const thisCum = cumulative(pacing.thisMonthDaily);
  const lastCum = cumulative(pacing.lastMonthDaily);
  const typicalDay = typicalDailySpend(pacing);
  const length = Math.max(pacing.daysInMonth, pacing.lastMonthDaily.length);
  const hasProjection = pacing.daysElapsed < pacing.daysInMonth && pacing.thisMonthTotal > 0;

  const data = Array.from({ length }, (_, i) => {
    const day = i + 1;
    return {
      day,
      thisMonth: day <= pacing.daysElapsed ? thisCum[i] : undefined,
      lastMonth: day <= pacing.lastMonthDaily.length ? lastCum[i] : undefined,
      // Starts at today's point so the dashed line continues the solid one.
      projected:
        hasProjection && day >= pacing.daysElapsed && day <= pacing.daysInMonth
          ? pacing.thisMonthTotal + typicalDay * (day - pacing.daysElapsed)
          : undefined,
    };
  });

  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(
    new Date(`${pacing.monthStart}T12:00:00`)
  );

  return (
    <ChartCard
      title="Spending pace"
      subtitle={`Running total through ${monthName}, against last month. The projection adds a typical day (${compactNumber(typicalDay)}) for each day left.`}
      legend={
        <ChartLegend
          items={[
            { label: "This month", color: ACCENT, kind: "line" },
            ...(hasProjection ? [{ label: "Projected", color: ACCENT, kind: "dashed" as const }] : []),
            { label: "Last month", color: MUTED_SERIES, kind: "line" },
            ...(pacing.monthlyBudget ? [{ label: "Budget", color: "#7a6a55", kind: "dashed" as const }] : []),
          ]}
        />
      }
      table={{
        columns: ["Day", "This month", "Last month"],
        numeric: [1, 2],
        rows: data
          .filter((r) => r.thisMonth !== undefined || r.lastMonth !== undefined)
          .map((r) => [
            r.day,
            r.thisMonth !== undefined ? formatCurrency(r.thisMonth) : "—",
            r.lastMonth !== undefined ? formatCurrency(r.lastMonth) : "—",
          ]),
      }}
    >
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              ticks={[1, 5, 10, 15, 20, 25, length]}
              dy={6}
            />
            <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} tickFormatter={compactNumber} width={48} />
            {pacing.monthlyBudget ? (
              <ReferenceLine
                y={pacing.monthlyBudget}
                stroke="#7a6a55"
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
                label={{ value: "Budget", position: "insideTopLeft", fill: "#7a6a55", fontSize: 10 }}
              />
            ) : null}
            <Tooltip
              cursor={{ stroke: "#cfc6b6", strokeWidth: 1 }}
              content={<SeriesTooltip title={(row) => `Day ${row.day}`} />}
            />
            <Line
              name="Last month"
              dataKey="lastMonth"
              stroke={MUTED_SERIES}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: CHART_SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              name="Projected"
              dataKey="projected"
              stroke={ACCENT}
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              name="This month"
              dataKey="thisMonth"
              stroke={ACCENT}
              strokeWidth={2}
              strokeLinecap="round"
              dot={(props: { cx?: number; cy?: number; index?: number }) =>
                props.index === pacing.daysElapsed - 1 && props.cx != null && props.cy != null ? (
                  <circle
                    key="today"
                    cx={props.cx}
                    cy={props.cy}
                    r={4.5}
                    fill={ACCENT}
                    stroke={CHART_SURFACE}
                    strokeWidth={2}
                  />
                ) : (
                  <g key={props.index} />
                )
              }
              activeDot={{ r: 4, stroke: CHART_SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
