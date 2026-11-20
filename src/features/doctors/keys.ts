import type { DoctorListParams } from "./types";

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (p: DoctorListParams) => [...doctorKeys.lists(), p] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  options: (q: string) => [...doctorKeys.all, "options", q] as const,
  facets: () => [...doctorKeys.all, "facets"] as const,
};
