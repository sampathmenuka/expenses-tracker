import { useEffect, useMemo, useRef, useState } from "react";
import { ChartCard } from "@/components/insights/ChartCard";
import { EMPTY_CELL, SEQUENTIAL } from "@/constants/chart";
import type { Trends } from "@/types/api";
import { dateKey, formatFullDate, fromKey, shiftDays, startOfWeek } from "@/utils/date";
import { compactNumber, formatCurrency } from "@/utils/format";

const GAP = 3;
const LABEL_COLUMN = 34; // weekday labels + gap
const MIN_CELL = 11;
const MAX_CELL = 22;
const ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

/** Quantile thresholds, so a single big purchase doesn't wash out every other day. */
function thresholds(values: number[], steps: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  return Array.from({ length: steps - 1 }, (_, i) => sorted[Math.floor(((i + 1) / steps) * sorted.length)] ?? Infinity);
}

interface Hover {
  key: string;
  amount: number;
  x: number;
  y: number;
}

export function SpendingHeatmap({ trends, stale }: { trends: Trends; stale?: boolean }) {
  const [hover, setHover] = useState<Hover | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);

  // Size cells to fill the card; below the minimum the calendar scrolls instead.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { weeks, cuts, months, byDay } = useMemo(() => {
    const byDay = new Map(trends.daily.map((d) => [d.date, d.amount]));
    const cuts = thresholds(trends.daily.map((d) => d.amount), SEQUENTIAL.length);
    const first = startOfWeek(fromKey(trends.start));
    const last = fromKey(trends.end);

    const weeks: (string | null)[][] = [];
    const months: { label: string; column: number }[] = [];
    for (let cursor = first, col = 0; cursor <= last; cursor = shiftDays(cursor, 7), col++) {
      const week = Array.from({ length: 7 }, (_, d) => {
        const day = shiftDays(cursor, d);
        const key = dateKey(day);
        return key < trends.start || day > last ? null : key;
      });
      // Label a month above the first column that contains its 1st day.
      const firstOfMonth = week.find((k) => k?.endsWith("-01"));
      if (firstOfMonth || col === 0) {
        const anchor = firstOfMonth ?? trends.start;
        months.push({
          label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(fromKey(anchor)),
          column: col,
        });
      }
      weeks.push(week);
    }
    return { weeks, cuts, months, byDay };
  }, [trends]);

  const colorFor = (amount: number) => {
    if (!amount) return EMPTY_CELL;
    const step = cuts.findIndex((cut) => amount <= cut);
    return SEQUENTIAL[step === -1 ? SEQUENTIAL.length - 1 : step];
  };

  const CELL = Math.max(
    MIN_CELL,
    Math.min(MAX_CELL, Math.floor((frameWidth - LABEL_COLUMN) / weeks.length) - GAP)
  );
  const width = weeks.length * (CELL + GAP);
  const spendingDays = trends.stats.spendingDays;

  return (
    <ChartCard
      title="Daily spending calendar"
      subtitle={`Darker days cost more. You spent on ${spendingDays} of ${trends.stats.days} days.`}
      stale={stale}
      table={{
        columns: ["Date", "Spent"],
        numeric: [1],
        rows: [...trends.daily].reverse().map((d) => [formatFullDate(fromKey(d.date)), formatCurrency(d.amount)]),
      }}
    >
      <div className="relative" ref={frameRef}>
        <div className="overflow-x-auto pb-1 rounded-lg focus-visible:outline-2 focus-visible:outline-[#154734]" tabIndex={0} role="img" aria-label={`Calendar of daily spending: ${spendingDays} spending days. Use the table view for exact amounts.`}>
          <div className="inline-grid grid-cols-[28px_auto] gap-x-1.5">
            <span />
            <div className="relative h-4" style={{ width }}>
              {months.map((m) => (
                <span
                  key={`${m.label}-${m.column}`}
                  className="absolute top-0 font-mono text-[9px] text-[#5e6962]"
                  style={{ left: m.column * (CELL + GAP) }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="grid font-mono text-[9px] text-[#5e6962]" style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}>
              {ROW_LABELS.map((label, i) => (
                <span key={i} style={{ lineHeight: `${CELL}px` }}>{label}</span>
              ))}
            </div>

            <div
              className="grid grid-flow-col"
              style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoColumns: `${CELL}px`, gap: GAP }}
              onPointerLeave={() => setHover(null)}
            >
              {weeks.flatMap((week, col) =>
                week.map((key, row) =>
                  key ? (
                    <span
                      key={key}
                      className="rounded-[3px] transition-[outline] hover:outline hover:outline-2 hover:outline-[#154734]/60"
                      style={{ backgroundColor: colorFor(byDay.get(key) ?? 0) }}
                      onPointerEnter={() =>
                        setHover({ key, amount: byDay.get(key) ?? 0, x: col * (CELL + GAP), y: row * (CELL + GAP) })
                      }
                    />
                  ) : (
                    <span key={`blank-${col}-${row}`} />
                  )
                )
              )}
            </div>
          </div>
        </div>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 p-2 rounded-lg border border-[#dcd3c5] bg-[#fffdf8] shadow-lg shadow-black/5 text-[11px] whitespace-nowrap -translate-x-1/2"
            style={{
              left: Math.min(Math.max(hover.x + LABEL_COLUMN + CELL / 2, 70), LABEL_COLUMN + width - 70),
              top: hover.y + 16 + CELL + 8,
            }}
          >
            <strong className="block font-mono text-[#154734]">
              {hover.amount ? formatCurrency(hover.amount) : "No spending"}
            </strong>
            <span className="text-[#5d6961]">{formatFullDate(fromKey(hover.key))}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 font-mono text-[9px] text-[#5e6962]">
          <span className="flex items-center gap-1">
            <span className="w-[11px] h-[11px] rounded-[3px]" style={{ backgroundColor: EMPTY_CELL }} /> None
          </span>
          <span className="flex items-center gap-1">
            Less
            {SEQUENTIAL.map((c) => (
              <span key={c} className="w-[11px] h-[11px] rounded-[3px]" style={{ backgroundColor: c }} />
            ))}
            More
          </span>
          {cuts.length > 0 && Number.isFinite(cuts[cuts.length - 1]) && (
            <span>· darkest above {compactNumber(cuts[cuts.length - 1])} a day</span>
          )}
        </div>
      </div>
    </ChartCard>
  );
}
