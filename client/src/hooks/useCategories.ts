import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import type { Category, CategoryDraft } from "@/types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch {
      toast.error("Your saved categories could not be opened.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }, [categories, isHydrated]);

  const addCustomCategory = (draft: CategoryDraft): Category | null => {
    const name = draft.name.trim();
    if (!name) {
      toast.error("Give this expense type a name.");
      return null;
    }
    if (
      categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      toast.error("That category already exists.");
      return null;
    }

    const newCategory: Category = {
      id: `custom-${crypto.randomUUID()}`,
      name,
      color: draft.color,
      icon: "custom",
      isCustom: true,
    };

    setCategories((current) => [...current, newCategory]);
    toast.success(`${name} is ready to use.`);
    return newCategory;
  };

  const removeCategory = (id: string): void => {
    setCategories((current) => current.filter((c) => c.id !== id));
    toast.success("Custom category removed.");
  };

  return {
    categories,
    isHydrated,
    addCustomCategory,
    removeCategory,
  };
}
