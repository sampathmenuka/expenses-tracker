import { formatCurrency } from "@/utils/format";

interface Entry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  stroke?: string;
  fill?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface SeriesTooltipProps {
  active?: boolean;
  payload?: Entry[];
  label?: string | number;
  /** Optional heading derived from the hovered row (e.g. a full date). */
  title?: (payload: Record<string, unknown>) => string;
  /** Hides series whose value is zero (useful for stacked bars). */
  hideZero?: boolean;
  footer?: (payload: Record<string, unknown>) => string | null;
}

/** One tooltip for every series at the hovered position: value first, then series. */
export function SeriesTooltip({ active, payload, label, title, hideZero, footer }: SeriesTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload ?? {};
  const entries = payload.filter((e) => e.value != null && !(hideZero && Number(e.value) === 0));
  const foot = footer?.(row);

  return (
    <div className="min-w-[150px] p-2.5 rounded-lg border border-[#dcd3c5] bg-[#fffdf8] shadow-lg shadow-black/5 text-[11px]">
      <div className="mb-1.5 font-mono text-[10px] text-[#5e6963]">{title ? title(row) : label}</div>
      <ul className="m-0 p-0 list-none grid gap-1">
        {[...entries].reverse().map((entry) => (
          <li key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2">
            <span
              className="w-3 h-[2px] rounded-full shrink-0"
              style={{ backgroundColor: entry.stroke && entry.stroke !== "none" ? entry.stroke : entry.color ?? entry.fill }}
            />
            <strong className="font-mono text-[#154734] tabular-nums">
              {formatCurrency(Number(entry.value))}
            </strong>
            <span className="text-[#5d6961] truncate">{entry.name}</span>
          </li>
        ))}
      </ul>
      {foot && <div className="mt-1.5 pt-1.5 border-t border-[#eee6d8] text-[#52675a]">{foot}</div>}
    </div>
  );
}
