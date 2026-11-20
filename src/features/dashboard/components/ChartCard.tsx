import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  isEmpty?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Fixed content height (280/320px) so nothing shifts when a chart finishes loading. */
const HEIGHT = "h-[280px] md:h-[320px]";

export function ChartSkeleton() {
  return <Skeleton className={cn("w-full", HEIGHT)} aria-hidden />;
}

export function ChartCard({
  title,
  description,
  action,
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  className,
  children,
}: Props) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <div className={cn("flex flex-col justify-center", HEIGHT)}>
          {isLoading ? (
            <ChartSkeleton />
          ) : isError ? (
            <ErrorState compact error={error} onRetry={onRetry} title="Couldn't load this chart" />
          ) : isEmpty ? (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              description="Data will appear here once records are added."
              className="py-6"
            />
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
}
