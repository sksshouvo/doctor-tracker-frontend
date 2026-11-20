import { memo } from "react";
import { CONDITION_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Condition } from "@/types/api";

export const ConditionBadge = memo(function ConditionBadge({
  condition,
  className,
}: {
  condition: Condition;
  className?: string;
}) {
  const c = CONDITION_MAP[condition];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        c.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} aria-hidden />
      {c.label}
    </span>
  );
});
