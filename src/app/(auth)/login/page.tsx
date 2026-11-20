import type { Metadata } from "next";
import { Activity, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/common/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="from-primary relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br to-teal-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="size-9" aria-hidden>
            <rect width="32" height="32" rx="9" fill="#fff" fillOpacity=".16" />
            <path
              d="M5 17h5l2.5-6 4 11 3-8 1.8 3H27"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-lg font-semibold tracking-tight">Doctor Tracker</span>
        </div>

        <div className="space-y-8">
          <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
            Manage doctors, patients and insights in one place.
          </h2>
          <div className="grid max-w-md grid-cols-3 gap-3" aria-hidden>
            {[
              { icon: Stethoscope, label: "Doctors", value: "1,000" },
              { icon: Users, label: "Patients", value: "100k" },
              { icon: Activity, label: "Insights", value: "Live" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur"
              >
                <Icon className="mb-2 size-4 opacity-80" />
                <p className="text-xl font-semibold tabular-nums">{value}</p>
                <p className="text-xs opacity-75">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm opacity-80">
          <ShieldCheck className="size-4" aria-hidden /> Secure admin access. Sessions refresh
          automatically.
        </p>
        <div
          className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-white/5"
          aria-hidden
        />
      </aside>

      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="bg-card w-full max-w-md space-y-6 rounded-2xl border p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <Logo className="lg:hidden" />
            <h1 className="pt-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your admin account to continue.
            </p>
          </div>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
