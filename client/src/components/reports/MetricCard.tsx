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
      <span className="block text-[#7e8d83] text-[9px] font-mono uppercase tracking-wider">
        {label}
      </span>
      <strong className="block mt-2 text-[#154734] font-serif text-2xl font-bold tracking-tight leading-none">
        {value}
      </strong>
      <span
        className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold ${
          direction === "up"
            ? "text-[#b36047]"
            : direction === "down"
            ? "text-[#5b8768]"
            : "text-[#6d8073]"
        }`}
      >
        <TrendIcon className="w-3 h-3" /> {trend}
      </span>
    </div>
  );
}
