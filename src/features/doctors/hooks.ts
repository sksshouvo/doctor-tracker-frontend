import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/keys";
import { patientKeys } from "@/features/patients/keys";
import { doctorsApi } from "./api";
import { doctorKeys } from "./keys";
import type { DoctorInput, DoctorListParams } from "./types";

export function useDoctorsQuery(params: DoctorListParams) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: ({ signal }) => doctorsApi.list(params, signal), // AbortSignal cancels stale requests
    placeholderData: keepPreviousData, // no flicker between pages/filters
    staleTime: 30_000,
  });
}

export function useDoctorQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: doctorKeys.detail(id ?? ""),
    queryFn: ({ signal }) => doctorsApi.get(id!, signal),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useDoctorFacetsQuery() {
  return useQuery({
    queryKey: doctorKeys.facets(),
    queryFn: ({ signal }) => doctorsApi.facets(signal),
    staleTime: 5 * 60_000,
  });
}

export function useDoctorOptionsQuery(q: string, enabled = true) {
  return useQuery({
    queryKey: doctorKeys.options(q),
    queryFn: ({ signal }) => doctorsApi.options(q, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

/** Everything that can display doctor data or counts. */
function useInvalidateDoctorData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: doctorKeys.all }),
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useCreateDoctor() {
  const invalidate = useInvalidateDoctorData();
  return useMutation({
    mutationFn: (body: DoctorInput) => doctorsApi.create(body),
    meta: { silent: true }, // the form maps server errors to fields
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor() {
  const invalidate = useInvalidateDoctorData();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DoctorInput> }) =>
      doctorsApi.update(id, body),
    meta: { silent: true },
    onSuccess: async () => {
      await invalidate();
      qc.invalidateQueries({ queryKey: patientKeys.lists() }); // patient rows embed the doctor name
    },
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidateDoctorData();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.remove(id),
    meta: { silent: true }, // 409 is handled inside the dialog
    onSuccess: invalidate,
  });
}
