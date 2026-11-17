import { X } from "lucide-react";
import type { Filters } from "@/types";

export function ActiveFilters({
  filters,
  onClearAll,
  onRemove,
}: {
  filters: Filters;
  onClearAll: () => void;
  onRemove: (key: keyof Filters) => void;
}) {
  const DATE_LABEL: Record<string, string> = {
    TODAY: "今天",
    YESTERDAY: "昨天",
    TOMORROW: "明天",
    DAY_AFTER: "后天",
    NEXT_7: "近7天",
    CUSTOM: "自定义",
  };
  const chips: { key: keyof Filters; label: string }[] = [];
  if (filters.search) chips.push({ key: "search", label: `搜索：${filters.search}` });
  if (filters.flightNo) chips.push({ key: "flightNo", label: `航班号：${filters.flightNo}` });
  if (filters.ioAttr !== "ALL") {
    chips.push({ key: "ioAttr", label: filters.ioAttr === "A" ? "进港" : "出港" });
  }
  if (filters.agent) chips.push({ key: "agent", label: `代理：${filters.agent}` });
  if (filters.origin) chips.push({ key: "origin", label: `始发：${filters.origin}` });
  if (filters.destination) chips.push({ key: "destination", label: `目的：${filters.destination}` });
  if (filters.datePreset !== "ALL") {
    chips.push({
      key: "datePreset",
      label:
        filters.datePreset === "CUSTOM"
          ? `日期：${filters.dateFrom || "…"} 至 ${filters.dateTo || "…"}`
          : `日期：${DATE_LABEL[filters.datePreset] ?? filters.datePreset}`,
    });
  }
  if (filters.status !== "ALL") chips.push({ key: "status", label: `状态：${filters.status}` });
  if (filters.region !== "ALL") chips.push({ key: "region", label: `区域：${filters.region}` });
  if (filters.aircraftFamily !== "ALL") {
    chips.push({ key: "aircraftFamily", label: `机型：${filters.aircraftFamily}` });
  }
  if (filters.aircraftType !== "ALL") {
    chips.push({ key: "aircraftType", label: `小类：${filters.aircraftType}` });
  }
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground"
        >
          {chip.label}
          <button type="button" aria-label={`移除 ${chip.label}`} onClick={() => onRemove(chip.key)}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={onClearAll}>
        清除全部
      </button>
    </div>
  );
}
