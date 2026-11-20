import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export function TableSkeleton({ columns, rows = 8 }: { columns: number; rows?: number }) {
  return (
    <TableBody aria-busy="true">
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c}>
              <Skeleton className={c === 0 ? "h-9 w-44" : "h-4 w-20"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-3 p-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-24 w-full rounded-xl" />
        </li>
      ))}
    </ul>
  );
}
