import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { CATEGORIES_KEY } from "@/hooks/useCategories";
import { api, errorMessage } from "@/lib/api";
import type {
  Expense,
  ExpenseFilters,
  ExpenseInput,
  ExpensePage,
} from "@/types/expense";

const PAGE_SIZE = 30;

function cleanParams(filters: ExpenseFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
  );
}

export function useExpenses(filters: ExpenseFilters) {
  const query = useInfiniteQuery({
    queryKey: ["expenses", filters],
    queryFn: async ({ pageParam }) =>
      (
        await api.get<ExpensePage>("/expenses", {
          params: { ...cleanParams(filters), limit: PAGE_SIZE, offset: pageParam },
        })
      ).data,
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, page) => n + page.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
  });

  const firstPage = query.data?.pages[0];
  return {
    expenses: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: firstPage?.total ?? 0,
    totalAmount: firstPage?.totalAmount ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasMore: query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    isLoadingMore: query.isFetchingNextPage,
  };
}

/** Everything derived from expenses needs refreshing after a write. */
function useInvalidateExpenseViews() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["expenses"] }),
      queryClient.invalidateQueries({ queryKey: ["reports"] }),
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    ]);
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenseViews();
  return useMutation({
    mutationFn: async (input: ExpenseInput) =>
      (await api.post<Expense>("/expenses", input)).data,
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(errorMessage(error, "Couldn't save that expense.")),
  });
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenseViews();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ExpenseInput }) =>
      (await api.patch<Expense>(`/expenses/${id}`, input)).data,
    onSuccess: () => {
      invalidate();
      toast.success("Expense updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn't update that expense.")),
  });
}

/** Deletes immediately and offers an Undo that restores the same entry. */
export function useDeleteExpense() {
  const invalidate = useInvalidateExpenseViews();
  const create = useCreateExpense();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      await api.delete(`/expenses/${expense.id}`);
      return expense;
    },
    onSuccess: (expense) => {
      invalidate();
      toast.success(`Removed “${expense.title}”.`, {
        action: {
          label: "Undo",
          onClick: () =>
            create.mutate(
              {
                title: expense.title,
                amount: expense.amount,
                categoryId: expense.categoryId,
                date: expense.date,
                note: expense.note,
              },
              { onSuccess: () => toast.success("Expense restored.") }
            ),
        },
      });
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn't remove that expense.")),
  });
}
