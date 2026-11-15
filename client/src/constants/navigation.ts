import { ChartPie, History, Lightbulb, LayoutDashboard, Settings, Tags, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Today’s ledger", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/reports", label: "Reports", icon: ChartPie },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];
