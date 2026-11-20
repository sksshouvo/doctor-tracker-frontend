import { api } from "@/lib/api-client";
import { toQuery } from "@/lib/query-string";
import type { ApiList, ApiSuccess } from "@/types/api";
import type {
  Doctor,
  DoctorDetail,
  DoctorFacets,
  DoctorInput,
  DoctorListParams,
  DoctorOption,
} from "./types";

export const doctorsApi = {
  list: (params: DoctorListParams, signal?: AbortSignal) =>
    api.get<ApiList<Doctor>>("/doctors", { params: toQuery(params), signal }).then((r) => r.data),
  get: (id: string, signal?: AbortSignal) =>
    api.get<ApiSuccess<DoctorDetail>>(`/doctors/${id}`, { signal }).then((r) => r.data.data),
  options: (q: string, signal?: AbortSignal) =>
    api
      .get<ApiSuccess<DoctorOption[]>>("/doctors/options", {
        params: toQuery({ q, limit: 20 }),
        signal,
      })
      .then((r) => r.data.data),
  facets: (signal?: AbortSignal) =>
    api.get<ApiSuccess<DoctorFacets>>("/doctors/facets", { signal }).then((r) => r.data.data),
  create: (body: DoctorInput) =>
    api.post<ApiSuccess<Doctor>>("/doctors", body).then((r) => r.data.data),
  update: (id: string, body: Partial<DoctorInput>) =>
    api.patch<ApiSuccess<Doctor>>(`/doctors/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/doctors/${id}`),
};
