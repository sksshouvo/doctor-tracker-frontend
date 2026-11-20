import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorsView } from "@/features/doctors/components/DoctorsView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Doctors" };

export default function DoctorsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DoctorsView />
    </Suspense>
  );
}
