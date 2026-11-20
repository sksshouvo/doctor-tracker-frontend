import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

type Props = {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
};

export function ErrorState({
  error,
  title = "Something went wrong",
  onRetry,
  className,
  compact,
}: Props) {
  const e = error ? toApiError(error) : null;
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
        <AlertCircle className="size-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          {e?.isNetwork ? e.message : "Something went wrong. Please try again."}
        </p>
        {e?.requestId && <p className="text-muted-foreground text-xs">Request ID: {e.requestId}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}
