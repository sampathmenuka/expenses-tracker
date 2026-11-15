import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/insights/ChartCard";
import { ChartLegend } from "@/components/insights/ChartLegend";
import { EmptyReport } from "@/components/reports/EmptyReport";
import { AXIS_TICK, DIVERGING } from "@/constants/chart";
import { getCategoryById } from "@/constants/categories";
import type { Pacing } from "@/types/api";
import type { Category } from "@/types/category";
import { compactNumber, formatCurrency } from "@/utils/format";

const MAX_ROWS = 8;

function signed(value: number): string {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${compactNumber(Math.abs(value))}`;
}

interface Row {
  name: string;
  delta: number;
  thisMonth: number;
  lastMonthToDate: number;
}

function ChangeTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="p-2.5 rounded-lg border border-[#dcd3c5] bg-[#fffdf8] shadow-lg shadow-black/5 text-[11px]">
      <strong className="block font-mono text-[#154734]">
        {row.delta >= 0 ? "+" : "−"}
        {formatCurrency(Math.abs(row.delta))}
      </strong>
      <span className="block text-[#5d6961]">{row.name}</span>
      <span className="block mt-1 font-mono text-[10px] text-[#5e6963]">
        {formatCurrency(row.lastMonthToDate)} → {formatCurrency(row.thisMonth)}
      </span>
    </div>
  );
}

/** Diverging bars: how much more (red) or less (blue) each category cost than last month. */
export function CategoryChangeChart({ pacing, categories }: { pacing: Pacing; categories: Category[] }) {
  const all: Row[] = pacing.byCategory
    .map((c) => ({
      name: getCategoryById(categories, c.categoryId).name,
      delta: c.thisMonth - c.lastMonthToDate,
      thisMonth: c.thisMonth,
      lastMonthToDate: c.lastMonthToDate,
    }))
    .filter((r) => r.delta !== 0)
    .sort((a, b) => b.delta - a.delta);

  // Keep the largest movements; the table view still lists every category.
  const shown = [...all]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, MAX_ROWS)
    .sort((a, b) => b.delta - a.delta);

  // Symmetric domain keeps zero centred and leaves room for the tip labels on both sides.
  const extent = Math.max(...shown.map((r) => Math.abs(r.delta)), 1) * 1.3;

  return (
    <ChartCard
      title="What changed"
      subtitle={`Each category so far, against the same ${pacing.daysElapsed} days last month.`}
      legend={
        shown.length ? (
          <ChartLegend
            items={[
              { label: "Spent more", color: DIVERGING.more },
              { label: "Spent less", color: DIVERGING.less },
            ]}
          />
        ) : undefined
      }
      table={{
        columns: ["Category", `Last month, days 1–${pacing.daysElapsed}`, "This month", "Change"],
        numeric: [1, 2, 3],
        rows: all.map((r) => [
          r.name,
          formatCurrency(r.lastMonthToDate),
          formatCurrency(r.thisMonth),
          `${r.delta >= 0 ? "+" : "−"}${formatCurrency(Math.abs(r.delta))}`,
        ]),
      }}
    >
      {shown.length ? (
        <div style={{ height: Math.max(shown.length * 34 + 16, 120) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shown} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <XAxis type="number" hide domain={[-extent, extent]} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ ...AXIS_TICK, fill: "#52675a", fontFamily: "Poppins", fontSize: 11 }}
                width={96}
              />
              <ReferenceLine x={0} stroke="#cfc6b6" />
              <Tooltip cursor={{ fill: "#f3eee4" }} content={<ChangeTooltip />} />
              <Bar dataKey="delta" barSize={14} isAnimationActive={false}>
                {shown.map((row) => (
                  <Cell
                    key={row.name}
                    fill={row.delta > 0 ? DIVERGING.more : DIVERGING.less}
                    // @ts-expect-error recharts forwards radius to the bar shape
                    radius={row.delta > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]}
                  />
                ))}
                <LabelList
                  dataKey="delta"
                  position="right"
                  content={(props) => {
                    const { x = 0, y = 0, width = 0, height = 0, value } = props as {
                      x?: number; y?: number; width?: number; height?: number; value?: number;
                    };
                    const v = Number(value);
                    // Put the label beyond the bar's tip, on whichever side it grows.
                    const left = Math.min(Number(x), Number(x) + Number(width));
                    const right = Math.max(Number(x), Number(x) + Number(width));
                    const tip = v >= 0 ? right + 6 : left - 6;
                    return (
                      <text
                        x={tip}
                        y={Number(y) + Number(height) / 2}
                        dy={3.5}
                        textAnchor={v >= 0 ? "start" : "end"}
                        fill="#315542"
                        fontSize={10}
                        fontFamily="IBM Plex Mono"
                      >
                        {signed(v)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyReport text="No change to compare yet. Log expenses across two months to see movement." />
      )}
    </ChartCard>
  );
}
