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
    <div className="metric-card">
      <span className="summary-label">{label}</span>
      <strong>{value}</strong>
      <span className={`metric-trend ${direction}`}>
        <TrendIcon /> {trend}
      </span>
    </div>
  );
}
