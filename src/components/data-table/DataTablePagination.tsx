import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/types/api";

/** 1 … 4 5 [6] 7 8 … 20 */
export function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
}

type Props = {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
};

export function DataTablePagination({ meta, onPageChange, onLimitChange, disabled }: Props) {
  const { page, limit, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const btn = "size-8";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-muted-foreground tabular text-sm" aria-live="polite">
        <span className="hidden sm:inline">
          Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
        </span>
        <span className="sm:hidden">
          Page {page} of {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-muted-foreground text-sm">Rows</span>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger size="sm" className="w-[70px]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className={cn(btn, "hidden sm:inline-flex")}
            onClick={() => onPageChange(1)}
            disabled={disabled || !meta.hasPrevPage}
            aria-label="First page"
          >
            <ChevronsLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={btn}
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || !meta.hasPrevPage}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {pageList(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`e${i}`}
                  className="text-muted-foreground w-6 text-center text-sm"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className={cn(btn, "tabular")}
                  onClick={() => onPageChange(p)}
                  disabled={disabled}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              ),
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className={btn}
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || !meta.hasNextPage}
            aria-label="Next page"
          >
            <ChevronRight aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(btn, "hidden sm:inline-flex")}
            onClick={() => onPageChange(totalPages)}
            disabled={disabled || !meta.hasNextPage}
            aria-label="Last page"
          >
            <ChevronsRight aria-hidden />
          </Button>
        </nav>
      </div>
    </div>
  );
}
