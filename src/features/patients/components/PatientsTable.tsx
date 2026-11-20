"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus, SearchX, Users } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { patientsApi } from "../api";
import { usePatientsQuery } from "../hooks";
import { patientKeys } from "../keys";
import { PATIENT_DEFAULT_SORT, patientParams, patientUrlKeys } from "../params";
import type { Patient, PatientListParams } from "../types";
import { DeletePatientDialog } from "./DeletePatientDialog";
import { PatientCard } from "./PatientCard";
import { PatientFilters } from "./PatientFilters";
import { PatientFormSheet } from "./PatientFormSheet";
import { patientColumns } from "./patientColumns";

type Props = {
  /** `doctor` mode: embedded on the doctor-detail page, scoped to one doctor with prefixed URL keys. */
  doctor?: { id: string; name: string } | null;
  openCreate: () => void;
};

export function PatientsTable({ doctor, openCreate }: Props) {
  const scope = doctor ? "doctor" : "all";
  const qc = useQueryClient();
  const [params, setParams] = useQueryStates(patientParams, {
    history: "push",
    shallow: true,
    urlKeys: doctor ? patientUrlKeys : undefined,
  });
  const listParams: PatientListParams = useMemo(
    () => (doctor ? { ...params, doctorId: null } : params),
    [doctor, params],
  );
  const query = usePatientsQuery(listParams, { doctorId: doctor?.id });
  const meta = query.data?.meta;

  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);

  const onFilter = useCallback(
    (patch: Partial<PatientListParams>, opts?: { replace?: boolean }) =>
      setParams({ ...patch, page: 1 }, { history: opts?.replace ? "replace" : "push" }),
    [setParams],
  );
  const onSort = useCallback((sort: string) => setParams({ sort, page: 1 }), [setParams]);
  const onPageChange = useCallback((page: number) => setParams({ page }), [setParams]);
  const onLimitChange = useCallback((limit: number) => setParams({ limit, page: 1 }), [setParams]);
  const clearAll = useCallback(
    () =>
      setParams({
        q: "",
        condition: [],
        doctorId: null,
        gender: null,
        from: null,
        to: null,
        page: 1,
      }),
    [setParams],
  );

  useEffect(() => {
    if (meta && params.page > meta.totalPages)
      setParams({ page: meta.totalPages }, { history: "replace" });
  }, [meta, params.page, setParams]);

  useEffect(() => {
    if (!meta?.hasNextPage) return;
    const next = { ...listParams, page: listParams.page + 1 };
    qc.prefetchQuery({
      queryKey: patientKeys.list(doctor?.id ?? "all", next),
      queryFn: ({ signal }) => patientsApi.list(next, { doctorId: doctor?.id }, signal),
      staleTime: 30_000,
    });
  }, [meta?.hasNextPage, listParams, doctor?.id, qc]);

  const columns = useMemo(
    () =>
      patientColumns({
        sort: params.sort,
        onSort,
        onEdit: setEditing,
        onDelete: setDeleting,
        scope,
      }),
    [params.sort, onSort, scope],
  );

  const renderCard = useCallback(
    (p: Patient) => (
      <PatientCard patient={p} showDoctor={!doctor} onEdit={setEditing} onDelete={setDeleting} />
    ),
    [doctor],
  );

  const hasFilters = !!(
    params.q ||
    params.condition.length ||
    params.gender ||
    params.from ||
    params.to ||
    (!doctor && params.doctorId)
  );

  return (
    <div className="space-y-4">
      <PatientFilters
        params={listParams}
        onFilter={onFilter}
        onClearAll={clearAll}
        showDoctorFilter={!doctor}
      />

      <DataTable<Patient>
        caption={doctor ? `Patients of ${doctor.name}` : "Patients"}
        columns={columns}
        data={query.data?.data}
        meta={meta}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        sort={params.sort || PATIENT_DEFAULT_SORT}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        hasFilters={hasFilters}
        renderMobileCard={renderCard}
        emptyState={
          <EmptyState
            icon={Users}
            title={doctor ? `No patients assigned to ${doctor.name}` : "No patients yet"}
            description={
              doctor
                ? "Add the first patient to this doctor's list."
                : "Add your first patient to start tracking."
            }
            action={
              <Button onClick={openCreate}>
                <Plus aria-hidden /> Add patient
              </Button>
            }
          />
        }
        noResults={
          <EmptyState
            icon={SearchX}
            title="No results match your filters"
            description="Try a different search or remove some filters."
            action={
              <Button variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        }
      />

      <PatientFormSheet
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        patient={editing}
        lockedDoctor={null}
      />
      <DeletePatientDialog
        patient={deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        doctor={doctor}
      />
    </div>
  );
}
