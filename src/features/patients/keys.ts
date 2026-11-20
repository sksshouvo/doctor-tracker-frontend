import type { PatientListParams } from "./types";

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (scope: string, p: PatientListParams) => [...patientKeys.lists(), scope, p] as const,
};
