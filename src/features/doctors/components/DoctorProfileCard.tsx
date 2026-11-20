import { Building2, CalendarDays, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, initials } from "@/lib/format";
import type { DoctorDetail } from "../types";

type Props = { doctor: DoctorDetail; onEdit: () => void; onDelete: () => void };

export function DoctorProfileCard({ doctor, onEdit, onDelete }: Props) {
  return (
    <Card className="gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="size-16 sm:size-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold sm:text-2xl">
            {initials(doctor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{doctor.name}</h1>
            <Badge variant="secondary">{doctor.specialization}</Badge>
          </div>
          <dl className="text-muted-foreground grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Hospital</dt>
              <dd className="text-foreground truncate">{doctor.hospital}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Phone</dt>
              <dd>
                <a
                  href={`tel:${doctor.phone.replace(/[^\d+]/g, "")}`}
                  className="text-foreground hover:underline"
                >
                  {doctor.phone}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Email</dt>
              <dd className="min-w-0">
                <a
                  href={`mailto:${doctor.email}`}
                  className="text-foreground block truncate hover:underline"
                >
                  {doctor.email}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Added</dt>
              <dd className="tabular">Added {formatDate(doctor.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil aria-hidden /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 hover:text-rose-700"
            onClick={onDelete}
          >
            <Trash2 aria-hidden /> Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
