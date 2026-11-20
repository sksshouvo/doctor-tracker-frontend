import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/keys";
import { doctorKeys } from "@/features/doctors/keys";
import type { ApiList } from "@/types/api";
import { patientsApi } from "./api";
import { patientKeys } from "./keys";
import type { Patient, PatientInput, PatientListParams } from "./types";

export function usePatientsQuery(params: PatientListParams, scope: { doctorId?: string } = {}) {
  return useQuery({
    queryKey: patientKeys.list(scope.doctorId ?? "all", params),
    queryFn: ({ signal }) => patientsApi.list(params, scope, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useInvalidatePatientData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: patientKeys.all }),
      qc.invalidateQueries({ queryKey: doctorKeys.all }), // counts + per-doctor stats
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useCreatePatient(doctorId?: string) {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (body: PatientInput) => {
      if (doctorId) {
        const { doctorId: _ignored, ...rest } = body;
        void _ignored;
        return patientsApi.createForDoctor(doctorId, rest);
      }
      return patientsApi.create(body);
    },
    meta: { silent: true },
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<PatientInput> }) =>
      patientsApi.update(id, body),
    meta: { silent: true },
    onSuccess: invalidate,
  });
}

type Snapshot = [QueryKey, ApiList<Patient> | undefined][];

/** Optimistic delete: removes the row immediately and rolls back if the request fails. */
export function useDeletePatient(doctorId?: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (id: string) =>
      doctorId ? patientsApi.removeFromDoctor(doctorId, id) : patientsApi.remove(id),
    meta: { errorMessage: "Couldn't delete the patient. The list was restored." },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: patientKeys.lists() });
      const snapshots = qc.getQueriesData<ApiList<Patient>>({
        queryKey: patientKeys.lists(),
      }) as Snapshot;
      qc.setQueriesData<ApiList<Patient>>(
        { queryKey: patientKeys.lists() },
        (old) =>
          old && {
            ...old,
            data: old.data.filter((p) => p.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          },
      );
      return { snapshots };
    },
    onError: (_e, _id, ctx) => ctx?.snapshots.forEach(([k, v]) => qc.setQueryData(k, v)),
    onSettled: invalidate,
  });
}
