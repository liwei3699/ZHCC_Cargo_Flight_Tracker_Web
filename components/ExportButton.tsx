import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ApiMeta, Flight } from "@/types";

export function ExportButton({
  flights,
  meta,
}: {
  flights: Flight[];
  meta: ApiMeta | null;
}) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    if (!meta || !flights.length) return;
    setBusy(true);
    try {
      const { exportFlightsToXlsx } = await import("@/lib/export");
      await exportFlightsToXlsx(flights, meta);
      toast.success(`已导出 ${flights.length} 条记录`);
    } catch {
      toast.error("导出失败，请重试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={busy || !flights.length || !meta}>
      {busy ? (
        "正在生成…"
      ) : (
        <>
          <Download className="size-4" />
          导出 xlsx
        </>
      )}
    </Button>
  );
}
