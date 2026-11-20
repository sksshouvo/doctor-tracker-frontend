import { endOfMonth, startOfMonth, subDays, subMonths } from "date-fns";
import { toYmd } from "./format";

export type DatePreset = { id: string; label: string; range: () => { from: string; to: string } };

export const DATE_PRESETS: DatePreset[] = [
  {
    id: "today",
    label: "Today",
    range: () => ({ from: toYmd(new Date()), to: toYmd(new Date()) }),
  },
  {
    id: "7d",
    label: "Last 7 days",
    range: () => ({ from: toYmd(subDays(new Date(), 6)), to: toYmd(new Date()) }),
  },
  {
    id: "30d",
    label: "Last 30 days",
    range: () => ({ from: toYmd(subDays(new Date(), 29)), to: toYmd(new Date()) }),
  },
  {
    id: "month",
    label: "This month",
    range: () => ({ from: toYmd(startOfMonth(new Date())), to: toYmd(endOfMonth(new Date())) }),
  },
  {
    id: "3m",
    label: "Last 3 months",
    range: () => ({ from: toYmd(subMonths(new Date(), 3)), to: toYmd(new Date()) }),
  },
];

export function describeRange(from?: string | null, to?: string | null) {
  if (!from && !to) return null;
  return `${from ?? "…"} → ${to ?? "…"}`;
}
