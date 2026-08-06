import { formatCurrency } from "@/utils/format";

interface MonthPocketProps {
  monthTotal: number;
  monthExpensesCount: number;
}

export function MonthPocket({
  monthTotal,
  monthExpensesCount,
}: MonthPocketProps) {
  return (
    <div className="month-pocket">
      <span className="mono-label">This month</span>
      <strong>{formatCurrency(monthTotal)}</strong>
      <p>{monthExpensesCount} recorded expenses</p>
    </div>
  );
}
