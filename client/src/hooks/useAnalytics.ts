import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Pacing, Trends } from "@/types/api";
import { dateKey } from "@/utils/date";

export function usePacing() {
  const today = dateKey(new Date());
  return useQuery({
    queryKey: ["reports", "pacing", today],
    queryFn: async () => (await api.get<Pacing>("/analytics/pacing", { params: { today } })).data,
  });
}

export function useTrends(months: number) {
  const today = dateKey(new Date());
  return useQuery({
    queryKey: ["reports", "trends", today, months],
    queryFn: async () =>
      (await api.get<Trends>("/analytics/trends", { params: { today, months } })).data,
    // Keep the previous charts on screen while a new range loads.
    placeholderData: keepPreviousData,
  });
}
