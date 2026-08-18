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
    <div className="p-2.5 rounded-lg border border-[#dcd3c5] bg-[#fffdf8] text-[#315542] shadow-lg shadow-black/5 font-mono text-[11px]">
      <div>{entry.name ?? entry.payload?.name ?? label}</div>
      <strong className="block mt-0.5 text-[#154734]">
        {formatCurrency(Number(entry.value ?? 0))}
      </strong>
    </div>
  );
}
