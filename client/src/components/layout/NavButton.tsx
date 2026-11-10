import { Link, useRoute } from "wouter";
import type { NavItem } from "@/constants/navigation";

interface NavButtonProps {
  item: NavItem;
  onNavigate?: () => void;
}

export function NavButton({ item, onNavigate }: NavButtonProps) {
  const [active] = useRoute(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-left no-underline transition-all duration-150 active:scale-[0.98] ${
        active
          ? "bg-[#154734] text-[#fffaf0] shadow-md shadow-[#154734]/15"
          : "bg-transparent text-[#5b6a62] hover:text-[#154734] hover:bg-[#c9dac3]/40"
      }`}
    >
      <Icon className="w-[18px] h-[18px] stroke-[2]" />
      <span>{item.label}</span>
    </Link>
  );
}
