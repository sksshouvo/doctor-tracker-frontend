import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { SortableHeader } from "@/components/data-table/SortableHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, formatNumber, formatRelative, initials } from "@/lib/format";
import { DOCTOR_DEFAULT_SORT } from "../params";
import type { Doctor } from "../types";

type Handlers = {
  sort: string;
  onSort: (sort: string) => void;
  onEdit: (d: Doctor) => void;
  onDelete: (d: Doctor) => void;
};

const NameCell = memo(function NameCell({ doctor }: { doctor: Doctor }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
          {initials(doctor.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <Link
          href={`/doctors/${doctor.id}`}
          className="block max-w-56 truncate text-sm font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {doctor.name}
        </Link>
        <p className="text-muted-foreground max-w-56 truncate text-xs">{doctor.email}</p>
      </div>
    </div>
  );
});

const AddedCell = memo(function AddedCell({ value }: { value: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="tabular text-muted-foreground cursor-default text-sm">
          {formatRelative(value)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{formatDateTime(value)}</TooltipContent>
    </Tooltip>
  );
});

const ActionsCell = memo(function ActionsCell({
  doctor,
  onEdit,
  onDelete,
}: { doctor: Doctor } & Pick<Handlers, "onEdit" | "onDelete">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${doctor.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem asChild>
          <Link href={`/doctors/${doctor.id}`}>
            <Eye aria-hidden /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(doctor)}>
          <Pencil aria-hidden /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(doctor)}>
          <Trash2 aria-hidden /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function doctorColumns({
  sort,
  onSort,
  onEdit,
  onDelete,
}: Handlers): ColumnDef<Doctor, unknown>[] {
  const header = (label: string, field: string) => (
    <SortableHeader
      label={label}
      field={field}
      sort={sort}
      defaultSort={DOCTOR_DEFAULT_SORT}
      onSort={onSort}
    />
  );
  return [
    {
      id: "name",
      header: () => header("Doctor", "name"),
      meta: { sortField: "name" },
      cell: ({ row }) => <NameCell doctor={row.original} />,
    },
    {
      id: "specialization",
      header: "Specialization",
      cell: ({ row }) => <Badge variant="outline">{row.original.specialization}</Badge>,
    },
    {
      id: "hospital",
      header: "Hospital",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => (
        <span className="block max-w-48 truncate text-sm">{row.original.hospital}</span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      meta: { className: "hidden xl:table-cell" },
      cell: ({ row }) => <span className="tabular text-sm">{row.original.phone}</span>,
    },
    {
      id: "patientCount",
      header: () => header("Patients", "patientCount"),
      meta: { sortField: "patientCount", className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular text-sm font-medium">
          {formatNumber(row.original.patientCount ?? 0)}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: () => header("Added", "createdAt"),
      meta: { sortField: "createdAt" },
      cell: ({ row }) => <AddedCell value={row.original.createdAt} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => <ActionsCell doctor={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}
