import { getCategoryById } from "@/constants/categories";
import type { Pacing, Trends } from "@/types/api";
import type { Category } from "@/types/category";
import { formatCurrency } from "@/utils/format";
import { projectMonthEnd, typicalDailySpend } from "@/utils/projection";

export type InsightTone = "good" | "warning" | "neutral";

export interface Insight {
  tone: InsightTone;
  text: string;
}

const WEEKDAY_NAMES = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(2026, 10, 9 + i))
);

function percent(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0;
}

/** Turns the analytics payloads into a few plain-language observations. */
export function buildInsights(pacing: Pacing, trends: Trends, categories: Category[]): Insight[] {
  const insights: Insight[] = [];

  // 1. Pace against the same point last month.
  if (pacing.thisMonthTotal > 0 && pacing.lastMonthSamePoint > 0) {
    const diff = pacing.thisMonthTotal - pacing.lastMonthSamePoint;
    const pct = percent(Math.abs(diff), pacing.lastMonthSamePoint);
    if (pct >= 5) {
      insights.push({
        tone: diff > 0 ? "warning" : "good",
        text: `You've spent ${formatCurrency(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than at this point last month (${pct}% ${diff > 0 ? "higher" : "lower"}).`,
      });
    } else {
      insights.push({ tone: "neutral", text: "You're spending at almost exactly last month's pace." });
    }
  }

  // 2. Budget forecast.
  if (pacing.monthlyBudget && pacing.thisMonthTotal > 0 && pacing.daysElapsed > 0) {
    const typical = typicalDailySpend(pacing);
    const projected = projectMonthEnd(pacing);
    if (pacing.thisMonthTotal >= pacing.monthlyBudget) {
      insights.push({
        tone: "warning",
        text: `You've already gone ${formatCurrency(pacing.thisMonthTotal - pacing.monthlyBudget)} past this month's budget.`,
      });
    } else if (projected > pacing.monthlyBudget) {
      const day = pacing.daysElapsed + Math.ceil((pacing.monthlyBudget - pacing.thisMonthTotal) / Math.max(typical, 1));
      const date = new Date(`${pacing.monthStart}T12:00:00`);
      date.setDate(day);
      const when = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
      insights.push({
        tone: "warning",
        text: `At your usual pace you'll reach your budget around ${when}. Keep to ${formatCurrency(
          (pacing.monthlyBudget - pacing.thisMonthTotal) / Math.max(pacing.daysInMonth - pacing.daysElapsed, 1)
        )} a day to stay within it.`,
      });
    } else {
      insights.push({
        tone: "good",
        text: `On track: about ${formatCurrency(projected)} by month-end, leaving ${formatCurrency(pacing.monthlyBudget - projected)} of your budget.`,
      });
    }
  }

  // 3. Biggest category mover, against the same point last month.
  const movers = pacing.byCategory
    .map((c) => ({ ...c, delta: c.thisMonth - c.lastMonthToDate }))
    .filter((c) => c.lastMonthToDate > 0 && c.thisMonth > 0);
  const riser = movers.sort((a, b) => b.delta - a.delta)[0];
  if (riser && riser.delta > 0 && percent(riser.delta, riser.lastMonthToDate) >= 20) {
    insights.push({
      tone: "warning",
      text: `${getCategoryById(categories, riser.categoryId).name} is running ${percent(riser.delta, riser.lastMonthToDate)}% ahead of last month: ${formatCurrency(riser.thisMonth)} so far against ${formatCurrency(riser.lastMonthToDate)} by this day last month.`,
    });
  }

  // 4. Concentration over the selected range.
  const totals = new Map<string, number>();
  for (const m of trends.monthly) for (const c of m.byCategory) totals.set(c.categoryId, (totals.get(c.categoryId) ?? 0) + c.amount);
  const [topId, topAmount] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (topId && trends.stats.total > 0) {
    insights.push({
      tone: "neutral",
      text: `${getCategoryById(categories, topId).name} is your biggest category: ${percent(topAmount, trends.stats.total)}% of everything you spent in this period.`,
    });
  }

  // 5. Most expensive weekday, relative to a typical day.
  const typicalDay = trends.stats.days ? trends.stats.total / trends.stats.days : 0;
  const peak = [...trends.weekdays].sort((a, b) => b.average - a.average)[0];
  if (peak && typicalDay > 0 && peak.average >= typicalDay * 1.3) {
    insights.push({
      tone: "neutral",
      text: `${WEEKDAY_NAMES[peak.weekday]}s are your priciest day: ${formatCurrency(peak.average)} on average, ${(peak.average / typicalDay).toFixed(1)}× a typical day.`,
    });
  }

  // 6. Habit spotting.
  const habit = trends.frequent[0];
  if (habit && habit.count >= 3) {
    insights.push({
      tone: "neutral",
      text: `“${habit.title}” is a habit: ${habit.count} times for ${formatCurrency(habit.total)} in total, ${formatCurrency(habit.average)} each.`,
    });
  }

  // 7. No-spend days.
  const quiet = trends.stats.days - trends.stats.spendingDays;
  if (trends.stats.count > 0 && quiet > 0) {
    insights.push({
      tone: "good",
      text: `${quiet} of the last ${trends.stats.days} days (${percent(quiet, trends.stats.days)}%) had no spending at all.`,
    });
  }

  return insights;
}
