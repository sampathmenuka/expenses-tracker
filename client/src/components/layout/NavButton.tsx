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
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
}
