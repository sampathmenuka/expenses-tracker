import { useMemo, useState } from "react";
import { ContextPanel } from "@/components/layout/ContextPanel";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { CategoryDialog } from "@/components/modals/CategoryDialog";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { CategoriesView } from "@/pages/views/CategoriesView";
import { ReportsView } from "@/pages/views/ReportsView";
import { TodayView } from "@/pages/views/TodayView";
import type { CategoryDraft } from "@/types/category";
import type { ExpenseDraft } from "@/types/expense";
import type { PageTab, ReportPeriod } from "@/types/navigation";
import {
  dateKey,
  getMonthKey,
  getPeriodRange,
  shiftDays,
  shortDay,
} from "@/utils/date";
import { exportExpensesToCSV } from "@/utils/export";
import { calculateCategoryBreakdown, sumExpenses } from "@/utils/format";

export default function Home() {
  const today = dateKey(new Date());
  const [page, setPage] = useState<PageTab>("today");
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("weekly");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [draft, setDraft] = useState<ExpenseDraft>({
    title: "",
    amount: "",
    categoryId: "food",
    date: today,
  });

  const { expenses, sortedExpenses, addExpense, removeExpense } = useExpenses();
  const { categories, addCustomCategory, removeCategory } = useCategories();

  // Computed totals & ranges
  const todayExpenses = useMemo(
    () => expenses.filter((expense) => expense.date === today),
    [expenses, today]
  );
  const todayTotal = sumExpenses(todayExpenses);

  const { current: currentPeriod, previous: previousPeriod } = useMemo(
    () => getPeriodRange(reportPeriod),
    [reportPeriod]
  );

  const periodExpenses = useMemo(
    () =>
      expenses.filter(
        (e) =>
          e.date >= currentPeriod.startKey && e.date <= currentPeriod.endKey
      ),
    [expenses, currentPeriod]
  );

  const previousExpenses = useMemo(
    () =>
      expenses.filter(
        (e) =>
          e.date >= previousPeriod.startKey && e.date <= previousPeriod.endKey
      ),
    [expenses, previousPeriod]
  );

  const periodTotal = sumExpenses(periodExpenses);
  const previousTotal = sumExpenses(previousExpenses);
  const percentChange = previousTotal
    ? ((periodTotal - previousTotal) / previousTotal) * 100
    : 0;

  const dayCount =
    reportPeriod === "weekly" ? 7 : currentPeriod.end.getDate();
  const averageSpend = periodTotal / dayCount;

  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(categories, periodExpenses),
    [categories, periodExpenses]
  );
  const highestCategory = categoryBreakdown[0];

  const chartSeries = useMemo(() => {
    const count =
      reportPeriod === "weekly" ? 7 : currentPeriod.end.getDate();
    return Array.from({ length: count }, (_, index) => {
      const date = shiftDays(currentPeriod.start, index);
      const key = dateKey(date);
      const amount = sumExpenses(
        periodExpenses.filter((expense) => expense.date === key)
      );
      return {
        label:
          reportPeriod === "weekly" ? shortDay(date) : String(date.getDate()),
        amount,
      };
    });
  }, [currentPeriod, periodExpenses, reportPeriod]);

  const visibleExpenses = useMemo(() => {
    let result =
      page === "today"
        ? sortedExpenses.filter((expense) => expense.date === today)
        : sortedExpenses;
    if (selectedFilterCategory !== "all") {
      result = result.filter((e) => e.categoryId === selectedFilterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => e.title.toLowerCase().includes(q));
    }
    return result;
  }, [page, sortedExpenses, today, selectedFilterCategory, searchQuery]);

  const monthKey = getMonthKey();
  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.slice(0, 7) === monthKey),
    [expenses, monthKey]
  );
  const monthTotal = sumExpenses(monthExpenses);

  const handleAddExpense = (event: React.FormEvent) => {
    event.preventDefault();
    const success = addExpense(draft);
    if (success) {
      setDraft((current) => ({ ...current, title: "", amount: "" }));
    }
  };

  const handleAddCustomCategory = (categoryDraft: CategoryDraft) => {
    const created = addCustomCategory(categoryDraft);
    if (created) {
      setDraft((current) => ({ ...current, categoryId: created.id }));
      setCategoryDialog(false);
    }
  };

  const handleExportCSV = () => {
    exportExpensesToCSV(sortedExpenses, categories, today);
  };

  const handleSelectPage = (next: PageTab) => {
    setPage(next);
    setPendingDelete(null);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr_320px] max-w-[1680px] mx-auto">
      <div className="hidden md:block">
        <Sidebar
          page={page}
          onSelectPage={handleSelectPage}
          onExportCSV={handleExportCSV}
          monthTotal={monthTotal}
          monthExpensesCount={monthExpenses.length}
        />
      </div>

      <main className="min-w-0 px-4 sm:px-8 lg:px-12 py-6 sm:py-9">
        <MobileNav
          page={page}
          isOpen={mobileMenuOpen}
          onOpen={() => setMobileMenuOpen(true)}
          onClose={() => setMobileMenuOpen(false)}
          onSelectPage={handleSelectPage}
          onExportCSV={handleExportCSV}
          monthTotal={monthTotal}
          monthExpensesCount={monthExpenses.length}
        />

        {page === "today" && (
          <TodayView
            today={today}
            todayTotal={todayTotal}
            draft={draft}
            categories={categories}
            expenses={visibleExpenses}
            pendingDelete={pendingDelete}
            selectedCategory={selectedFilterCategory}
            searchQuery={searchQuery}
            onSelectCategory={setSelectedFilterCategory}
            onSearchChange={setSearchQuery}
            setDraft={setDraft}
            onSubmit={handleAddExpense}
            onAddCategory={() => setCategoryDialog(true)}
            onRequestDelete={setPendingDelete}
            onRemove={removeExpense}
          />
        )}

        {page === "reports" && (
          <ReportsView
            period={reportPeriod}
            setPeriod={setReportPeriod}
            periodTotal={periodTotal}
            previousTotal={previousTotal}
            percentChange={percentChange}
            averageSpend={averageSpend}
            highestCategory={highestCategory}
            categoryBreakdown={categoryBreakdown}
            chartSeries={chartSeries}
            periodStart={currentPeriod.start}
            periodEnd={currentPeriod.end}
          />
        )}

        {page === "categories" && (
          <CategoriesView
            categories={categories}
            expenses={expenses}
            onAdd={() => setCategoryDialog(true)}
            onRemoveCategory={removeCategory}
          />
        )}
      </main>

      <ContextPanel
        categories={categories}
        expenses={expenses}
        onOpenCategoryDialog={() => setCategoryDialog(true)}
        onSelectPage={handleSelectPage}
        onExportCSV={handleExportCSV}
      />

      <CategoryDialog
        isOpen={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        onAddCategory={handleAddCustomCategory}
      />
    </div>
  );
}
