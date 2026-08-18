import { ChartPie, Download, LayoutDashboard, Tags } from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { MonthPocket } from "@/components/layout/MonthPocket";
import { NavButton } from "@/components/layout/NavButton";
import type { PageTab } from "@/types/navigation";

interface SidebarProps {
  page: PageTab;
  onSelectPage: (page: PageTab) => void;
  onExportCSV: () => void;
  monthTotal: number;
  monthExpensesCount: number;
}

export function Sidebar({
  page,
  onSelectPage,
  onExportCSV,
  monthTotal,
  monthExpensesCount,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <Brand />
      <nav className="nav-list" aria-label="Main navigation">
        <NavButton
          active={page === "today"}
          label="Today’s ledger"
          icon={LayoutDashboard}
          onClick={() => onSelectPage("today")}
        />
        <NavButton
          active={page === "reports"}
          label="Reports"
          icon={ChartPie}
          onClick={() => onSelectPage("reports")}
        />
        <NavButton
          active={page === "categories"}
          label="Categories"
          icon={Tags}
          onClick={() => onSelectPage("categories")}
        />
      </nav>
      <div className="sidebar-bottom">
        <button className="export-link" onClick={onExportCSV}>
          <Download size={14} /> Export CSV
        </button>
        <MonthPocket
          monthTotal={monthTotal}
          monthExpensesCount={monthExpensesCount}
        />
      </div>
    </aside>
  );
}
