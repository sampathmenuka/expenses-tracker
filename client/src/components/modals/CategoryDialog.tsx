import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import {
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
} from "@/components/common/styles";
import { CATEGORY_COLOR_OPTIONS } from "@/constants/categories";
import { useSaveCategory } from "@/hooks/useCategories";
import type { Category } from "@/types/category";
import { getCurrency } from "@/utils/format";

interface CategoryDialogProps {
  isOpen: boolean;
  /** When set, the dialog edits this category instead of creating one. */
  category?: Category | null;
  onClose: () => void;
  onSaved?: (category: Category) => void;
}

export function CategoryDialog({ isOpen, category, onClose, onSaved }: CategoryDialogProps) {
  const save = useSaveCategory();
  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLOR_OPTIONS[1]);
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(category?.name ?? "");
    setColor(category?.color ?? CATEGORY_COLOR_OPTIONS[1]);
    setBudget(category?.monthlyBudget ? String(category.monthlyBudget) : "");
  }, [isOpen, category]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Give this expense type a name.");
      return;
    }
    const monthlyBudget = budget ? Number(budget) : null;
    if (monthlyBudget !== null && (!Number.isFinite(monthlyBudget) || monthlyBudget < 0)) {
      toast.error("The monthly limit must be a positive number.");
      return;
    }
    save.mutate(
      { id: category?.id, draft: { name: name.trim(), color, monthlyBudget } },
      {
        onSuccess: (saved) => {
          onSaved?.(saved);
          onClose();
        },
      }
    );
  };

  const editing = Boolean(category);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      eyebrow={editing ? "Fine-tune" : "Make it yours"}
      title={editing ? `Edit ${category?.name}` : "New expense type"}
    >
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="category-name" className={labelClass}>Category name</label>
          <input
            id="category-name"
            className={inputClass}
            autoFocus
            maxLength={60}
            placeholder="e.g. Fitness"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <fieldset className="grid gap-1.5 border-0 p-0 m-0">
          <legend className={`${labelClass} mb-1.5`}>Choose a colour</legend>
          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORY_COLOR_OPTIONS.map((option) => (
              <button
                key={option}
                className={`w-7 h-7 p-0 border-[3px] border-[#fffdf8] rounded-full transition-all active:scale-95 ${
                  color === option ? "ring-2 ring-[#154734] scale-110" : "hover:scale-105"
                }`}
                type="button"
                style={{ backgroundColor: option }}
                onClick={() => setColor(option)}
                aria-label={`Choose colour ${option}`}
                aria-pressed={color === option}
              />
            ))}
          </div>
        </fieldset>

        <div className="grid gap-1.5">
          <label htmlFor="category-budget" className={labelClass}>
            Monthly limit ({getCurrency()}, optional)
          </label>
          <input
            id="category-budget"
            className={`${inputClass} font-mono`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <p className="m-0 text-[#5f6962] text-[10px]">
            You'll see a progress bar and a warning as you approach it.
          </p>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <button className={secondaryButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={primaryButton} type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : editing ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
