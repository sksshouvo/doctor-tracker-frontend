"use client";

import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_COLORS, CONDITION_MAP } from "@/lib/constants";
import { formatNumber, truncate } from "@/lib/format";
import type { ConditionCount, OverTime, PerDoctor, SpecializationCount } from "../types";

/** Visually hidden table so screen-reader users can read the exact chart values. */
function SrTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const axis = { stroke: "var(--muted-foreground)", fontSize: 12 } as const;
const wrap = "aspect-auto h-[280px] w-full md:h-[320px]";

// ---------- patients over time ----------
export function PatientsOverTimeChart({
  data,
  rangeLabel,
}: {
  data: OverTime;
  rangeLabel: string;
}) {
  const total = data.points.reduce((s, p) => s + p.count, 0);
  const peak = data.points.reduce(
    (m, p) => (p.count > m.count ? p : m),
    data.points[0] ?? { date: "", count: 0 },
  );
  const tick = (d: string) =>
    format(parseISO(d), data.granularity === "month" ? "MMM yy" : "d MMM");
  const config = { count: { label: "Patients", color: CHART_COLORS[0] } } satisfies ChartConfig;
  const summary = `Patients over ${rangeLabel.toLowerCase()}: ${formatNumber(total)} total${peak.count ? `, peak ${peak.count} on ${format(parseISO(peak.date), "d MMM")}` : ""}`;

  return (
    <div role="img" aria-label={summary}>
      <ChartContainer config={config} className={wrap}>
        <AreaChart data={data.points} margin={{ left: 0, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={tick}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            {...axis}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={44} {...axis} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_l, p) =>
                  format(
                    parseISO(p[0]?.payload.date),
                    data.granularity === "month" ? "MMMM yyyy" : "EEE, d MMM yyyy",
                  )
                }
              />
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={2}
            fill="url(#fillCount)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
      <SrTable
        caption={summary}
        head={["Date", "Patients"]}
        rows={data.points.map((p) => [p.date, p.count])}
      />
    </div>
  );
}

// ---------- condition donut ----------
export function ConditionDonutChart({ data }: { data: ConditionCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const config = Object.fromEntries(
    data.map((d) => [
      d.condition,
      { label: CONDITION_MAP[d.condition].label, color: CONDITION_MAP[d.condition].color },
    ]),
  ) satisfies ChartConfig;
  const rows = data.map((d) => ({
    ...d,
    name: CONDITION_MAP[d.condition].label,
    fill: CONDITION_MAP[d.condition].color,
  }));
  const summary = `Patients by condition: ${rows.map((r) => `${r.name} ${r.count}`).join(", ")}`;

  return (
    <div
      role="img"
      aria-label={summary}
      className="flex flex-col items-center gap-3 sm:flex-row md:flex-col lg:flex-row xl:flex-col"
    >
      <div className="relative h-[170px] w-[170px] shrink-0 md:h-[190px] md:w-[190px]">
        <ChartContainer config={config} className="aspect-square h-full w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
            <Pie
              data={rows}
              dataKey="count"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {rows.map((r) => (
                <Cell key={r.condition} fill={r.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl font-semibold">{formatNumber(total)}</span>
          <span className="text-muted-foreground text-xs">patients</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5 text-sm" aria-hidden>
        {rows.map((r) => (
          <li key={r.condition} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: r.fill }} />
            <span className="flex-1 truncate">{r.name}</span>
            <span className="tabular font-medium">{formatNumber(r.count)}</span>
            <span className="text-muted-foreground tabular w-10 text-right text-xs">
              {total ? Math.round((r.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
      <SrTable
        caption={summary}
        head={["Condition", "Patients"]}
        rows={rows.map((r) => [r.name, r.count])}
      />
    </div>
  );
}

// ---------- top doctors ----------
export function PatientsPerDoctorChart({ data }: { data: PerDoctor[] }) {
  const router = useRouter();
  const config = { count: { label: "Patients", color: CHART_COLORS[0] } } satisfies ChartConfig;
  const summary = `Top doctors by patients: ${data.map((d) => `${d.name} ${d.count}`).join(", ")}`;
  const height = Math.max(240, data.length * 34);

  return (
    <div role="img" aria-label={summary}>
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} {...axis} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => truncate(v, 18)}
            {...axis}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_l, p) =>
                  `${p[0]?.payload.name} · ${p[0]?.payload.specialization}`
                }
              />
            }
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[0, 6, 6, 0]}
            barSize={20}
            cursor="pointer"
            onClick={(_d, i) => data[i] && router.push(`/doctors/${data[i].doctorId}`)}
          />
        </BarChart>
      </ChartContainer>
      <SrTable
        caption={summary}
        head={["Doctor", "Patients"]}
        rows={data.map((d) => [d.name, d.count])}
      />
    </div>
  );
}

// ---------- specializations ----------
export function SpecializationChart({ data }: { data: SpecializationCount[] }) {
  const config = { count: { label: "Doctors", color: CHART_COLORS[1] } } satisfies ChartConfig;
  const summary = `Doctors by specialization: ${data.map((d) => `${d.specialization} ${d.count}`).join(", ")}`;
  return (
    <div role="img" aria-label={summary}>
      <ChartContainer config={config} className={wrap}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="specialization"
            interval={0}
            angle={-35}
            textAnchor="end"
            height={64}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => truncate(v, 12)}
            {...axis}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} {...axis} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={
              <ChartTooltipContent labelFormatter={(_l, p) => p[0]?.payload.specialization} />
            }
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {data.map((d) => (
              <Cell
                key={d.specialization}
                fill={d.specialization === "Other" ? CHART_COLORS[5] : CHART_COLORS[1]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <SrTable
        caption={summary}
        head={["Specialization", "Doctors"]}
        rows={data.map((d) => [d.specialization, d.count])}
      />
    </div>
  );
}
