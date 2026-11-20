import type { BloodGroup, Condition, Gender } from "@/types/api";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Doctor Tracker";

/** Single source for condition labels/colours: used by badges AND charts so they stay consistent. */
export const CONDITIONS: {
  value: Condition;
  label: string;
  /** Tailwind classes for badges / dots (light + dark). */
  badge: string;
  dot: string;
  /** Hex used by charts. */
  color: string;
}[] = [
  {
    value: "stable",
    label: "Stable",
    badge:
      "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400/30",
    dot: "bg-emerald-500",
    color: "#10b981",
  },
  {
    value: "recovering",
    label: "Recovering",
    badge:
      "bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-400/30",
    dot: "bg-sky-500",
    color: "#0ea5e9",
  },
  {
    value: "under_observation",
    label: "Under observation",
    badge:
      "bg-amber-50 text-amber-900 ring-amber-600/25 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-400/30",
    dot: "bg-amber-500",
    color: "#f59e0b",
  },
  {
    value: "critical",
    label: "Critical",
    badge:
      "bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-400/30",
    dot: "bg-rose-500",
    color: "#f43f5e",
  },
  {
    value: "discharged",
    label: "Discharged",
    badge:
      "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/30",
    dot: "bg-slate-400",
    color: "#94a3b8",
  },
];

export const CONDITION_MAP = Object.fromEntries(CONDITIONS.map((c) => [c.value, c])) as Record<
  Condition,
  (typeof CONDITIONS)[number]
>;

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const PAGE_SIZES = [10, 20, 50] as const;

export const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
] as const;
export type RangeValue = (typeof RANGES)[number]["value"];

export const CHART_COLORS = ["#0d9488", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f43f5e", "#94a3b8"];
