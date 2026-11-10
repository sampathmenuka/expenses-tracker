import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { panelClass } from "@/components/common/styles";
import { cn } from "@/lib/utils";

export interface TableView {
  columns: string[];
  rows: (string | number)[][];
  /** Columns (by index) to right-align - typically numbers. */
  numeric?: number[];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  table?: TableView;
  /** Dims the chart while a new range loads, instead of flashing a skeleton. */
  stale?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** A chart panel with a heading, legend, and a table view for every value. */
export function ChartCard({ title, subtitle, legend, table, stale, className, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className={cn(panelClass, "p-5 flex flex-col min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 font-serif text-lg font-bold text-[#315542] tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 mb-0 text-[#5e6861] text-xs">{subtitle}</p>}
        </div>
        {table && (
          <button
            className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-lg border border-[#ded4c5] bg-[#fffdf8] text-[#526c5b] text-[10px] font-bold hover:text-[#154734] hover:bg-[#f3eee4]"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
          >
            {showTable ? <BarChart3 className="w-3 h-3" /> : <Table2 className="w-3 h-3" />}
            {showTable ? "Chart" : "Table"}
          </button>
        )}
      </div>

      {legend && !showTable && <div className="mt-3">{legend}</div>}

      <div className={cn("mt-3 flex-1 transition-opacity duration-200", stale && "opacity-50")}>
        {showTable && table ? <DataTable {...table} /> : children}
      </div>
    </section>
  );
}

function DataTable({ columns, rows, numeric = [] }: TableView) {
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-[#eee6d8]">
      <table className="w-full border-collapse text-[11px]">
        <thead className="sticky top-0 bg-[#f0eadf]">
          <tr>
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={cn(
                  "px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-[#5e6963] font-medium",
                  numeric.includes(i) ? "text-right" : "text-left"
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-t border-[#eee6d8]">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={cn(
                    "px-3 py-1.5 text-[#315542]",
                    numeric.includes(i) && "text-right font-mono tabular-nums"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
