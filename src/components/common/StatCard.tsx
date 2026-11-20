import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: string;
  hint?: React.ReactNode;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, tone, hint, className }: Props) {
  return (
    <Card className={cn("flex-row items-center gap-3 p-4", className)}>
      {Icon && (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            tone ?? "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-xs">{label}</p>
        <p className="tabular text-xl leading-tight font-semibold">{value}</p>
        {hint}
      </div>
    </Card>
  );
}
