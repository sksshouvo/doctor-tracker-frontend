"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RANGES, type RangeValue } from "@/lib/constants";

export function RangeSelect({
  value,
  onChange,
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as RangeValue)}>
      <SelectTrigger className="w-44" aria-label="Date range">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {RANGES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
