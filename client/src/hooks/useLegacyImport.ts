import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LEGACY_STORAGE_KEYS } from "@/constants/storage";
import { api, errorMessage } from "@/lib/api";

interface LegacyExpense {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
}

interface LegacyCategory {
  id: string;
  name: string;
  color: string;
}

// Names of the built-in categories in the offline version, keyed by their old ids.
const LEGACY_DEFAULT_NAMES: Record<string, string> = {
  food: "Foods",
  transport: "Transport",
  mobile: "Data & Mobile",
  education: "Education",
  materials: "Materials",
  clothes: "Clothes",
  donations: "Donations",
  other: "Other",
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function readLegacyExpenses(): LegacyExpense[] {
  const expenses = readJson<LegacyExpense[]>(LEGACY_STORAGE_KEYS.EXPENSES);
  if (!Array.isArray(expenses)) return [];
  return expenses.filter(
    (e) => e && typeof e.title === "string" && e.title.trim() && Number(e.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(e.date)
  );
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(LEGACY_STORAGE_KEYS.IMPORT_DISMISSED) === "1";
  } catch {
    return true;
  }
}

/** Finds expenses saved by the old offline-only version and uploads them. */
export function useLegacyImport() {
  const queryClient = useQueryClient();
  const [expenses, setExpenses] = useState(readLegacyExpenses);
  const [dismissed, setDismissed] = useState(isDismissed);

  const dismiss = () => {
    try {
      localStorage.setItem(LEGACY_STORAGE_KEYS.IMPORT_DISMISSED, "1");
    } catch {
      /* storage unavailable: hiding for this session is enough */
    }
    setDismissed(true);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const categories = readJson<LegacyCategory[]>(LEGACY_STORAGE_KEYS.CATEGORIES) ?? [];
      const byId = new Map(categories.map((c) => [c.id, c]));
      const payload = expenses.map((e) => {
        const category = byId.get(e.categoryId);
        return {
          title: e.title.trim().slice(0, 120),
          amount: Math.round(Number(e.amount) * 100) / 100,
          categoryName: category?.name ?? LEGACY_DEFAULT_NAMES[e.categoryId] ?? "Other",
          categoryColor: category?.color,
          date: e.date,
          note: e.note || null,
        };
      });
      return (await api.post<{ imported: number }>("/expenses/import", { expenses: payload })).data;
    },
    onSuccess: ({ imported }) => {
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEYS.EXPENSES);
        localStorage.removeItem(LEGACY_STORAGE_KEYS.CATEGORIES);
      } catch {
        /* nothing else to clean up */
      }
      setExpenses([]);
      queryClient.invalidateQueries();
      toast.success(`Imported ${imported} expense${imported === 1 ? "" : "s"} into your account.`);
    },
    onError: (error) => toast.error(errorMessage(error, "Import failed.")),
  });

  return {
    count: expenses.length,
    dismissed,
    dismiss,
    importAll: () => mutation.mutate(),
    isImporting: mutation.isPending,
  };
}
