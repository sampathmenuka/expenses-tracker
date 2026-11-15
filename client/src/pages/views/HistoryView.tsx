import { useMemo, useState } from "react";
import { Download, Loader2, Search, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { inputClass, selectClass, labelClass, secondaryButton } from "@/components/common/styles";
import { ExpenseDialog } from "@/components/modals/ExpenseDialog";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseLedger } from "@/pages/views/ExpenseLedger";
import type { Expense, ExpenseFilters, ExpenseSort } from "@/types/expense";
import { dateKey, getMonthRange, shiftDays } from "@/utils/date";
import { exportExpensesToCSV } from "@/utils/export";
import { formatCurrency } from "@/utils/format";

type RangePreset = "this-month" | "last-month" | "last-30" | "this-year" | "all" | "custom";

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "last-30", label: "Last 30 days" },
  { value: "this-year", label: "This year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

function presetRange(preset: RangePreset): { start?: string; end?: string } {
  const now = new Date();
  switch (preset) {
    case "this-month": {
      const r = getMonthRange(now);
      return { start: r.startKey, end: r.endKey };
    }
    case "last-month": {
      const r = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      return { start: r.startKey, end: r.endKey };
    }
    case "last-30":
      return { start: dateKey(shiftDays(now, -29)), end: dateKey(now) };
    case "this-year":
      return { start: `${now.getFullYear()}-01-01`, end: `${now.getFullYear()}-12-31` };
    default:
      return {};
  }
}

export function HistoryView() {
  const { categories } = useCategories();
  const [preset, setPreset] = useState<RangePreset>("this-month");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ExpenseSort>("date_desc");
  const [editing, setEditing] = useState<Expense | null>(null);
  const q = useDebouncedValue(search.trim());

  const filters = useMemo<ExpenseFilters>(() => {
    const range = preset === "custom" ? custom : presetRange(preset);
    return {
      start: range.start || undefined,
      end: range.end || undefined,
      categoryId: categoryId || undefined,
      q: q || undefined,
      sort,
    };
  }, [preset, custom, categoryId, q, sort]);

  const list = useExpenses(filters);
  const hasFilters = Boolean(categoryId || q);

  const clearFilters = () => {
    setCategoryId("");
    setSearch("");
  };

  return (
    <>
      <PageHeader eyebrow="Every entry, searchable" title="History">
        <button
          className={`${secondaryButton} self-start`}
          onClick={() => exportExpensesToCSV(filters)}
          disabled={!list.total}
        >
          <Download className="w-3.5 h-3.5" /> Export these
        </button>
      </PageHeader>

      <section className="p-4 sm:p-5 mb-5 rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-3 items-end">
          <div className="grid gap-1.5">
            <label htmlFor="history-search" className={labelClass}>Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5e6962]" />
              <input
                id="history-search"
                className={`${inputClass} pl-8`}
                placeholder="Title or note"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="history-range" className={labelClass}>Period</label>
            <select
              id="history-range"
              className={selectClass}
              value={preset}
              onChange={(e) => setPreset(e.target.value as RangePreset)}
            >
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="history-category" className={labelClass}>Category</label>
            <select
              id="history-category"
              className={selectClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="history-sort" className={labelClass}>Sort by</label>
            <select
              id="history-sort"
              className={selectClass}
              value={sort}
              onChange={(e) => setSort(e.target.value as ExpenseSort)}
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="amount_desc">Largest amount</option>
              <option value="amount_asc">Smallest amount</option>
            </select>
          </div>
        </div>

        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-3 mt-3 sm:max-w-sm">
            <div className="grid gap-1.5">
              <label htmlFor="history-from" className={labelClass}>From</label>
              <input
                id="history-from"
                type="date"
                className={inputClass}
                value={custom.start}
                max={custom.end || undefined}
                onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="history-to" className={labelClass}>To</label>
              <input
                id="history-to"
                type="date"
                className={inputClass}
                value={custom.end}
                min={custom.start || undefined}
                onChange={(e) => setCustom((c) => ({ ...c, end: e.target.value }))}
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3 px-1">
        <p className="m-0 text-[#586a5f] text-xs" aria-live="polite">
          <strong className="text-[#154734] font-serif text-lg">{formatCurrency(list.totalAmount)}</strong>{" "}
          across {list.total} expense{list.total === 1 ? "" : "s"}
          {list.isFetching && !list.isLoading && (
            <Loader2 className="inline w-3 h-3 ml-2 animate-spin text-[#506d5b]" />
          )}
        </p>
        {hasFilters && (
          <button
            className="inline-flex items-center gap-1 text-[#154734] text-[11px] font-bold hover:underline"
            onClick={clearFilters}
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      <ExpenseLedger
        expenses={list.expenses}
        categories={categories}
        isLoading={list.isLoading}
        groupByDay={sort.startsWith("date")}
        onEdit={setEditing}
        emptyTitle="Nothing here yet."
        emptyText={
          hasFilters
            ? "No expenses match these filters. Try widening the period or clearing the search."
            : "No expenses recorded in this period."
        }
        footer={
          list.hasMore && (
            <div className="p-3 border-t border-[#eee6d8] text-center">
              <button className={secondaryButton} onClick={list.loadMore} disabled={list.isLoadingMore}>
                {list.isLoadingMore ? "Loading…" : `Load more (${list.total - list.expenses.length} left)`}
              </button>
            </div>
          )
        }
      />

      <ExpenseDialog expense={editing} onClose={() => setEditing(null)} />
    </>
  );
}
