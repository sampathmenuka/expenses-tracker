import type { CategoryTotal } from "@/types/api";
import type { Category } from "@/types/category";

let currency = "LKR";
let formatter = makeFormatter(currency);

function makeFormatter(code: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    });
  } catch {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  }
}

/** Called once the signed-in user's preferred currency is known. */
export function setCurrency(code: string): void {
  if (code === currency) return;
  currency = code;
  formatter = makeFormatter(code);
}

export function getCurrency(): string {
  return currency;
}

export function formatCurrency(value: number): string {
  return formatter.format(value);
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}

export interface CategoryBreakdownItem extends Category {
  amount: number;
  count: number;
}

/** Joins server-side category totals with category details, largest first. */
export function joinCategoryTotals(
  categories: Category[],
  totals: CategoryTotal[]
): CategoryBreakdownItem[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  return totals.flatMap((total) => {
    const category = byId.get(total.categoryId);
    return category ? [{ ...category, amount: total.amount, count: total.count }] : [];
  });
}
