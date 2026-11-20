import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toApiError } from "./api-error";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: { silent?: boolean; errorMessage?: string };
  }
}

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache(),
    mutationCache: new MutationCache({
      onError: (error, _v, _c, mutation) => {
        if (mutation.meta?.silent) return;
        const e = toApiError(error);
        toast.error(mutation.meta?.errorMessage ?? e.message, {
          description: e.requestId ? `Request ID: ${e.requestId}` : undefined,
        });
      },
    }),
    defaultOptions: {
      queries: {
        retry: (count, error) => {
          const status = toApiError(error).status;
          return status >= 400 && status < 500 ? false : count < 1;
        },
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });
}
