export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (range: string) => [...dashboardKeys.all, "summary", range] as const,
  overTime: (range: string) => [...dashboardKeys.all, "over-time", range] as const,
  perDoctor: (limit: number) => [...dashboardKeys.all, "per-doctor", limit] as const,
  conditions: () => [...dashboardKeys.all, "conditions"] as const,
  specializations: (limit: number) => [...dashboardKeys.all, "specializations", limit] as const,
  recent: (limit: number) => [...dashboardKeys.all, "recent", limit] as const,
};
