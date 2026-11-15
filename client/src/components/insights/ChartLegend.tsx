export interface LegendItem {
  label: string;
  color: string;
  /** Legends mirror the mark: a swatch for bars/areas, a stroke for lines. */
  kind?: "rect" | "line" | "dashed";
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 m-0 p-0 list-none">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-[#52675a]">
          {item.kind === "line" || item.kind === "dashed" ? (
            <svg width="16" height="8" aria-hidden="true">
              <line
                x1="1"
                y1="4"
                x2="15"
                y2="4"
                stroke={item.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={item.kind === "dashed" ? "3 3" : undefined}
              />
            </svg>
          ) : (
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
