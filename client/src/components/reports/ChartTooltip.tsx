import { formatCurrency } from "@/utils/format";

interface ChartTooltipPayloadItem {
  value?: number;
  name?: string;
  payload?: {
    name?: string;
  };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="chart-tooltip">
      <div>{entry.name ?? entry.payload?.name ?? label}</div>
      <strong>{formatCurrency(Number(entry.value ?? 0))}</strong>
    </div>
  );
}
