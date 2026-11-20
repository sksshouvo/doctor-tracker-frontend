"use client";

import { Plus, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientFormSheet } from "@/features/patients/components/PatientFormSheet";
import { PatientsTable } from "@/features/patients/components/PatientsTable";
import { toApiError } from "@/lib/api-error";
import { useDoctorQuery } from "../hooks";
import { DeleteDoctorDialog } from "./DeleteDoctorDialog";
import { DoctorFormDialog } from "./DoctorFormDialog";
import { DoctorProfileCard } from "./DoctorProfileCard";
import { DoctorStatsRow } from "./DoctorStatsRow";

export function DoctorDetailView({ id }: { id: string }) {
  const router = useRouter();
  const query = useDoctorQuery(id);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);

  if (query.isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (query.isError) {
    const e = toApiError(query.error);
    if (e.status === 404 || e.code === "VALIDATION_ERROR") {
      return (
        <EmptyState
          icon={UserX}
          title="Doctor not found"
          description="This doctor doesn't exist or was deleted."
          action={
            <Link href="/doctors" className={buttonVariants()}>
              Back to doctors
            </Link>
          }
        />
      );
    }
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const doctor = query.data!;
  return (
    <>
      <Breadcrumbs items={[{ label: "Doctors", href: "/doctors" }, { label: doctor.name }]} />
      <DoctorProfileCard
        doctor={doctor}
        onEdit={() => setEditing(true)}
        onDelete={() => setDeleting(true)}
      />
      <DoctorStatsRow stats={doctor.stats} />

      <section aria-labelledby="doctor-patients" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="doctor-patients" className="text-lg font-semibold">
            Patients
          </h2>
          <Button onClick={() => setAddingPatient(true)}>
            <Plus aria-hidden /> Add patient
          </Button>
        </div>
        <PatientsTable
          doctor={{ id: doctor.id, name: doctor.name }}
          openCreate={() => setAddingPatient(true)}
        />
      </section>

      <PatientFormSheet
        open={addingPatient}
        onOpenChange={setAddingPatient}
        lockedDoctor={{ id: doctor.id, name: doctor.name }}
      />
      <DoctorFormDialog open={editing} onOpenChange={setEditing} doctor={editing ? doctor : null} />
      <DeleteDoctorDialog
        doctor={deleting ? doctor : null}
        onOpenChange={(o) => !o && setDeleting(false)}
        onDeleted={() => router.replace("/doctors")}
      />
    </>
  );
}
