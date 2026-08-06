import { Plus, Trash2 } from "lucide-react";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";

interface CategoriesViewProps {
  categories: Category[];
  expenses: Expense[];
  onAdd: () => void;
  onRemoveCategory: (id: string) => void;
}

export function CategoriesView({
  categories,
  expenses,
  onAdd,
  onRemoveCategory,
}: CategoriesViewProps) {
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Your spending vocabulary</span>
          <h1>Categories</h1>
        </div>
        <button className="button-primary" onClick={onAdd}>
          <Plus style={{ width: 14, verticalAlign: "-2px", marginRight: 4 }} />{" "}
          New category
        </button>
      </header>

      <section className="report-top">
        <span className="eyebrow">Made to flex with your life</span>
        <h2>Every expense needs a home.</h2>
        <p>
          Your original categories are ready. Add as many personal expense types
          as you need.
        </p>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>Available categories</h2>
            <p>{categories.length} ways to organize your spending.</p>
          </div>
        </div>
        <div className="category-board">
          <div className="category-grid">
            {categories.map((category) => {
              const entries = expenses.filter(
                (expense) => expense.categoryId === category.id
              ).length;

              return (
                <article className="category-tile" key={category.id}>
                  <CategoryBadge
                    category={category}
                    className="category-tile-icon"
                  />
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center justify-between">
                      <h3>{category.name}</h3>
                      {category.isCustom && (
                        <button
                          className="delete-button opacity-100 p-1 text-red-500 hover:bg-red-50"
                          onClick={() => onRemoveCategory(category.id)}
                          title="Delete custom category"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p>
                      {entries} recorded item{entries === 1 ? "" : "s"}
                    </p>
                    {category.isCustom && (
                      <span className="custom-tag">Custom</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
