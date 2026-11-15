import { BudgetBar } from "@/components/common/BudgetBar";
import { useDashboard } from "@/hooks/useReports";
import { formatCurrency } from "@/utils/format";

export function MonthPocket() {
  const { data } = useDashboard();
  const monthTotal = data?.monthTotal ?? 0;

  return (
    <div className="relative overflow-hidden p-4 rounded-2xl text-[#f8f0e3] bg-[#1d4133] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      <div className="absolute w-[120px] h-[120px] border border-[#c9dac3]/25 rounded-full -right-11 -top-14 pointer-events-none" />
      <span className="relative block text-[#c9dac3] font-mono text-[9px] uppercase tracking-wider">
        This month
      </span>
      <strong className="relative block my-2 font-serif text-[26px] leading-tight tracking-tight">
        {formatCurrency(monthTotal)}
      </strong>
      {data?.monthlyBudget ? (
        <BudgetBar spent={monthTotal} budget={data.monthlyBudget} tone="dark" className="relative" />
      ) : (
        <p className="relative m-0 text-[#c6d2ca] text-[10px] leading-relaxed">
          {data?.monthCount ?? 0} recorded expenses
        </p>
      )}
    </div>
  );
}
