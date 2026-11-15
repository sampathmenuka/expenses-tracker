export type CategoryIconKey =
  | "food"
  | "transport"
  | "mobile"
  | "education"
  | "materials"
  | "clothes"
  | "donations"
  | "other"
  | "custom";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: CategoryIconKey;
  isCustom: boolean;
  isFallback: boolean;
  monthlyBudget: number | null;
  expenseCount: number;
}

export interface CategoryDraft {
  name: string;
  color: string;
  monthlyBudget: number | null;
}
