import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorDetailView } from "@/features/doctors/components/DoctorDetailView";

export const metadata: Metadata = { title: "Doctor" };

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DoctorDetailView id={id} />
    </Suspense>
  );
}
