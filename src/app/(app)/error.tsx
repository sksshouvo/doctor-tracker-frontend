"use client";

import { ErrorState } from "@/components/common/ErrorState";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} title="This page failed to load" onRetry={reset} />;
}
