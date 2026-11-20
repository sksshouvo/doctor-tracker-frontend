import { api } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  ConditionCount,
  OverTime,
  PerDoctor,
  RecentPatient,
  SpecializationCount,
  Summary,
} from "./types";

const get = <T>(url: string, params?: Record<string, string | number>, signal?: AbortSignal) =>
  api.get<ApiSuccess<T>>(`/dashboard/${url}`, { params, signal }).then((r) => r.data.data);

export const dashboardApi = {
  summary: (range: string, signal?: AbortSignal) => get<Summary>("summary", { range }, signal),
  overTime: (range: string, signal?: AbortSignal) =>
    get<OverTime>("patients-over-time", { range }, signal),
  perDoctor: (limit: number, signal?: AbortSignal) =>
    get<PerDoctor[]>("patients-per-doctor", { limit }, signal),
  conditions: (signal?: AbortSignal) =>
    get<ConditionCount[]>("condition-distribution", undefined, signal),
  specializations: (limit: number, signal?: AbortSignal) =>
    get<SpecializationCount[]>("specialization-distribution", { limit }, signal),
  recent: (limit: number, signal?: AbortSignal) =>
    get<RecentPatient[]>("recent-patients", { limit }, signal),
};
