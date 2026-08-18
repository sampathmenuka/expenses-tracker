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
      <header className="flex md:hidden sticky z-20 top-0 justify-between items-center px-4 py-3 border-b border-[#154734]/10 bg-[#f7f1e5]/90 backdrop-blur-md">
        <Brand compact />
        <button
          className="w-[34px] h-[34px] border border-[#ded4c5] bg-[#fffdf8] text-[#315542] rounded-xl grid place-items-center transition-all hover:bg-[#e7efe4] active:scale-95"
          onClick={onOpen}
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 grid place-items-center p-5 bg-[#152d23]/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            className="w-[min(85vw,320px)] h-[90vh] mr-auto p-6 rounded-3xl bg-[#fffdf8] shadow-2xl flex flex-col animate-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#ded4c5]/60">
              <Brand compact />
              <button
                className="w-8 h-8 border border-[#ded4c5] bg-[#fffdf8] text-[#315542] rounded-lg grid place-items-center transition-all hover:bg-[#e7efe4] active:scale-95"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="grid gap-1.5 mt-5">
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
            <div className="mt-auto pt-5">
              <button
                className="w-full flex items-center justify-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-[#eee6d8] text-[#5e7164] text-xs font-bold transition-all hover:bg-[#e2d8c7] active:scale-95"
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
