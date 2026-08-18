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
  isCustom?: boolean;
}

export interface CategoryDraft {
  name: string;
  color: string;
}
