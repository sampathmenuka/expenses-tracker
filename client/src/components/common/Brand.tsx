interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="brand">
      <img className="brand-mark" src="/logo.svg" alt="Ledger Logo" />
      <div>
        <span className="brand-name">Daily Ledger</span>
        {!compact && <span className="brand-subtitle">Expense tracker</span>}
      </div>
    </div>
  );
}
