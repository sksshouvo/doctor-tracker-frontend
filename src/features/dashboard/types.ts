import type { Condition } from "@/types/api";

export type Summary = {
  totalDoctors: number;
  totalPatients: number;
  newPatients: number;
  newPatientsPrev: number;
  newPatientsChangePct: number | null;
  criticalPatients: number;
};
export type OverTime = { granularity: "day" | "month"; points: { date: string; count: number }[] };
export type PerDoctor = { doctorId: string; name: string; specialization: string; count: number };
export type ConditionCount = { condition: Condition; count: number };
export type SpecializationCount = { specialization: string; count: number };
export type RecentPatient = {
  id: string;
  name: string;
  condition: Condition;
  doctor: { id: string; name: string } | null;
  createdAt: string;
};
