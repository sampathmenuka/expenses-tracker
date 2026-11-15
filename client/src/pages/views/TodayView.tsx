import { useEffect, useRef, useState } from "react";
import { CalendarDays, Loader2, NotebookPen, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { BudgetBar } from "@/components/common/BudgetBar";
import { PageHeader } from "@/components/common/PageHeader";
import {
  eyebrowClass,
  inputClass,
  selectClass,
  labelClass,
  sectionTitleClass,
} from "@/components/common/styles";
import { CategoryDialog } from "@/components/modals/CategoryDialog";
import { ExpenseDialog } from "@/components/modals/ExpenseDialog";
import { ImportBanner } from "@/components/layout/ImportBanner";
import { useUser } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCreateExpense, useExpenses } from "@/hooks/useExpenses";
import { useDashboard } from "@/hooks/useReports";
import { ExpenseLedger } from "@/pages/views/ExpenseLedger";
import type { Expense, ExpenseDraft } from "@/types/expense";
import { dateKey, formatFullDate, fromKey } from "@/utils/date";
import { draftToInput } from "@/utils/expense";
import { formatCurrency, getCurrency } from "@/utils/format";

export function TodayView() {
  const today = dateKey(new Date());
  const user = useUser();
  const { categories } = useCategories();
  const { data: dashboard } = useDashboard();
  const create = useCreateExpense();

  const [draft, setDraft] = useState<ExpenseDraft>({
    title: "",
    amount: "",
    categoryId: "",
    date: today,
    note: "",
  });
  const [showNote, setShowNote] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Default the category once categories arrive.
  useEffect(() => {
    if (!draft.categoryId && categories.length) {
      setDraft((current) => ({ ...current, categoryId: categories[0].id }));
    }
  }, [categories, draft.categoryId]);

  const debouncedSearch = useDebouncedValue(search.trim());
  const list = useExpenses({
    start: today,
    end: today,
    q: debouncedSearch || undefined,
    categoryId: filterCategory || undefined,
  });

  const set = (patch: Partial<ExpenseDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = draftToInput(draft);
    if (typeof input === "string") {
      toast.error(input);
      return;
    }
    create.mutate(input, {
      onSuccess: (saved) => {
        toast.success(
          saved.date === today
            ? `${saved.title} added to today's ledger.`
            : `${saved.title} recorded for ${formatFullDate(fromKey(saved.date))}.`
        );
        // Keep category and date: people tend to log several similar items in a row.
        set({ title: "", amount: "", note: "" });
        setShowNote(false);
        titleRef.current?.focus();
      },
    });
  };

  const monthBudget = dashboard?.monthlyBudget ?? user.monthlyBudget;

  return (
    <>
      <PageHeader eyebrow={`Daily view · ${today}`} title={formatFullDate(fromKey(today))}>
        <div className="hidden sm:flex items-center gap-2 text-[#5f6861] text-xs font-bold pt-1">
          <CalendarDays className="w-4 h-4 text-[#154734]" />
          <span>Hello, {user.name.split(" ")[0]}</span>
        </div>
      </PageHeader>

      <ImportBanner />

      <section className="relative overflow-hidden p-6 sm:p-7 mb-7 rounded-3xl border border-[#154734]/15 bg-gradient-to-br from-[#fffdf8]/95 via-[#f4ede0]/90 to-[#eee4d2]/85 shadow-lg shadow-black/5 animate-surface">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-md flex-1">
            <span className={eyebrowClass}>A small daily ritual</span>
            <h2 className="mt-2 mb-1.5 font-serif text-2xl sm:text-[26px] font-bold text-[#154734] tracking-tight leading-tight">
              Give every expense a place.
            </h2>
            {monthBudget ? (
              <div className="mt-3 max-w-sm">
                <p className="m-0 mb-1.5 text-[#4b6657] text-xs font-semibold">
                  This month: {formatCurrency(dashboard?.monthTotal ?? 0)}
                </p>
                <BudgetBar spent={dashboard?.monthTotal ?? 0} budget={monthBudget} />
              </div>
            ) : (
              <p className="m-0 text-[#4b6657] text-xs sm:text-[13px] leading-relaxed font-medium">
                Log the little things now. Want a guardrail?{" "}
                <Link href="/settings" className="text-[#154734] font-bold underline underline-offset-2">
                  Set a monthly budget
                </Link>
                .
              </p>
            )}
          </div>
          <div className="pt-3 md:pt-0 md:pl-5 border-t md:border-t-0 md:border-l border-[#154734]/20 min-w-[140px]">
            <span className={eyebrowClass}>Spent today</span>
            <strong className="block mt-1 font-serif text-3xl sm:text-4xl font-bold text-[#154734] tracking-tight leading-none">
              {formatCurrency(dashboard?.todayTotal ?? 0)}
            </strong>
            <span className="block mt-1.5 text-[#5b6a61] font-mono text-[10px]">
              {dashboard?.todayCount ?? 0} item{dashboard?.todayCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-7">
        <div className="mb-3">
          <h2 className={sectionTitleClass}>Log an expense</h2>
          <p className="m-0 text-[#606861] text-xs">One line is all it takes.</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-[#a08e73]/25 bg-[#fffdf8]/85 shadow-sm">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_150px_150px_42px] gap-3 items-end"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid gap-1.5 min-w-0 sm:col-span-2 lg:col-span-1">
              <label htmlFor="expense-title" className={labelClass}>What was it?</label>
              <input
                id="expense-title"
                ref={titleRef}
                className={inputClass}
                placeholder="e.g. Lunch at the market"
                maxLength={120}
                autoComplete="off"
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
              />
            </div>

            <div className="grid gap-1.5 min-w-0">
              <label htmlFor="expense-category" className={labelClass}>Expense type</label>
              <select
                id="expense-category"
                className={selectClass}
                value={draft.categoryId}
                onChange={(e) => set({ categoryId: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5 min-w-0">
              <label htmlFor="expense-date" className={labelClass}>Date</label>
              <input
                id="expense-date"
                className={`${inputClass} px-2.5`}
                type="date"
                max={today}
                value={draft.date}
                onChange={(e) => set({ date: e.target.value })}
              />
            </div>

            <div className="grid gap-1.5 min-w-0">
              <label htmlFor="expense-amount" className={labelClass}>Amount</label>
              <div className="relative min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5e6962] font-mono text-[10px] pointer-events-none select-none">
                  {getCurrency()}
                </span>
                <input
                  id="expense-amount"
                  className={`${inputClass} pl-11 font-mono`}
                  inputMode="decimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={draft.amount}
                  onChange={(e) => set({ amount: e.target.value })}
                />
              </div>
            </div>

            <button
              className="w-full lg:w-[42px] h-10 flex items-center justify-center gap-2 rounded-xl bg-[#154734] text-[#fffaf0] text-xs font-bold shadow-md shadow-[#154734]/15 transition-all hover:bg-[#0f392a] active:scale-95 shrink-0 disabled:opacity-60"
              type="submit"
              aria-label="Add expense"
              disabled={create.isPending}
            >
              {create.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span className="lg:hidden">Add expense</span>
            </button>

            {showNote && (
              <div className="grid gap-1.5 sm:col-span-2 lg:col-span-5">
                <label htmlFor="expense-note" className={labelClass}>Note</label>
                <input
                  id="expense-note"
                  className={`${inputClass} font-medium`}
                  placeholder="Who, why, or anything you'll want to remember"
                  maxLength={1000}
                  autoFocus
                  value={draft.note}
                  onChange={(e) => set({ note: e.target.value })}
                />
              </div>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[#606861] text-[11px]">
            {!showNote && (
              <button
                className="inline-flex items-center gap-1 text-[#154734] font-bold hover:text-[#0f392a]"
                type="button"
                onClick={() => setShowNote(true)}
              >
                <NotebookPen className="w-3 h-3" /> Add a note
              </button>
            )}
            <span>
              Need a different way to spend?{" "}
              <button
                className="text-[#154734] font-bold underline underline-offset-2 hover:text-[#0f392a]"
                type="button"
                onClick={() => setCategoryDialog(true)}
              >
                Add your own category
              </button>
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className={sectionTitleClass}>Today's recorded list</h2>
            <Link href="/history" className="text-[#154734] text-[11px] font-bold hover:underline">
              See earlier days →
            </Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-2.5 h-8 border border-[#ded4c5] rounded-lg bg-[#fffdf8] text-[#5e6962]">
              <Search className="w-3.5 h-3.5" />
              <input
                className="border-0 outline-none bg-transparent text-xs text-[#154734] placeholder:text-[#5e6962] w-28"
                placeholder="Search…"
                aria-label="Search today's expenses"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              className="select-chevron h-8 pl-2.5 pr-7 border border-[#ded4c5] rounded-lg bg-[#fffdf8] text-xs font-semibold text-[#154734] outline-none"
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ExpenseLedger
          expenses={list.expenses}
          categories={categories}
          isLoading={list.isLoading}
          onEdit={setEditing}
          emptyTitle={search || filterCategory ? "Nothing matches." : undefined}
          emptyText={search || filterCategory ? "Try a different search or category." : undefined}
        />
      </section>

      <ExpenseDialog expense={editing} onClose={() => setEditing(null)} />
      <CategoryDialog
        isOpen={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        onSaved={(category) => set({ categoryId: category.id })}
      />
    </>
  );
}
