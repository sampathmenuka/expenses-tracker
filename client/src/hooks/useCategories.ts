import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import type { Category, CategoryDraft } from "@/types/category";

export const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
  const query = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
    staleTime: 60_000,
  });
  return { categories: query.data ?? [], isLoading: query.isLoading };
}

function useInvalidateAfterCategoryChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useSaveCategory() {
  const invalidate = useInvalidateAfterCategoryChange();
  return useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: CategoryDraft }) => {
      const { data } = id
        ? await api.patch<Category>(`/categories/${id}`, draft)
        : await api.post<Category>("/categories", draft);
      return data;
    },
    onSuccess: (category, { id }) => {
      invalidate();
      toast.success(id ? `${category.name} updated.` : `${category.name} is ready to use.`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateAfterCategoryChange();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Category removed. Its expenses moved to Other.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
