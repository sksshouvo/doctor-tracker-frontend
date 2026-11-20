import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";
import type { Doctor } from "../types";

export const DoctorCard = memo(function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className="bg-card hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 rounded-xl border p-3 focus-visible:ring-2 focus-visible:outline-none"
    >
      <Avatar className="size-10">
        <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
          {initials(doctor.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{doctor.name}</p>
          <Badge variant="outline" className="shrink-0">
            {doctor.specialization}
          </Badge>
        </div>
        <p className="text-muted-foreground truncate text-xs">{doctor.hospital}</p>
        <p className="text-muted-foreground tabular flex items-center gap-1 text-xs">
          <Users className="size-3" aria-hidden /> {doctor.patientCount ?? 0} patients
        </p>
      </div>
      <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
    </Link>
  );
});
