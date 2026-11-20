"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { memo, useMemo, type KeyboardEvent, type ReactNode } from "react";
import { ErrorState } from "@/components/common/ErrorState";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/types/api";
import { ariaSort } from "./SortableHeader";
import { DataTablePagination } from "./DataTablePagination";
import { CardListSkeleton, TableSkeleton } from "./TableSkeleton";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Extra classes for both <th> and <td> (e.g. "hidden xl:table-cell"). */
    className?: string;
    /** Field used for aria-sort on sortable columns. */
    sortField?: string;
  }
}

type Props<T extends { id: string }> = {
  columns: ColumnDef<T, unknown>[];
  data: T[] | undefined;
  meta: PageMeta | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  sort: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  renderMobileCard: (item: T) => ReactNode;
  emptyState: ReactNode;
  /** Shown instead of `emptyState` when filters are active but nothing matched. */
  noResults?: ReactNode;
  hasFilters?: boolean;
  onRowClick?: (item: T) => void;
  onRowPrefetch?: (item: T) => void;
  caption: string;
};

type RowProps<T extends { id: string }> = {
  row: Row<T>;
  onRowClick?: (item: T) => void;
  onRowPrefetch?: (item: T) => void;
};

const DataRowInner = <T extends { id: string }>({
  row,
  onRowClick,
  onRowPrefetch,
}: RowProps<T>) => {
  const item = row.original;
  const clickable = !!onRowClick;
  const onKey = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter") onRowClick?.(item);
  };
  return (
    <TableRow
      className={cn(clickable && "cursor-pointer")}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onRowClick(item) : undefined}
      onKeyDown={clickable ? onKey : undefined}
      onMouseEnter={onRowPrefetch ? () => onRowPrefetch(item) : undefined}
      onFocus={onRowPrefetch ? () => onRowPrefetch(item) : undefined}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

/** Re-renders only when the row's data (or the row handlers) change. */
const DataRow = memo(
  DataRowInner,
  (a, b) =>
    a.row.original === b.row.original &&
    a.onRowClick === b.onRowClick &&
    a.onRowPrefetch === b.onRowPrefetch,
) as typeof DataRowInner;

export function DataTable<T extends { id: string }>({
  columns,
  data,
  meta,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  sort,
  onPageChange,
  onLimitChange,
  renderMobileCard,
  emptyState,
  noResults,
  hasFilters,
  onRowClick,
  onRowPrefetch,
  caption,
}: Props<T>) {
  const rows = useMemo(() => data ?? [], [data]);
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => r.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const empty = !isLoading && !isError && rows.length === 0;
  const refetching = isFetching && !isLoading;

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="bg-primary/15 relative h-0.5 w-full overflow-hidden" aria-hidden>
        {refetching && (
          <div className="bg-primary absolute inset-y-0 w-1/3 motion-safe:animate-[dt-progress_1.1s_ease-in-out_infinite]" />
        )}
      </div>

      {isError && !data ? (
        <ErrorState error={error} onRetry={onRetry} title="Couldn't load data" />
      ) : empty ? (
        (hasFilters && noResults) || emptyState
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table aria-busy={refetching}>
              <caption className="sr-only">{caption}</caption>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-transparent">
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        scope="col"
                        aria-sort={
                          h.column.columnDef.meta?.sortField
                            ? ariaSort(sort, h.column.columnDef.meta.sortField)
                            : undefined
                        }
                        className={cn(
                          "text-muted-foreground text-xs font-medium",
                          h.column.columnDef.meta?.className,
                        )}
                      >
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              {isLoading ? (
                <TableSkeleton columns={columns.length} />
              ) : (
                <TableBody className={cn(refetching && "opacity-70 transition-opacity")}>
                  {table.getRowModel().rows.map((row) => (
                    <DataRow
                      key={row.id}
                      row={row}
                      onRowClick={onRowClick}
                      onRowPrefetch={onRowPrefetch}
                    />
                  ))}
                </TableBody>
              )}
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {isLoading ? (
              <CardListSkeleton />
            ) : (
              <ul
                className={cn("space-y-3 p-3", refetching && "opacity-70 transition-opacity")}
                aria-label={caption}
              >
                {rows.map((item) => (
                  <li key={item.id}>{renderMobileCard(item)}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {meta && meta.total > 0 && (
        <DataTablePagination
          meta={meta}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={isFetching}
        />
      )}
    </Card>
  );
}
