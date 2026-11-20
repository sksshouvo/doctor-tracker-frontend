"use client";

import { Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type FacetOption = { value: string; label: string; dotClass?: string };

type Props = {
  title: string;
  options: FacetOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  loading?: boolean;
  searchable?: boolean;
};

export function FacetedFilter({
  title,
  options,
  selected,
  onChange,
  loading,
  searchable = true,
}: Props) {
  const set = new Set(selected);
  const toggle = (v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange([...next]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          {title}
          {selected.length > 0 && (
            <Badge variant="secondary" className="tabular ml-1 rounded-sm px-1.5">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          {searchable && <CommandInput placeholder={`Search ${title.toLowerCase()}…`} />}
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : "No options."}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const on = set.has(o.value);
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                    <span
                      className={cn(
                        "border-primary flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                        on ? "bg-primary text-primary-foreground" : "opacity-60 [&_svg]:invisible",
                      )}
                      aria-hidden
                    >
                      <Check className="size-3" />
                    </span>
                    {o.dotClass && (
                      <span className={cn("size-2 rounded-full", o.dotClass)} aria-hidden />
                    )}
                    <span className="truncate">{o.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
