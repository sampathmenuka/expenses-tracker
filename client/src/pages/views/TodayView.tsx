import { CalendarDays, Info, Plus, Search } from "lucide-react";
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
  allTodayExpensesCount: number;
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
  allTodayExpensesCount,
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
      <header className="page-heading">
        <div>
          <span className="eyebrow">Daily view · {today}</span>
          <h1>{formattedDate}</h1>
        </div>
        <div className="heading-utility">
          <CalendarDays /> Your personal spending note
        </div>
      </header>

      <section className="day-hero">
        <div className="hero-grid">
          <div className="hero-message">
            <span className="eyebrow">A small daily ritual</span>
            <h2>Give every expense a place.</h2>
            <p>
              Log the little things now. Your weekly and monthly picture will
              build itself.
            </p>
          </div>
          <div className="today-total">
            <span className="summary-label">Spent today</span>
            <strong>{formatCurrency(todayTotal)}</strong>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>Log an expense</h2>
            <p>One line is all it takes.</p>
          </div>
        </div>
        <div className="entry-card">
          <form className="entry-form" onSubmit={onSubmit}>
            <div className="field-stack field-title">
              <label htmlFor="expense-title">What was it?</label>
              <input
                id="expense-title"
                className="ledger-input"
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
            <div className="field-stack field-category">
              <label htmlFor="expense-category">Expense type</label>
              <select
                id="expense-category"
                className="ledger-select"
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
            <div className="field-stack field-date">
              <label htmlFor="expense-date">Date</label>
              <input
                id="expense-date"
                className="ledger-input"
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
            <div className="field-stack">
              <label htmlFor="expense-amount">Amount</label>
              <div className="input-shell">
                <span className="money-prefix">$</span>
                <input
                  id="expense-amount"
                  className="ledger-input amount-input"
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
            <button
              className="add-expense"
              type="submit"
              aria-label="Add expense"
            >
              <Plus />
            </button>
          </form>
          <div className="form-helper">
            <Info /> Need a different way to spend?{" "}
            <button
              className="text-button"
              onClick={onAddCategory}
              type="button"
            >
              Add your own category
            </button>
            .
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>Today’s entries</h2>
            <p>
              {allTodayExpensesCount
                ? `${allTodayExpensesCount} expense${allTodayExpensesCount === 1 ? "" : "s"} recorded`
                : "Your blank page for today."}
            </p>
          </div>
          {allTodayExpensesCount > 0 && (
            <div className="filter-bar">
              <div className="search-box">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
              >
                <option value="all">All Types</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
