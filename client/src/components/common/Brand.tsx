interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-2.5 px-1 py-0.5 pb-6">
      <img
        className="w-[42px] h-[42px] object-contain shrink-0"
        src="/logo.svg"
        alt="Ledger Logo"
      />
      <div>
        <span className="block font-serif text-[19px] font-bold tracking-tight text-[#154734] leading-none">
          Daily Ledger
        </span>
        {!compact && (
          <span className="block mt-1 text-[#3c5043] text-[9px] font-mono font-semibold uppercase tracking-wider">
            Expense tracker
          </span>
        )}
      </div>
    </div>
  );
}
