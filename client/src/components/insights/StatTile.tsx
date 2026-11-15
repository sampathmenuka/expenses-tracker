import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  /** Short context line under the value. */
  detail?: string;
  /** For spending, up is bad: "up" renders as a warning, "down" as good. */
  trend?: "up" | "down" | "flat" | "alert";
  trendText?: string;
}

const TREND = {
  up: { icon: ArrowUpRight, className: "text-[#a74830]" },
  down: { icon: ArrowDownRight, className: "text-[#3a7048]" },
  flat: { icon: Minus, className: "text-[#5a6a5f]" },
  alert: { icon: AlertTriangle, className: "text-[#a74830]" },
};

export function StatTile({ label, value, detail, trend, trendText }: StatTileProps) {
  const t = trend ? TREND[trend] : null;
  return (
    <div className="p-4 rounded-2xl border border-[#ded4c5] bg-[#fffdf8]/85 shadow-sm min-w-0">
      <span className="block text-[#5d6961] text-[11px] font-semibold">{label}</span>
      <strong className="block mt-1.5 text-[#154734] text-[17px] sm:text-[22px] font-semibold tracking-tight leading-tight break-words">
        {value}
      </strong>
      {t && trendText && (
        <span className={cn("flex items-center gap-1 mt-2 text-[10px] font-bold", t.className)}>
          <t.icon className="w-3 h-3 shrink-0" aria-hidden="true" />
          {trendText}
        </span>
      )}
      {detail && <span className="block mt-1.5 text-[#5f6962] text-[10px] leading-snug">{detail}</span>}
    </div>
  );
}
