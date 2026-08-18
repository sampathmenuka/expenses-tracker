import { ChartBar } from "lucide-react";

interface EmptyReportProps {
  text: string;
}

export function EmptyReport({ text }: EmptyReportProps) {
  return (
    <div className="breakdown-empty">
      <ChartBar />
      <span>{text}</span>
    </div>
  );
}
