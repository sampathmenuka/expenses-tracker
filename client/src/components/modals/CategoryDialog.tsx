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
    onAddCategory(draft);
    setDraft({ name: "", color: CATEGORY_COLOR_OPTIONS[1] });
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="category-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <div>
            <span className="eyebrow">Make it yours</span>
            <h2 id="category-title">New expense type</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X />
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="field-stack">
            <label htmlFor="new-category">Category name</label>
            <input
              id="new-category"
              className="ledger-input"
              autoFocus
              placeholder="e.g. Fitness"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <div className="field-stack">
            <label>Choose a colour</label>
            <div className="color-options">
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  className={`color-choice ${draft.color === color ? "selected" : ""}`}
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

          <div className="dialog-actions">
            <button
              className="button-secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button-primary" type="submit">
              Add category
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
