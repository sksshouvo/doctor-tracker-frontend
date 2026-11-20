"use client";

import { useQueryClient } from "@tanstack/react-query";
import { SearchX, Stethoscope, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { doctorsApi } from "../api";
import { useDoctorsQuery } from "../hooks";
import { doctorKeys } from "../keys";
import { DOCTOR_DEFAULT_SORT, doctorParams } from "../params";
import type { Doctor, DoctorListParams } from "../types";
import { DeleteDoctorDialog } from "./DeleteDoctorDialog";
import { DoctorCard } from "./DoctorCard";
import { DoctorFilters } from "./DoctorFilters";
import { DoctorFormDialog } from "./DoctorFormDialog";
import { doctorColumns } from "./doctorColumns";

export function DoctorsTable({ openCreate }: { openCreate: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [params, setParams] = useQueryStates(doctorParams, { history: "push", shallow: true });
  const query = useDoctorsQuery(params);
  const meta = query.data?.meta;

  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);

  // Any filter / search / limit change resets to page 1.
  const onFilter = useCallback(
    (patch: Partial<DoctorListParams>, opts?: { replace?: boolean }) =>
      setParams({ ...patch, page: 1 }, { history: opts?.replace ? "replace" : "push" }),
    [setParams],
  );
  const onSort = useCallback((sort: string) => setParams({ sort, page: 1 }), [setParams]);
  const onPageChange = useCallback((page: number) => setParams({ page }), [setParams]);
  const onLimitChange = useCallback((limit: number) => setParams({ limit, page: 1 }), [setParams]);
  const clearAll = useCallback(
    () => setParams({ q: "", specialization: [], hospital: [], from: null, to: null, page: 1 }),
    [setParams],
  );

  // After deleting the last row of a page, clamp to the last valid page.
  useEffect(() => {
    if (meta && params.page > meta.totalPages)
      setParams({ page: meta.totalPages }, { history: "replace" });
  }, [meta, params.page, setParams]);

  // Prefetch the next page so "Next" feels instant.
  useEffect(() => {
    if (!meta?.hasNextPage) return;
    const next = { ...params, page: params.page + 1 };
    qc.prefetchQuery({
      queryKey: doctorKeys.list(next),
      queryFn: ({ signal }) => doctorsApi.list(next, signal),
      staleTime: 30_000,
    });
  }, [meta?.hasNextPage, params, qc]);

  const columns = useMemo(
    () => doctorColumns({ sort: params.sort, onSort, onEdit: setEditing, onDelete: setDeleting }),
    [params.sort, onSort],
  );

  const onRowClick = useCallback((d: Doctor) => router.push(`/doctors/${d.id}`), [router]);
  const onRowPrefetch = useCallback(
    (d: Doctor) =>
      qc.prefetchQuery({
        queryKey: doctorKeys.detail(d.id),
        queryFn: ({ signal }) => doctorsApi.get(d.id, signal),
        staleTime: 30_000,
      }),
    [qc],
  );

  const hasFilters = !!(
    params.q ||
    params.specialization.length ||
    params.hospital.length ||
    params.from ||
    params.to
  );

  return (
    <div className="space-y-4">
      <DoctorFilters params={params} onFilter={onFilter} onClearAll={clearAll} />

      <DataTable<Doctor>
        caption="Doctors"
        columns={columns}
        data={query.data?.data}
        meta={meta}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        sort={params.sort || DOCTOR_DEFAULT_SORT}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onRowClick={onRowClick}
        onRowPrefetch={onRowPrefetch}
        hasFilters={hasFilters}
        renderMobileCard={(d) => <DoctorCard doctor={d} />}
        emptyState={
          <EmptyState
            icon={Stethoscope}
            title="No doctors yet"
            description="Add your first doctor to start tracking patients."
            action={
              <Button onClick={openCreate}>
                <Plus aria-hidden /> Add doctor
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

      <DoctorFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        doctor={editing}
      />
      <DeleteDoctorDialog doctor={deleting} onOpenChange={(o) => !o && setDeleting(null)} />
    </div>
  );
}
