import type { LucideIcon } from "lucide-react";

interface NavButtonProps {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function NavButton({ active, label, icon: Icon, onClick }: NavButtonProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-left transition-all duration-150 active:scale-[0.98] ${
        active
          ? "bg-[#154734] text-[#fffaf0] shadow-md shadow-[#154734]/15"
          : "bg-transparent text-[#617168] hover:text-[#154734] hover:bg-[#c9dac3]/40"
      }`}
      onClick={onClick}
    >
      <Icon className="w-[18px] h-[18px] stroke-[2]" />
      <span>{label}</span>
    </button>
  );
}
