"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDeletePatient } from "../hooks";
import type { Patient } from "../types";

type Props = {
  patient: Patient | null;
  onOpenChange: (open: boolean) => void;
  /** Doctor-detail mode: wording and endpoint change to "remove from this doctor's list". */
  doctor?: { id: string; name: string } | null;
};

export function DeletePatientDialog({ patient, onOpenChange, doctor }: Props) {
  const del = useDeletePatient(doctor?.id);

  function confirm() {
    if (!patient) return;
    const name = patient.name;
    onOpenChange(false); // optimistic: the row disappears immediately
    del.mutate(patient.id, {
      onSuccess: () => toast.success(`${name} deleted`),
    });
  }

  return (
    <ConfirmDialog
      open={!!patient}
      onOpenChange={onOpenChange}
      title={
        doctor ? `Remove ${patient?.name ?? "patient"}?` : `Delete ${patient?.name ?? "patient"}?`
      }
      description={
        doctor
          ? `Remove ${patient?.name} from ${doctor.name}'s list? This deletes the patient record. This can't be undone.`
          : "This permanently removes the patient record. This can't be undone."
      }
      confirmLabel={doctor ? "Remove patient" : "Delete patient"}
      destructive
      onConfirm={confirm}
    />
  );
}
