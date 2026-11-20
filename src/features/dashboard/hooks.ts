import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";
import { dashboardKeys } from "./keys";

const opts = { staleTime: 60_000 };

export const useSummaryQuery = (range: string) =>
  useQuery({
    queryKey: dashboardKeys.summary(range),
    queryFn: ({ signal }) => dashboardApi.summary(range, signal),
    ...opts,
  });
export const useOverTimeQuery = (range: string) =>
  useQuery({
    queryKey: dashboardKeys.overTime(range),
    queryFn: ({ signal }) => dashboardApi.overTime(range, signal),
    ...opts,
  });
export const usePerDoctorQuery = (limit = 10) =>
  useQuery({
    queryKey: dashboardKeys.perDoctor(limit),
    queryFn: ({ signal }) => dashboardApi.perDoctor(limit, signal),
    ...opts,
  });
export const useConditionsQuery = () =>
  useQuery({
    queryKey: dashboardKeys.conditions(),
    queryFn: ({ signal }) => dashboardApi.conditions(signal),
    ...opts,
  });
export const useSpecializationsQuery = (limit = 8) =>
  useQuery({
    queryKey: dashboardKeys.specializations(limit),
    queryFn: ({ signal }) => dashboardApi.specializations(limit, signal),
    ...opts,
  });
export const useRecentQuery = (limit = 5) =>
  useQuery({
    queryKey: dashboardKeys.recent(limit),
    queryFn: ({ signal }) => dashboardApi.recent(limit, signal),
    ...opts,
  });
