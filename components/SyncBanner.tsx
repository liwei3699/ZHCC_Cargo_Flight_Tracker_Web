import { warningText } from "@/lib/api";
import type { ApiMeta } from "@/types";

export function SyncBanner({ meta }: { meta: ApiMeta | null }) {
  if (!meta) return null;
  if (meta.syncing) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        正在同步源站数据，请稍候。
      </div>
    );
  }
  if (!meta.stale && !meta.warning) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {warningText(meta.warning) || "源站暂时不可用，当前显示缓存数据。"}
    </div>
  );
}
