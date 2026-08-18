import { ChartBar } from "lucide-react";

interface EmptyReportProps {
  text: string;
}

export function EmptyReport({ text }: EmptyReportProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-[#819087] text-[11px] leading-relaxed">
      <ChartBar className="w-6 h-6 text-[#a6bca3] mb-2" />
      <span>{text}</span>
    </div>
  );
}
