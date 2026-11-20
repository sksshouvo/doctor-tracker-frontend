import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  field: string;
  sort: string;
  defaultSort: string;
  onSort: (sort: string) => void;
  className?: string;
};

/** Cycles asc → desc → default. */
export function SortableHeader({ label, field, sort, defaultSort, onSort, className }: Props) {
  const dir = sort === field ? "asc" : sort === `-${field}` ? "desc" : "none";
  const next = dir === "none" ? field : dir === "asc" ? `-${field}` : defaultSort;
  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={() => onSort(next)}
      className={cn(
        "hover:text-foreground focus-visible:ring-ring/50 -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium focus-visible:ring-2 focus-visible:outline-none",
        dir !== "none" && "text-foreground",
        className,
      )}
    >
      {label}
      <Icon className={cn("size-3.5", dir === "none" && "opacity-40")} aria-hidden />
    </button>
  );
}

export const ariaSort = (sort: string, field: string): "ascending" | "descending" | "none" =>
  sort === field ? "ascending" : sort === `-${field}` ? "descending" : "none";
