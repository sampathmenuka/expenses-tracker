import { CalendarDays, Plus } from "lucide-react";
import { ExpenseLedger } from "@/pages/views/ExpenseLedger";
import type { Category } from "@/types/category";
import type { Expense, ExpenseDraft } from "@/types/expense";
import { formatFullDate, fromKey } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

interface TodayViewProps {
  today: string;
  todayTotal: number;
  draft: ExpenseDraft;
  categories: Category[];
  expenses: Expense[];
  pendingDelete: string | null;
  selectedCategory: string;
  searchQuery: string;
  onSelectCategory: (cat: string) => void;
  onSearchChange: (q: string) => void;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseDraft>>;
  onSubmit: (event: React.FormEvent) => void;
  onAddCategory: () => void;
  onRequestDelete: (id: string | null) => void;
  onRemove: (id: string) => void;
}

export function TodayView({
  today,
  todayTotal,
  draft,
  categories,
  expenses,
  pendingDelete,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearchChange,
  setDraft,
  onSubmit,
  onAddCategory,
  onRequestDelete,
  onRemove,
}: TodayViewProps) {
  const formattedDate = formatFullDate(fromKey(today));

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[#6e8075] text-[9px] font-mono font-semibold uppercase tracking-wider">
            Daily view · {today}
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#154734] leading-tight tracking-tight">
            {formattedDate}
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[#6b756d] text-xs font-bold pt-1">
          <CalendarDays className="w-4 h-4 text-[#154734]" />
          <span>Your personal spending note</span>
        </div>
      </header>

      {/* Hero card */}
      <section className="relative overflow-hidden p-6 sm:p-7 mb-7 rounded-3xl border border-[#154734]/15 bg-gradient-to-br from-[#fffdf8]/95 via-[#f4ede0]/90 to-[#eee4d2]/85 shadow-lg shadow-black/5 animate-surface">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-md">
            <span className="text-[#6e8075] text-[9px] font-mono font-semibold uppercase tracking-wider">
              A small daily ritual
            </span>
            <h2 className="mt-2 mb-1.5 font-serif text-2xl sm:text-[26px] font-bold text-[#154734] tracking-tight leading-tight">
              Give every expense a place.
            </h2>
            <p className="m-0 text-[#4b6657] text-xs sm:text-[13px] leading-relaxed font-medium">
              Log the little things now. Your weekly and monthly picture will
              build itself.
            </p>
          </div>
          <div className="pt-3 md:pt-0 md:pl-5 border-t md:border-t-0 md:border-l border-[#154734]/20 min-w-[140px]">
            <span className="text-[#5c7768] text-[9px] font-mono font-semibold uppercase tracking-wider">
              Spent today
            </span>
            <strong className="block mt-1 font-serif text-3xl sm:text-4xl font-bold text-[#154734] tracking-tight leading-none">
              {formatCurrency(todayTotal)}
            </strong>
          </div>
        </div>
      </section>

      {/* Log an expense Form */}
      <section className="mb-7">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="m-0 font-serif text-xl sm:text-[22px] font-bold text-[#154734] tracking-tight">
              Log an expense
            </h2>
            <p className="m-0 text-[#778178] text-xs">One line is all it takes.</p>
          </div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 shadow-sm">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_135px_135px_42px] gap-3 items-end"
            onSubmit={onSubmit}
          >
            {/* Title */}
            <div className="grid gap-1.5 min-w-0 sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="expense-title"
                className="text-[#68776d] font-mono text-[9px] font-medium uppercase tracking-wider"
              >
                What was it?
              </label>
              <input
                id="expense-title"
                className="w-full h-10 px-3 border border-[#ded4c5] rounded-xl bg-[#fffdf8] text-[#234437] text-xs font-bold outline-none transition-all focus:border-[#6f957e] focus:ring-2 focus:ring-[#a9bea8]/30"
                placeholder="e.g. Lunch at the market"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            {/* Category */}
            <div className="grid gap-1.5 min-w-0">
              <label
                htmlFor="expense-category"
                className="text-[#68776d] font-mono text-[9px] font-medium uppercase tracking-wider"
              >
                Expense type
              </label>
              <select
                id="expense-category"
                className="w-full h-10 px-3 border border-[#ded4c5] rounded-xl bg-[#fffdf8] text-[#234437] text-xs font-bold outline-none transition-all focus:border-[#6f957e] focus:ring-2 focus:ring-[#a9bea8]/30"
                value={draft.categoryId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="grid gap-1.5 min-w-0">
              <label
                htmlFor="expense-date"
                className="text-[#68776d] font-mono text-[9px] font-medium uppercase tracking-wider"
              >
                Date
              </label>
              <input
                id="expense-date"
                className="w-full h-10 px-2.5 border border-[#ded4c5] rounded-xl bg-[#fffdf8] text-[#234437] text-xs font-bold outline-none transition-all focus:border-[#6f957e] focus:ring-2 focus:ring-[#a9bea8]/30"
                type="date"
                value={draft.date}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </div>

            {/* Amount */}
            <div className="grid gap-1.5 min-w-0">
              <label
                htmlFor="expense-amount"
                className="text-[#68776d] font-mono text-[9px] font-medium uppercase tracking-wider"
              >
                Amount
              </label>
              <div className="relative min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#728077] font-mono text-[11px] pointer-events-none select-none">
                  Rs.
                </span>
                <input
                  id="expense-amount"
                  className="w-full h-10 pl-10 pr-3 border border-[#ded4c5] rounded-xl bg-[#fffdf8] text-[#234437] font-mono text-xs font-bold outline-none transition-all focus:border-[#6f957e] focus:ring-2 focus:ring-[#a9bea8]/30"
                  inputMode="decimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={draft.amount}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Submit */}
            <button
              className="w-full lg:w-[42px] h-10 flex items-center justify-center rounded-xl bg-[#154734] text-[#fffaf0] shadow-md shadow-[#154734]/15 transition-all hover:bg-[#0f392a] active:scale-95 shrink-0"
              type="submit"
              aria-label="Add expense"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center gap-1.5 mt-3 text-[#778178] text-[11px]">
            <span>Need a different way to spend?</span>
            <button
              className="text-[#154734] font-bold underline underline-offset-2 hover:text-[#0f392a]"
              type="button"
              onClick={onAddCategory}
            >
              Add your own category
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Ledger */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="m-0 font-serif text-xl sm:text-[22px] font-bold text-[#154734] tracking-tight">
            Today’s recorded list
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 h-8 border border-[#ded4c5] rounded-lg bg-[#fffdf8] text-[#728077]">
              <input
                className="border-0 outline-none bg-transparent text-xs text-[#154734] placeholder:text-[#728077] w-28"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <select
              className="h-8 px-2 border border-[#ded4c5] rounded-lg bg-[#fffdf8] text-xs font-semibold text-[#154734] outline-none"
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ExpenseLedger
          expenses={expenses}
          categories={categories}
          pendingDelete={pendingDelete}
          onRequestDelete={onRequestDelete}
          onRemove={onRemove}
        />
      </section>
    </>
  );
}
