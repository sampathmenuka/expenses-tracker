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

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Foods", color: "#d6805d", icon: "food" },
  { id: "transport", name: "Transport", color: "#4f8b83", icon: "transport" },
  { id: "mobile", name: "Data & Mobile", color: "#657cc3", icon: "mobile" },
  { id: "education", name: "Education", color: "#a26caa", icon: "education" },
  { id: "materials", name: "Materials", color: "#a78a64", icon: "materials" },
  { id: "clothes", name: "Clothes", color: "#bf7488", icon: "clothes" },
  { id: "donations", name: "Donations", color: "#7fa36c", icon: "donations" },
  { id: "other", name: "Other", color: "#86949a", icon: "other" },
];

export const CATEGORY_COLOR_OPTIONS = [
  "#d6805d",
  "#4f8b83",
  "#657cc3",
  "#a26caa",
  "#a78a64",
  "#bf7488",
  "#7fa36c",
  "#86949a",
];

export function getCategoryById(categories: Category[], categoryId: string): Category {
  return categories.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORIES[7];
}
