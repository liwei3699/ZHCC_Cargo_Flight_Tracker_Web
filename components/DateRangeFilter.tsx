import type { DatePreset, Filters } from "@/types";

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "ALL", label: "全部" },
  { value: "TODAY", label: "今天" },
  { value: "YESTERDAY", label: "昨天" },
  { value: "TOMORROW", label: "明天" },
  { value: "DAY_AFTER", label: "后天" },
  { value: "NEXT_7", label: "近7天" },
  { value: "CUSTOM", label: "自定义" },
];

export function DateRangeFilter({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">航班日期</span>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange({ datePreset: preset.value })}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              filters.datePreset === preset.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-muted-foreground hover:bg-slate-50"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {filters.datePreset === "CUSTOM" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-sm"
            value={filters.dateFrom}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
            aria-label="开始日期"
          />
          <span className="text-xs text-muted-foreground">至</span>
          <input
            type="date"
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-sm"
            value={filters.dateTo}
            onChange={(event) => onChange({ dateTo: event.target.value })}
            aria-label="结束日期"
          />
        </div>
      )}
    </div>
  );
}
