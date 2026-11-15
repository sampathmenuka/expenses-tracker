import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/insights/ChartCard";
import { EmptyReport } from "@/components/reports/EmptyReport";
import { ACCENT, AXIS_TICK, GRID_COLOR, MUTED_SERIES } from "@/constants/chart";
import type { Trends } from "@/types/api";
import { compactNumber, formatCurrency } from "@/utils/format";

// Monday-first, matching the API's weekday numbering.
const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(2026, 10, 9 + i))
);

interface Row {
  label: string;
  name: string;
  average: number;
  count: number;
  occurrences: number;
}

function WeekdayTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="p-2.5 rounded-lg border border-[#dcd3c5] bg-[#fffdf8] shadow-lg shadow-black/5 text-[11px]">
      <strong className="block font-mono text-[#154734]">{formatCurrency(row.average)}</strong>
      <span className="block text-[#5d6961]">average {row.name}</span>
      <span className="block mt-1 font-mono text-[10px] text-[#5e6963]">
        {row.count} expense{row.count === 1 ? "" : "s"} over {row.occurrences} {row.name}s
      </span>
    </div>
  );
}

/** Emphasis form: the most expensive weekday in the accent, the rest as context. */
export function WeekdayChart({ trends, stale }: { trends: Trends; stale?: boolean }) {
  const data: Row[] = trends.weekdays.map((w) => ({
    label: WEEKDAYS[w.weekday].slice(0, 3),
    name: WEEKDAYS[w.weekday],
    average: w.average,
    count: w.count,
    occurrences: w.occurrences,
  }));
  const peak = data.reduce((best, row) => (row.average > best.average ? row : best), data[0]);
  const hasData = trends.stats.total > 0;

  return (
    <ChartCard
      title="Your spending week"
      subtitle={hasData ? `Average per day. ${peak.name}s cost you the most.` : "Average spend per weekday."}
      stale={stale}
      table={{
        columns: ["Weekday", "Average", "Expenses"],
        numeric: [1, 2],
        rows: data.map((r) => [r.name, formatCurrency(r.average), r.count]),
      }}
    >
      {hasData ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 18, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} tickFormatter={compactNumber} width={44} />
              <Tooltip cursor={{ fill: "#f3eee4" }} content={<WeekdayTooltip />} />
              <Bar dataKey="average" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                {data.map((row) => (
                  <Cell key={row.label} fill={row === peak ? ACCENT : MUTED_SERIES} />
                ))}
                <LabelList
                  dataKey="average"
                  position="top"
                  content={(props) => {
                    const { x = 0, y = 0, width = 0, index } = props as {
                      x?: number; y?: number; width?: number; index?: number;
                    };
                    // Label only the peak; the axis and tooltip carry the rest.
                    if (index == null || data[index] !== peak) return null;
                    return (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 6}
                        textAnchor="middle"
                        fill="#154734"
                        fontSize={10}
                        fontWeight={600}
                        fontFamily="IBM Plex Mono"
                      >
                        {compactNumber(peak.average)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyReport text="No expenses in this range yet." />
      )}
    </ChartCard>
  );
}
