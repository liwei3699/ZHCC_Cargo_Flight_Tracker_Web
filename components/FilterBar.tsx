import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AircraftFilter } from "./AircraftFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import type { AircraftFamilyOption } from "@/lib/filter-options";
import type { Filters } from "@/types";

export type FilterOptions = {
  agents: string[];
  origins: string[];
  destinations: string[];
  aircraftFamilies: AircraftFamilyOption[];
};

export function FilterBar({
  filters,
  options,
  onChange,
}: {
  filters: Filters;
  options: FilterOptions;
  onChange: (patch: Partial<Filters>) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-[0_1px_3px_rgba(45,127,249,0.08)] sm:p-5">
      <div className="flex flex-col gap-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-xl bg-[#f8fafc] pl-9"
            placeholder="搜索航班号、航空公司、机场、机号、机位或航线代码"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            aria-label="全局搜索"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            航班号
            <Input
              className="h-9"
              value={filters.flightNo}
              onChange={(event) => onChange({ flightNo: event.target.value })}
              placeholder="例如 CZ6376"
            />
          </label>

          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            进出港
            <select
              className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm"
              value={filters.ioAttr}
              onChange={(event) =>
                onChange({ ioAttr: event.target.value as Filters["ioAttr"] })
              }
            >
              <option value="ALL">全部</option>
              <option value="A">进港</option>
              <option value="D">出港</option>
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            代理
            <select
              className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm"
              value={filters.agent}
              onChange={(event) => onChange({ agent: event.target.value })}
            >
              <option value="">全部</option>
              {options.agents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            始发站
            <Input
              className="h-9"
              list="origin-options"
              value={filters.origin}
              onChange={(event) => onChange({ origin: event.target.value })}
              placeholder="例如 乌鲁木齐"
            />
            <datalist id="origin-options">
              {options.origins.map((origin) => (
                <option key={origin} value={origin} />
              ))}
            </datalist>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            目的站
            <Input
              className="h-9"
              list="destination-options"
              value={filters.destination}
              onChange={(event) => onChange({ destination: event.target.value })}
              placeholder="例如 郑州"
            />
            <datalist id="destination-options">
              {options.destinations.map((destination) => (
                <option key={destination} value={destination} />
              ))}
            </datalist>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            状态
            <select
              className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm"
              value={filters.status}
              onChange={(event) => onChange({ status: event.target.value })}
            >
              <option value="ALL">全部</option>
              <optgroup label="异常">
                {["延误", "取消"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </optgroup>
              <optgroup label="运行">
                {[
                  "计划",
                  "前方起飞",
                  "正在值机",
                  "值机截止",
                  "登机",
                  "过站登机",
                  "催促登机",
                  "登机结束",
                  "起飞",
                  "到达",
                ].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </optgroup>
              <option value="其他">其他</option>
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            区域
            <select
              className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm"
              value={filters.region}
              onChange={(event) => onChange({ region: event.target.value })}
            >
              <option value="ALL">全部</option>
              <option value="DOM">国内</option>
              <option value="INT">国际</option>
              <option value="REG">地区</option>
              <option value="MIX">混合</option>
            </select>
          </label>

          <div className="sm:col-span-2 lg:col-span-1">
            <AircraftFilter filters={filters} families={options.aircraftFamilies} onChange={onChange} />
          </div>

          <div className="sm:col-span-2 xl:col-span-2">
            <DateRangeFilter filters={filters} onChange={onChange} />
          </div>
        </div>
      </div>
    </section>
  );
}
