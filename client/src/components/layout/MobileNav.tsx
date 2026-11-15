import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Menu, X } from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { iconButton } from "@/components/common/styles";
import { MonthPocket } from "@/components/layout/MonthPocket";
import { NavButton } from "@/components/layout/NavButton";
import { NAV_ITEMS } from "@/constants/navigation";
import { exportExpensesToCSV } from "@/utils/export";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="flex md:hidden sticky z-20 top-0 -mx-4 sm:-mx-8 -mt-6 mb-5 justify-between items-center px-4 py-3 border-b border-[#154734]/10 bg-[#f7f1e5]/90 backdrop-blur-md">
        <div className="-mb-6">
          <Brand compact />
        </div>
        <Dialog.Trigger className={iconButton} aria-label="Open menu">
          <Menu className="w-4 h-4" />
        </Dialog.Trigger>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#152d23]/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed z-50 left-3 top-3 bottom-3 w-[min(85vw,320px)] p-6 rounded-3xl bg-[#fffdf8] shadow-2xl flex flex-col animate-surface focus:outline-none"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex items-center justify-between pb-2 border-b border-[#ded4c5]/60">
            <div className="-mb-6">
              <Brand compact />
            </div>
            <Dialog.Close className={iconButton} aria-label="Close menu">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <nav className="grid gap-1.5 mt-5" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.href} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </nav>
          <div className="mt-auto pt-5">
            <button
              className="w-full flex items-center justify-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-[#eee6d8] text-[#586a5e] text-xs font-bold transition-all hover:bg-[#e2d8c7] active:scale-95"
              onClick={() => exportExpensesToCSV()}
            >
              <Download size={14} /> Export ledger CSV
            </button>
            <MonthPocket />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
