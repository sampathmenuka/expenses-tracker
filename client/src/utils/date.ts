import type { ReportPeriod } from "@/types/navigation";

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromKey(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

export function getMonthKey(date: Date = new Date()): string {
  return dateKey(date).slice(0, 7);
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function shiftDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function shortDay(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export interface DateRange {
  start: Date;
  end: Date;
  startKey: string;
  endKey: string;
}

export function getWeekRange(date: Date = new Date()): DateRange {
  const start = startOfWeek(date);
  const end = shiftDays(start, 6);
  return {
    start,
    end,
    startKey: dateKey(start),
    endKey: dateKey(end),
  };
}

export function getMonthRange(date: Date = new Date()): DateRange {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start,
    end,
    startKey: dateKey(start),
    endKey: dateKey(end),
  };
}

export function getPeriodRange(
  period: ReportPeriod,
  date: Date = new Date()
): { current: DateRange; previous: DateRange } {
  if (period === "weekly") {
    const current = getWeekRange(date);
    const prevStart = shiftDays(current.start, -7);
    const prevEnd = shiftDays(current.start, -1);
    return {
      current,
      previous: {
        start: prevStart,
        end: prevEnd,
        startKey: dateKey(prevStart),
        endKey: dateKey(prevEnd),
      },
    };
  }

  const current = getMonthRange(date);
  const prevStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const prevEnd = new Date(date.getFullYear(), date.getMonth(), 0);
  return {
    current,
    previous: {
      start: prevStart,
      end: prevEnd,
      startKey: dateKey(prevStart),
      endKey: dateKey(prevEnd),
    },
  };
}
