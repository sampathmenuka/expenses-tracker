import type { Pacing } from "@/types/api";

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * A typical day's spend: the median across last month and this month so far.
 * Unlike the mean, one-off payments (rent, a course fee) barely move it.
 */
export function typicalDailySpend(p: Pacing): number {
  return median([...p.lastMonthDaily, ...p.thisMonthDaily.slice(0, p.daysElapsed)]);
}

/** What's spent so far plus a typical day for each remaining day. */
export function projectMonthEnd(p: Pacing): number {
  return p.thisMonthTotal + typicalDailySpend(p) * (p.daysInMonth - p.daysElapsed);
}
