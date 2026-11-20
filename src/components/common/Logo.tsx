import { cn } from "@/lib/utils";

/** Original mark: a heartbeat line inside a rounded square. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label="Doctor Tracker logo"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M5 17h5l2.5-6 4 11 3-8 1.8 3H27"
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showName && <span className="text-base font-semibold tracking-tight">Doctor Tracker</span>}
    </span>
  );
}
