import { Plane, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatShanghaiTime } from "@/lib/format";
import type { ApiMeta } from "@/types";

export function AppHeader({
  meta,
  refreshing,
  onRefresh,
}: {
  meta: ApiMeta | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Plane className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-[0.01em] text-foreground sm:text-2xl">
              郑州新郑国际机场货运航班动态
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">货运航班计划与起降信息</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-[#f8fafc] px-3 py-1.5 text-xs text-muted-foreground">
            <span
              className={`size-2 rounded-full ${meta?.stale ? "bg-amber-500" : "bg-emerald-600"}`}
            />
            数据同步于 {formatShanghaiTime(meta?.syncedAt)}
          </span>
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
            {refreshing ? "正在同步" : "刷新数据"}
          </Button>
        </div>
      </div>
    </header>
  );
}
