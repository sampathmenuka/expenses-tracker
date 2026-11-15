import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

interface BudgetBarProps {
  spent: number;
  budget: number;
  tone?: "light" | "dark";
  className?: string;
}

/** Progress toward a monthly limit; turns amber near the limit and red past it. */
export function BudgetBar({ spent, budget, tone = "light", className }: BudgetBarProps) {
  const ratio = budget > 0 ? spent / budget : 0;
  const percent = Math.min(ratio * 100, 100);
  const status = ratio > 1 ? "over" : ratio >= 0.8 ? "near" : "ok";
  const fill =
    status === "over" ? "bg-[#c4553b]" : status === "near" ? "bg-[#d39a3a]" : "bg-[#4a6d54]";
  const remaining = budget - spent;

  return (
    <div className={className}>
      <div
        className={cn(
          "h-1.5 rounded-full overflow-hidden",
          tone === "dark" ? "bg-white/15" : "bg-[#eee6d8]"
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-label="Budget used"
      >
        <div className={cn("h-full rounded-full transition-all duration-500", fill)} style={{ width: `${percent}%` }} />
      </div>
      <div
        className={cn(
          "flex justify-between mt-1.5 font-mono text-[9px]",
          tone === "dark" ? "text-[#c6d2ca]" : "text-[#5f6861]"
        )}
      >
        <span>{Math.round(ratio * 100)}% of {formatCurrency(budget)}</span>
        <span className={cn(status === "over" && (tone === "dark" ? "text-[#f3b7a6]" : "text-[#a74830] font-semibold"))}>
          {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(-remaining)} over`}
        </span>
      </div>
    </div>
  );
}
