import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef } from "@/lib/columns";
import { dash } from "@/lib/format";
import type { Flight, SortState } from "@/types";

export function FlightTable({
  flights,
  columns,
  sort,
  onSort,
}: {
  flights: Flight[];
  columns: ColumnDef[];
  sort: SortState;
  onSort: (key: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_3px_rgba(45,127,249,0.08)]">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-[#f8fafc]">
          <TableRow>
            {columns.map((column) => {
              const active = sort.key === column.id;
              const ariaSort: "none" | "ascending" | "descending" = active
                ? sort.direction === "asc"
                  ? "ascending"
                  : "descending"
                : "none";
              return (
                <TableHead
                  key={column.id}
                  aria-sort={ariaSort}
                  className="h-11 px-3 text-xs font-medium text-muted-foreground"
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 whitespace-nowrap hover:text-foreground"
                    onClick={() => onSort(column.id)}
                  >
                    {column.label}
                    {active ? (
                      sort.direction === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.map((flight) => (
            <TableRow key={flight.id}>
              {columns.map((column) => (
                <TableCell key={column.id} className={`px-3 py-2.5 text-sm ${column.className ?? ""}`}>
                  {column.render ? (
                    column.render(flight)
                  ) : (
                    <span className="text-sm">{dash(column.value(flight))}</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
