import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Chip = { key: string; label: string; onRemove: () => void };

export function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: Chip[];
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <span
          key={c.key}
          className="bg-secondary inline-flex max-w-full items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-xs font-medium"
        >
          <span className="truncate">{c.label}</span>
          <button
            type="button"
            onClick={c.onRemove}
            aria-label={`Remove filter ${c.label}`}
            className="hover:bg-foreground/10 rounded-full p-0.5"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="xs" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
