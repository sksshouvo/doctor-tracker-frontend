import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientsView } from "@/features/patients/components/PatientsView";

export const metadata: Metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <PatientsView />
    </Suspense>
  );
}
