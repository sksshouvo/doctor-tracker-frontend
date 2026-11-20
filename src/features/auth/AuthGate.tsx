"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "./api";
import { useAuth } from "./store";

export function ShellSkeleton() {
  return (
    <div className="flex min-h-svh" aria-busy="true" aria-label="Loading">
      <div className="hidden w-64 shrink-0 space-y-3 border-r p-4 lg:block">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1">
        <div className="flex h-14 items-center justify-end gap-2 border-b px-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    </div>
  );
}

/** Restores the session after a reload via the refresh cookie, then renders the app. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuth((s) => s.status);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (useAuth.getState().status !== "unknown") return;
    authApi.refresh().catch(() => {
      useAuth.getState().clear();
    });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname + (search ? `?${search}` : ""));
      router.replace(`/login?next=${next}`);
    }
  }, [status, pathname, search, router]);

  if (status !== "authenticated") return <ShellSkeleton />;
  return <>{children}</>;
}
