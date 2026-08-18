import {
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  trend: string;
  direction: "up" | "down" | "neutral";
}

export function MetricCard({
  label,
  value,
  trend,
  direction,
}: MetricCardProps) {
  const TrendIcon: LucideIcon =
    direction === "up"
      ? TrendingUp
      : direction === "down"
      ? TrendingDown
      : CircleDollarSign;

  return (
    <div className="p-4 rounded-2xl border border-[#ded4c5] bg-[#fffdf8]/85 shadow-sm">
      <span className="block text-[#3c5043] text-[9px] font-mono font-semibold uppercase tracking-wider">
        {label}
      </span>
      <strong className="block mt-2 text-[#154734] font-serif text-2xl font-bold tracking-tight leading-none">
        {value}
      </strong>
      <span
        className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold ${
          direction === "up"
            ? "text-[#a04229]"
            : direction === "down"
            ? "text-[#2e6b3e]"
            : "text-[#3c5043]"
        }`}
      >
        <TrendIcon className="w-3 h-3" /> {trend}
      </span>
    </div>
  );
}
