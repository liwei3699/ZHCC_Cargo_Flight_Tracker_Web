import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ActiveFilters } from "@/components/ActiveFilters";
import { AppHeader } from "@/components/AppHeader";
import { ColumnPicker } from "@/components/ColumnPicker";
import { ExportButton } from "@/components/ExportButton";
import { FilterBar } from "@/components/FilterBar";
import { FlightCards } from "@/components/FlightCards";
import { FlightTable } from "@/components/FlightTable";
import { Pagination } from "@/components/Pagination";
import { EmptyState, ErrorState, Footer, LoadingState } from "@/components/States";
import { SyncBanner } from "@/components/SyncBanner";
import { Toaster } from "@/components/ui/sonner";
import { useFlights } from "@/hooks/use-flights";
import { useIsMobile } from "@/hooks/use-mobile";
import { COLUMNS, DEFAULT_VISIBLE_COLUMNS } from "@/lib/columns";
import { loadColumnPrefs, saveColumnPrefs } from "@/lib/column-prefs";
import { DEFAULT_FILTERS, filterFlights } from "@/lib/filters";
import { deriveFilterOptions } from "@/lib/filter-options";
import { todayShanghai } from "@/lib/format";
import { sortFlights } from "@/lib/sort";
import type { Filters, SortState } from "@/types";

export default function App() {
  const { flights, meta, loading, refreshing, error, refresh } = useFlights();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: "default", direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(loadColumnPrefs);

  const options = useMemo(() => deriveFilterOptions(flights), [flights]);
  const filtered = useMemo(
    () => filterFlights(flights, filters, todayShanghai()),
    [flights, filters],
  );
  const sorted = useMemo(() => sortFlights(filtered, sort), [filtered, sort]);
  const visibleColumnDefs = useMemo(
    () => COLUMNS.filter((column) => visibleColumns.includes(column.id)),
    [visibleColumns],
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleChange = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const removeFilter = (key: keyof Filters) => {
    setFilters((current) => {
      if (key === "aircraftFamily") return { ...current, aircraftFamily: "ALL", aircraftType: "ALL" };
      if (key === "aircraftType") return { ...current, aircraftType: "ALL" };
      if (key === "datePreset") {
        return { ...current, datePreset: "ALL", dateFrom: "", dateTo: "" };
      }
      if (key === "ioAttr") return { ...current, ioAttr: "ALL" };
      if (key === "status") return { ...current, status: "ALL" };
      if (key === "region") return { ...current, region: "ALL" };
      if (key === "agent") return { ...current, agent: "" };
      if (key === "search") return { ...current, search: "" };
      if (key === "flightNo") return { ...current, flightNo: "" };
      if (key === "origin") return { ...current, origin: "" };
      if (key === "destination") return { ...current, destination: "" };
      return current;
    });
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
    setPage(1);
  };

  const toggleColumn = (id: string) => {
    setVisibleColumns((current) => {
      if (current.includes(id)) {
        if (current.length === 1) {
          toast.warning("至少保留一列");
          return current;
        }
        const next = current.filter((item) => item !== id);
        saveColumnPrefs(next);
        return next;
      }
      const next = [...current, id];
      saveColumnPrefs(next);
      return next;
    });
  };

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    saveColumnPrefs(DEFAULT_VISIBLE_COLUMNS);
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#f8fbff_0,#ffffff_38%)] text-foreground">
      <AppHeader meta={meta} refreshing={refreshing} onRefresh={refresh} />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 sm:px-6">
        <SyncBanner meta={meta} />
        {error && !flights.length ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <>
            <FilterBar filters={filters} options={options} onChange={handleChange} />
            <ActiveFilters filters={filters} onClearAll={clearAll} onRemove={removeFilter} />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
              <p className="text-sm text-muted-foreground">
                共 <span className="font-medium text-foreground">{flights.length}</span> 条，筛选后{" "}
                <span className="font-medium text-foreground">{filtered.length}</span> 条
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ColumnPicker visible={visibleColumns} onToggle={toggleColumn} onReset={resetColumns} />
                <ExportButton flights={sorted} meta={meta} />
              </div>
            </div>
            {loading ? (
              <LoadingState />
            ) : filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <>
                {isMobile ? (
                  <FlightCards flights={pageRows} />
                ) : (
                  <FlightTable
                    flights={pageRows}
                    columns={visibleColumnDefs}
                    sort={sort}
                    onSort={handleSort}
                  />
                )}
                <Pagination
                  page={safePage}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  onPage={setPage}
                  onPageSize={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </>
            )}
          </>
        )}
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
