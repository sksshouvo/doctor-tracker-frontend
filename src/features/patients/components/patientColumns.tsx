import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { ConditionBadge } from "@/components/common/ConditionBadge";
import { SortableHeader } from "@/components/data-table/SortableHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatDateTime } from "@/lib/format";
import { PATIENT_DEFAULT_SORT } from "../params";
import type { Patient } from "../types";

type Handlers = {
  sort: string;
  onSort: (sort: string) => void;
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
  scope: "all" | "doctor";
};

const PatientCell = memo(function PatientCell({ patient }: { patient: Patient }) {
  return (
    <div className="min-w-0">
      <p className="max-w-56 truncate text-sm font-medium">{patient.name}</p>
      <p className="text-muted-foreground text-xs capitalize">
        {patient.age} · {patient.gender}
      </p>
    </div>
  );
});

const DiagnosisCell = memo(function DiagnosisCell({ value }: { value: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block max-w-48 cursor-default truncate text-sm">{value}</span>
      </TooltipTrigger>
      <TooltipContent>{value}</TooltipContent>
    </Tooltip>
  );
});

const ActionsCell = memo(function ActionsCell({
  patient,
  onEdit,
  onDelete,
  scope,
}: { patient: Patient } & Pick<Handlers, "onEdit" | "onDelete" | "scope">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${patient.name}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(patient)}>
          <Pencil aria-hidden /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(patient)}>
          <Trash2 aria-hidden /> {scope === "doctor" ? "Remove" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function patientColumns({
  sort,
  onSort,
  onEdit,
  onDelete,
  scope,
}: Handlers): ColumnDef<Patient, unknown>[] {
  const header = (label: string, field: string) => (
    <SortableHeader
      label={label}
      field={field}
      sort={sort}
      defaultSort={PATIENT_DEFAULT_SORT}
      onSort={onSort}
    />
  );
  const cols: ColumnDef<Patient, unknown>[] = [
    {
      id: "name",
      header: () => header("Patient", "name"),
      meta: { sortField: "name" },
      cell: ({ row }) => <PatientCell patient={row.original} />,
    },
    {
      id: "condition",
      header: "Condition",
      cell: ({ row }) => <ConditionBadge condition={row.original.condition} />,
    },
    {
      id: "diagnosis",
      header: "Diagnosis",
      cell: ({ row }) => <DiagnosisCell value={row.original.diagnosis} />,
    },
  ];
  if (scope === "all") {
    cols.push({
      id: "doctor",
      header: "Doctor",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => {
        const d = row.original.doctor;
        return d.name ? (
          <Link
            href={`/doctors/${d.id}`}
            className="block max-w-44 truncate text-sm hover:underline"
          >
            {d.name}
          </Link>
        ) : (
          "—"
        );
      },
    });
  }
  cols.push(
    {
      id: "visitDate",
      header: () => header("Visit date", "visitDate"),
      meta: { sortField: "visitDate" },
      cell: ({ row }) => (
        <span className="tabular text-sm">{formatDate(row.original.visitDate)}</span>
      ),
    },
    {
      id: "createdAt",
      header: () => header("Added", "createdAt"),
      meta: { sortField: "createdAt", className: "hidden xl:table-cell" },
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="tabular text-muted-foreground cursor-default text-sm">
              {formatDate(row.original.createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{formatDateTime(row.original.createdAt)}</TooltipContent>
        </Tooltip>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => (
        <ActionsCell patient={row.original} onEdit={onEdit} onDelete={onDelete} scope={scope} />
      ),
    },
  );
  return cols;
}
