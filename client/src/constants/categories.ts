import {
  BookOpen,
  Bus,
  CircleEllipsis,
  Heart,
  Package,
  Shirt,
  Smartphone,
  Tags,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { SERIES_COLORS } from "@/constants/chart";
import type { Category, CategoryIconKey } from "@/types/category";

export const ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  food: Utensils,
  transport: Bus,
  mobile: Smartphone,
  education: BookOpen,
  materials: Package,
  clothes: Shirt,
  donations: Heart,
  other: CircleEllipsis,
  custom: Tags,
};

// Same validated order as the chart palette, so categories stay distinct in charts.
export const CATEGORY_COLOR_OPTIONS = SERIES_COLORS;

const UNKNOWN_CATEGORY: Category = {
  id: "unknown",
  name: "Uncategorised",
  color: "#86949a",
  icon: "other",
  isCustom: false,
  isFallback: false,
  monthlyBudget: null,
  expenseCount: 0,
};

export function getCategoryById(categories: Category[], categoryId: string): Category {
  return categories.find((c) => c.id === categoryId) ?? UNKNOWN_CATEGORY;
}
