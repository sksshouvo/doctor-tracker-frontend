import { cn } from "@/lib/utils";

type Props<T extends string> = {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
};

/** Small segmented control (radio semantics). */
export function ToggleGroup<T extends string>({ label, value, onChange, options }: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="bg-muted inline-flex h-9 items-center rounded-lg p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-visible:ring-ring/50 h-8 rounded-md px-2.5 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
