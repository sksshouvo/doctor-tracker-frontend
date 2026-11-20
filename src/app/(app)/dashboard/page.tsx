import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DashboardView />
    </Suspense>
  );
}
