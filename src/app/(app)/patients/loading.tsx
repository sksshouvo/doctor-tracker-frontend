import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-9 w-full max-w-xl" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
