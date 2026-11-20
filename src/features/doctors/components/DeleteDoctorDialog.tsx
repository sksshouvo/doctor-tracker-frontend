"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { toApiError } from "@/lib/api-error";
import { useDeleteDoctor } from "../hooks";
import type { Doctor } from "../types";

type Props = {
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeleteDoctorDialog({ doctor, onOpenChange, onDeleted }: Props) {
  const del = useDeleteDoctor();
  const [blockedCount, setBlockedCount] = useState<number | null>(null);

  const close = (open: boolean) => {
    if (!open) setBlockedCount(null);
    onOpenChange(open);
  };

  async function confirm() {
    if (!doctor) return;
    try {
      await del.mutateAsync(doctor.id);
      toast.success(`${doctor.name} deleted`);
      close(false);
      onDeleted?.();
    } catch (err) {
      const e = toApiError(err);
      if (e.status === 409 && e.code === "DOCTOR_HAS_PATIENTS") {
        setBlockedCount(Number(e.details[0]?.message ?? doctor.patientCount ?? 0));
      } else {
        toast.error(e.message, { description: e.requestId && `Request ID: ${e.requestId}` });
      }
    }
  }

  const blocked = blockedCount !== null;
  return (
    <ConfirmDialog
      open={!!doctor}
      onOpenChange={close}
      title={blocked ? "Can't delete this doctor" : `Delete ${doctor?.name ?? "doctor"}?`}
      description={
        blocked
          ? `${doctor?.name} still has ${blockedCount} ${blockedCount === 1 ? "patient" : "patients"}. Reassign or delete them before deleting this doctor.`
          : "This permanently removes the doctor record. This can't be undone."
      }
      confirmLabel="Delete doctor"
      destructive
      pending={del.isPending}
      onConfirm={confirm}
      footer={
        blocked && doctor ? (
          <>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Link href={`/doctors/${doctor.id}`} className={buttonVariants()}>
              View patients
            </Link>
          </>
        ) : undefined
      }
    />
  );
}
