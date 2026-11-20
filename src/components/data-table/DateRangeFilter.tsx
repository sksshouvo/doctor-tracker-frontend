"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DATE_PRESETS } from "@/lib/date-presets";
import { formatDate, fromYmd, toYmd } from "@/lib/format";

type Props = {
  title: string;
  from: string | null;
  to: string | null;
  onChange: (range: { from: string | null; to: string | null }) => void;
};

export function DateRangeFilter({ title, from, to, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wide = useMediaQuery("(min-width: 768px)");
  const selected: DateRange | undefined = from
    ? { from: fromYmd(from), to: to ? fromYmd(to) : undefined }
    : undefined;
  const active = !!(from || to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <CalendarDays aria-hidden />
          {active ? (
            <span className="tabular">
              <span className="sr-only">{title}: </span>
              {from ? formatDate(from) : "…"} – {to ? formatDate(to) : "…"}
            </span>
          ) : (
            title
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[95vw] p-0" align="start">
        <div className="flex flex-col md:flex-row">
          <div className="flex gap-1 overflow-x-auto border-b p-2 md:w-40 md:flex-col md:border-r md:border-b-0">
            {DATE_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant="ghost"
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => {
                  onChange(p.range());
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start whitespace-nowrap text-rose-600 dark:text-rose-400"
              disabled={!active}
              onClick={() => {
                onChange({ from: null, to: null });
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
          <Calendar
            mode="range"
            numberOfMonths={wide ? 2 : 1}
            selected={selected}
            defaultMonth={selected?.from}
            onSelect={(r) => {
              if (!r?.from) return onChange({ from: null, to: null });
              onChange({ from: toYmd(r.from), to: r.to ? toYmd(r.to) : null });
            }}
            disabled={{ after: new Date() }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
