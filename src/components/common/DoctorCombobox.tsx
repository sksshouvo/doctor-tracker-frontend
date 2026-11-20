"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDoctorOptionsQuery, useDoctorQuery } from "@/features/doctors/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (id: string | null, label?: string) => void;
  /** Known label for `value` (avoids a lookup when editing a row that already embeds the doctor). */
  selectedLabel?: string | null;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
};

/** Async doctor picker: GET /doctors/options?q= (debounced). */
export function DoctorCombobox({
  value,
  onChange,
  selectedLabel,
  placeholder = "Select doctor",
  clearable,
  disabled,
  id,
  invalid,
  describedBy,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim(), 250);
  const options = useDoctorOptionsQuery(q, open);
  const needLookup = !!value && !selectedLabel;
  const doctor = useDoctorQuery(needLookup ? value : null);
  const label = selectedLabel ?? doctor.data?.name ?? (value ? "Selected doctor" : null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label={`Doctor, ${label ?? placeholder}`}
          aria-expanded={open}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{label ?? placeholder}</span>
          <span className="flex items-center gap-1">
            {clearable && value && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear doctor"
                className="hover:bg-muted rounded p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onChange(null);
                  }
                }}
              >
                <X className="size-3.5" aria-hidden />
              </span>
            )}
            <ChevronsUpDown className="size-4 opacity-50" aria-hidden />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search doctors…" value={text} onValueChange={setText} />
          <CommandList>
            <CommandEmpty>{options.isFetching ? "Searching…" : "No doctors found."}</CommandEmpty>
            <CommandGroup>
              {options.data?.map((d) => (
                <CommandItem
                  key={d.id}
                  value={d.id}
                  onSelect={() => {
                    onChange(d.id, d.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("size-4", value === d.id ? "opacity-100" : "opacity-0")}
                    aria-hidden
                  />
                  <span className="truncate">{d.name}</span>
                  <span className="text-muted-foreground ml-auto truncate text-xs">
                    {d.specialization}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
