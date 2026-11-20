"use client";

import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { PageHeader } from "@/components/layout/PageHeader";
import { RANGES } from "@/lib/constants";
import {
  useConditionsQuery,
  useOverTimeQuery,
  usePerDoctorQuery,
  useSpecializationsQuery,
} from "../hooks";
import { ChartCard, ChartSkeleton } from "./ChartCard";
import { KpiCards } from "./KpiCards";
import { RangeSelect } from "./RangeSelect";
import { RecentPatients } from "./RecentPatients";

// Recharts stays out of the initial bundle (next/dynamic needs inline option literals).
const PatientsOverTimeChart = dynamic(
  () => import("./charts").then((m) => m.PatientsOverTimeChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);
const ConditionDonutChart = dynamic(() => import("./charts").then((m) => m.ConditionDonutChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const PatientsPerDoctorChart = dynamic(
  () => import("./charts").then((m) => m.PatientsPerDoctorChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);
const SpecializationChart = dynamic(() => import("./charts").then((m) => m.SpecializationChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const rangeParser = parseAsStringLiteral(RANGES.map((r) => r.value)).withDefault("30d");

export function DashboardView() {
  const [range, setRange] = useQueryState("range", rangeParser);
  const rangeLabel = RANGES.find((r) => r.value === range)!.label;

  const overTime = useOverTimeQuery(range);
  const conditions = useConditionsQuery();
  const perDoctor = usePerDoctorQuery(10);
  const specializations = useSpecializationsQuery(8);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of doctors, patients and activity"
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <KpiCards range={range} />

      <div className="grid gap-4 md:gap-6 xl:grid-cols-12">
        <ChartCard
          className="xl:col-span-8"
          title="Patients over time"
          description={`Visits · ${rangeLabel.toLowerCase()}`}
          isLoading={overTime.isLoading}
          isError={overTime.isError}
          error={overTime.error}
          onRetry={() => overTime.refetch()}
          isEmpty={!!overTime.data && overTime.data.points.every((p) => p.count === 0)}
        >
          {overTime.data && <PatientsOverTimeChart data={overTime.data} rangeLabel={rangeLabel} />}
        </ChartCard>

        <ChartCard
          className="xl:col-span-4"
          title="Patients by condition"
          description="All patients"
          isLoading={conditions.isLoading}
          isError={conditions.isError}
          error={conditions.error}
          onRetry={() => conditions.refetch()}
          isEmpty={!!conditions.data && conditions.data.every((c) => c.count === 0)}
        >
          {conditions.data && <ConditionDonutChart data={conditions.data} />}
        </ChartCard>

        <ChartCard
          className="xl:col-span-7"
          title="Top doctors by patients"
          description="Click a bar to open the doctor"
          isLoading={perDoctor.isLoading}
          isError={perDoctor.isError}
          error={perDoctor.error}
          onRetry={() => perDoctor.refetch()}
          isEmpty={perDoctor.data?.length === 0}
        >
          {perDoctor.data && <PatientsPerDoctorChart data={perDoctor.data} />}
        </ChartCard>

        <ChartCard
          className="xl:col-span-5"
          title="Doctors by specialization"
          description="Top 8, remainder grouped as Other"
          isLoading={specializations.isLoading}
          isError={specializations.isError}
          error={specializations.error}
          onRetry={() => specializations.refetch()}
          isEmpty={specializations.data?.length === 0}
        >
          {specializations.data && <SpecializationChart data={specializations.data} />}
        </ChartCard>

        <div className="xl:col-span-12">
          <RecentPatients />
        </div>
      </div>
    </>
  );
}
