import { Download } from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { MonthPocket } from "@/components/layout/MonthPocket";
import { NavButton } from "@/components/layout/NavButton";
import { NAV_ITEMS } from "@/constants/navigation";
import { exportExpensesToCSV } from "@/utils/export";

export function Sidebar() {
  return (
    <aside aria-label="Navigation and monthly total" className="sticky top-0 h-screen p-6 pb-5 flex flex-col border-r border-[#154734]/15 bg-[#fffdf8]/60 backdrop-blur-md">
      <Brand />
      <nav className="grid gap-1.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.href} item={item} />
        ))}
      </nav>
      <div className="mt-auto pt-4">
        <button
          className="flex items-center gap-2 w-full px-2.5 py-2 mb-3 bg-[#154734]/10 border border-dashed border-[#154734]/25 rounded-xl text-[#154734] text-[11px] font-bold transition-colors hover:bg-[#154734]/20 active:scale-[0.98]"
          onClick={() => exportExpensesToCSV()}
        >
          <Download size={14} /> Export CSV
        </button>
        <MonthPocket />
      </div>
    </aside>
  );
}
