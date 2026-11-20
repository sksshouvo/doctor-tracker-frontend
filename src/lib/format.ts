import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

const toDate = (v: string | Date) => (typeof v === "string" ? parseISO(v) : v);

export const formatDate = (v: string | Date | null | undefined) =>
  v ? format(toDate(v), "d MMM yyyy") : "—";

export const formatDateTime = (v: string | Date | null | undefined) =>
  v ? format(toDate(v), "d MMM yyyy, HH:mm") : "—";

export const formatRelative = (v: string | Date | null | undefined) =>
  v ? formatDistanceToNowStrict(toDate(v), { addSuffix: true }) : "—";

const nf = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => nf.format(n);

export const initials = (name: string) =>
  name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** `YYYY-MM-DD` in local time (what the API's from/to params expect). */
export const toYmd = (d: Date) => format(d, "yyyy-MM-dd");
export const fromYmd = (s: string) => parseISO(s);

export const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Only same-origin relative paths are accepted (prevents open redirects). */
export const safeNext = (next: string | null | undefined, fallback = "/dashboard") =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
