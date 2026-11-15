import type { Expense } from "@/types/expense";

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CategoryTotal {
  categoryId: string;
  amount: number;
  count: number;
}

export interface Report {
  start: string;
  end: string;
  total: number;
  count: number;
  previousTotal: number;
  daily: { date: string; amount: number }[];
  byCategory: CategoryTotal[];
}

export interface Dashboard {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  weekCount: number;
  monthTotal: number;
  monthCount: number;
  monthlyBudget: number | null;
  monthByCategory: CategoryTotal[];
  categoryBudgets: { categoryId: string; budget: number; spent: number }[];
}

export interface Pacing {
  monthStart: string;
  daysInMonth: number;
  daysElapsed: number;
  thisMonthDaily: number[];
  lastMonthDaily: number[];
  thisMonthTotal: number;
  lastMonthTotal: number;
  lastMonthSamePoint: number;
  monthlyBudget: number | null;
  byCategory: { categoryId: string; thisMonth: number; lastMonth: number; lastMonthToDate: number }[];
}

export interface Trends {
  start: string;
  end: string;
  stats: {
    total: number;
    count: number;
    averageTransaction: number;
    medianTransaction: number;
    days: number;
    spendingDays: number;
    averagePerMonth: number;
  };
  monthly: { month: string; total: number; byCategory: CategoryTotal[] }[];
  weekdays: { weekday: number; total: number; count: number; occurrences: number; average: number }[];
  daily: { date: string; amount: number }[];
  frequent: { title: string; count: number; total: number; average: number; categoryId: string }[];
  largest: Expense[];
}
