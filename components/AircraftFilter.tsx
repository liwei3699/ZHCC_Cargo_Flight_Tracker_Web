import type { AircraftFamilyOption } from "@/lib/filter-options";
import type { Filters } from "@/types";

export function AircraftFilter({
  filters,
  families,
  onChange,
}: {
  filters: Filters;
  families: AircraftFamilyOption[];
  onChange: (patch: Partial<Filters>) => void;
}) {
  const selected = families.find((family) => family.label === filters.aircraftFamily);
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
        机型大类
        <select
          className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={filters.aircraftFamily}
          onChange={(event) =>
            onChange({ aircraftFamily: event.target.value, aircraftType: "ALL" })
          }
        >
          <option value="ALL">全部机型</option>
          {families.map((family) => (
            <option key={family.label} value={family.label}>
              {family.label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
        机型小类
        <select
          className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50"
          value={filters.aircraftType}
          disabled={filters.aircraftFamily === "ALL"}
          onChange={(event) => onChange({ aircraftType: event.target.value })}
        >
          <option value="ALL">全部小类</option>
          {(selected?.types ?? []).map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
