import { cookies } from "next/headers";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGate, ShellSkeleton } from "@/features/auth/AuthGate";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarState = (await cookies()).get("sidebar_state")?.value;
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AuthGate>
        <AppShell defaultOpen={sidebarState !== "false"}>{children}</AppShell>
      </AuthGate>
    </Suspense>
  );
}
