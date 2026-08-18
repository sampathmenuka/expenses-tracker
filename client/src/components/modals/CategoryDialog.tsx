import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_COLOR_OPTIONS } from "@/constants/categories";
import type { CategoryDraft } from "@/types/category";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (draft: CategoryDraft) => void;
}

export function CategoryDialog({
  isOpen,
  onClose,
  onAddCategory,
}: CategoryDialogProps) {
  const [draft, setDraft] = useState<CategoryDraft>({
    name: "",
    color: CATEGORY_COLOR_OPTIONS[1],
  });

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    onAddCategory(draft);
    setDraft({ name: "", color: CATEGORY_COLOR_OPTIONS[1] });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-5 bg-[#152d23]/40 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="w-[min(100%,390px)] p-6 border border-white/45 rounded-3xl bg-[#fffdf8] shadow-2xl animate-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-5">
          <div>
            <span className="text-[#6e8075] text-[9px] font-mono font-semibold uppercase tracking-wider">
              Make it yours
            </span>
            <h2
              id="category-title"
              className="mt-1 m-0 text-[#154734] font-serif text-2xl font-bold tracking-tight"
            >
              New expense type
            </h2>
          </div>
          <button
            className="w-8 h-8 border border-[#ded4c5] bg-[#fffdf8] text-[#315542] rounded-xl grid place-items-center transition-all hover:bg-[#e7efe4] active:scale-95"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label
              htmlFor="new-category"
              className="text-[#68776d] font-mono text-[9px] font-medium uppercase tracking-wider"
            >
              Category name
            </label>
            <input
              id="new-category"
              className="w-full h-10 px-3 border border-[#ded4c5] rounded-xl bg-[#fffdf8] text-[#234437] text-xs font-bold outline-none transition-all focus:border-[#6f957e] focus:ring-2 focus:ring-[#a9bea8]/30"
              autoFocus
              placeholder="e.g. Fitness"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-[#68776d] font-mono text-[9px] font-medium uppercase tracking-wider">
              Choose a colour
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  className={`w-7 h-7 p-0 border-[3px] border-[#fffdf8] rounded-full transition-all active:scale-95 ${
                    draft.color === color
                      ? "ring-2 ring-[#154734] scale-110"
                      : "hover:scale-105"
                  }`}
                  type="button"
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    setDraft((current) => ({ ...current, color }))
                  }
                  aria-label={`Choose ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              className="px-3.5 py-2 rounded-xl bg-[#eee6d8] text-[#5e7164] text-xs font-bold transition-all hover:bg-[#e2d8c7] active:scale-95"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-3.5 py-2 rounded-xl bg-[#154734] text-[#fffaf0] text-xs font-bold shadow-md shadow-[#154734]/15 transition-all hover:bg-[#0f392a] active:scale-95"
              type="submit"
            >
              Add category
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
