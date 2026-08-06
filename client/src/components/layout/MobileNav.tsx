import {
  ChartPie,
  Download,
  LayoutDashboard,
  Menu,
  Tags,
  X,
} from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { MonthPocket } from "@/components/layout/MonthPocket";
import { NavButton } from "@/components/layout/NavButton";
import type { PageTab } from "@/types/navigation";

interface MobileNavProps {
  page: PageTab;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelectPage: (page: PageTab) => void;
  onExportCSV: () => void;
  monthTotal: number;
  monthExpensesCount: number;
}

export function MobileNav({
  page,
  isOpen,
  onOpen,
  onClose,
  onSelectPage,
  onExportCSV,
  monthTotal,
  monthExpensesCount,
}: MobileNavProps) {
  return (
    <>
      <header className="mobile-topbar">
        <Brand compact />
        <button
          className="icon-button"
          onClick={onOpen}
          aria-label="Open menu"
        >
          <Menu />
        </button>
      </header>

      {isOpen && (
        <div className="dialog-backdrop" onClick={onClose}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-head">
              <Brand compact />
              <button
                className="icon-button"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X />
              </button>
            </div>
            <nav className="nav-list" style={{ marginTop: 20 }}>
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
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <button
                className="button-secondary w-full flex items-center justify-center gap-2 mb-4"
                onClick={onExportCSV}
              >
                <Download size={14} /> Export Ledger CSV
              </button>
              <MonthPocket
                monthTotal={monthTotal}
                monthExpensesCount={monthExpensesCount}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
