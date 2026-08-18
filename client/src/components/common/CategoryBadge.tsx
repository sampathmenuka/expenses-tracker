import { ICON_MAP } from "@/constants/categories";
import type { Category } from "@/types/category";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const Icon = ICON_MAP[category.icon] || ICON_MAP.custom;

  return (
    <span
      className={
        className ||
        "grid place-items-center shrink-0 w-[31px] h-[31px] rounded-[9px] [&_svg]:w-4 [&_svg]:h-4"
      }
      style={{
        color: category.color,
        background: `${category.color}20`,
      }}
    >
      <Icon />
    </span>
  );
}
