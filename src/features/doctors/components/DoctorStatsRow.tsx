import { Activity, Eye, HeartPulse, Users } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { formatNumber } from "@/lib/format";
import type { DoctorDetail } from "../types";

export function DoctorStatsRow({ stats }: { stats: DoctorDetail["stats"] }) {
  const { byCondition: c } = stats;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total patients" value={formatNumber(stats.totalPatients)} icon={Users} />
      <StatCard
        label="Critical"
        value={formatNumber(c.critical)}
        icon={HeartPulse}
        tone="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      />
      <StatCard
        label="Under observation"
        value={formatNumber(c.under_observation)}
        icon={Eye}
        tone="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />
      <StatCard
        label="Recovering"
        value={formatNumber(c.recovering)}
        icon={Activity}
        tone="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
      />
    </div>
  );
}
