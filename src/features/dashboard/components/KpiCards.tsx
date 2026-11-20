"use client";

import { ArrowDown, ArrowUp, HeartPulse, Minus, Stethoscope, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSummaryQuery } from "../hooks";

type Kpi = { label: string; value: number; icon: LucideIcon; tone: string; delta?: number | null };

function Delta({ pct }: { pct: number | null | undefined }) {
  if (pct === undefined) return null;
  const Icon = pct === null || pct === 0 ? Minus : pct > 0 ? ArrowUp : ArrowDown;
  const tone =
    pct === null || pct === 0
      ? "bg-muted text-muted-foreground"
      : pct > 0
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
  return (
    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
      <span
        className={cn(
          "tabular inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
          tone,
        )}
      >
        <Icon className="size-3" aria-hidden />
        {pct === null ? "—" : `${Math.abs(pct)}%`}
      </span>
      <span className="text-muted-foreground">vs previous period</span>
    </p>
  );
}

export function KpiCards({ range }: { range: string }) {
  const q = useSummaryQuery(range);

  if (q.isError) {
    return (
      <Card>
        <ErrorState
          compact
          error={q.error}
          onRetry={() => q.refetch()}
          title="Couldn't load key numbers"
        />
      </Card>
    );
  }

  const s = q.data;
  const kpis: Kpi[] = [
    {
      label: "Total doctors",
      value: s?.totalDoctors ?? 0,
      icon: Stethoscope,
      tone: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    },
    {
      label: "Total patients",
      value: s?.totalPatients ?? 0,
      icon: Users,
      tone: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
    {
      label: "New patients",
      value: s?.newPatients ?? 0,
      icon: UserPlus,
      tone: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
      delta: s ? s.newPatientsChangePct : undefined,
    },
    {
      label: "Critical patients",
      value: s?.criticalPatients ?? 0,
      icon: HeartPulse,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={q.isLoading}>
      {kpis.map(({ label, value, icon: Icon, tone, delta }) => (
        <Card key={label} className="flex-row items-start gap-4 p-4 md:p-5">
          <div
            className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tone)}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm">{label}</p>
            {q.isLoading ? (
              <Skeleton className="mt-1 h-8 w-20" />
            ) : (
              <p className="tabular text-2xl leading-tight font-semibold">{formatNumber(value)}</p>
            )}
            {q.isLoading ? <Skeleton className="mt-2 h-4 w-28" /> : <Delta pct={delta} />}
          </div>
        </Card>
      ))}
    </div>
  );
}
