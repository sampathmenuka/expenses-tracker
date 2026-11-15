import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Dashboard, Report } from "@/types/api";
import { dateKey } from "@/utils/date";

export function useDashboard() {
  const today = dateKey(new Date());
  return useQuery({
    queryKey: ["reports", "dashboard", today],
    queryFn: async () =>
      (await api.get<Dashboard>("/reports/dashboard", { params: { today } })).data,
  });
}

export function useReport(start: string, end: string) {
  return useQuery({
    queryKey: ["reports", "summary", start, end],
    queryFn: async () =>
      (await api.get<Report>("/reports/summary", { params: { start, end } })).data,
    placeholderData: keepPreviousData,
  });
}
