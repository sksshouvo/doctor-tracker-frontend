import { api } from "@/lib/api-client";
import { toQuery } from "@/lib/query-string";
import type { ApiList, ApiSuccess } from "@/types/api";
import type { Patient, PatientInput, PatientListParams } from "./types";

type ListScope = { doctorId?: string };

export const patientsApi = {
  /** `scope.doctorId` switches to the doctor sub-resource endpoint. */
  list: (params: PatientListParams, scope: ListScope = {}, signal?: AbortSignal) => {
    const { doctorId, ...rest } = params;
    const url = scope.doctorId ? `/doctors/${scope.doctorId}/patients` : "/patients";
    return api
      .get<ApiList<Patient>>(url, {
        params: toQuery(scope.doctorId ? rest : { ...rest, doctorId }),
        signal,
      })
      .then((r) => r.data);
  },
  create: (body: PatientInput) =>
    api.post<ApiSuccess<Patient>>("/patients", body).then((r) => r.data.data),
  createForDoctor: (doctorId: string, body: Omit<PatientInput, "doctorId">) =>
    api.post<ApiSuccess<Patient>>(`/doctors/${doctorId}/patients`, body).then((r) => r.data.data),
  update: (id: string, body: Partial<PatientInput>) =>
    api.patch<ApiSuccess<Patient>>(`/patients/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/patients/${id}`),
  removeFromDoctor: (doctorId: string, patientId: string) =>
    api.delete(`/doctors/${doctorId}/patients/${patientId}`),
};
