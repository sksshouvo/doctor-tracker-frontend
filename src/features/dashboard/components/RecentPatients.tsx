"use client";

import Link from "next/link";
import { ConditionBadge } from "@/components/common/ConditionBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelative, initials } from "@/lib/format";
import { useRecentQuery } from "../hooks";
import { ChartCard } from "./ChartCard";

export function RecentPatients() {
  const q = useRecentQuery(5);
  return (
    <ChartCard
      title="Recent patients"
      description="Latest additions"
      isLoading={q.isLoading}
      isError={q.isError}
      error={q.error}
      onRetry={() => q.refetch()}
      isEmpty={q.data?.length === 0}
    >
      <ul className="divide-y">
        {q.data?.map((p) => (
          <li key={p.id}>
            <Link
              href={`/patients?q=${encodeURIComponent(p.name)}`}
              className="hover:bg-muted/50 focus-visible:ring-ring/50 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                  {initials(p.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-muted-foreground truncate text-xs">{p.doctor?.name ?? "—"}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ConditionBadge condition={p.condition} />
                <span className="text-muted-foreground tabular text-xs">
                  {formatRelative(p.createdAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
