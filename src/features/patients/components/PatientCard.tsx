import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { ConditionBadge } from "@/components/common/ConditionBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Patient } from "../types";

type Props = {
  patient: Patient;
  showDoctor: boolean;
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
};

export const PatientCard = memo(function PatientCard({
  patient,
  showDoctor,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-card space-y-2 rounded-xl border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{patient.name}</p>
          <p className="text-muted-foreground text-xs capitalize">
            {patient.age} · {patient.gender}
          </p>
        </div>
        <ConditionBadge condition={patient.condition} />
      </div>
      <p className="truncate text-sm">{patient.diagnosis}</p>
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate">
          {showDoctor && patient.doctor.name ? (
            <Link
              href={`/doctors/${patient.doctor.id}`}
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              {patient.doctor.name}
            </Link>
          ) : null}
        </span>
        <span className="tabular shrink-0">{formatDate(patient.visitDate)}</span>
      </div>
      <div className="flex justify-end gap-1 border-t pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(patient)}
          aria-label={`Edit ${patient.name}`}
        >
          <Pencil aria-hidden /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600 hover:text-rose-700"
          onClick={() => onDelete(patient)}
          aria-label={`Delete ${patient.name}`}
        >
          <Trash2 aria-hidden /> Delete
        </Button>
      </div>
    </div>
  );
});
