import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState() {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="h-11 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
      <Inbox className="size-8 text-slate-400" />
      <p className="text-sm text-muted-foreground">没有符合当前条件的航班。</p>
      <Button variant="outline" onClick={onClear}>
        清除筛选
      </Button>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-red-200 bg-white px-6 py-16 text-center">
      <AlertCircle className="size-8 text-red-500" />
      <p className="text-sm text-red-700">{message}</p>
      <Button onClick={onRetry}>重试</Button>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1600px] px-4 py-8 text-center text-xs leading-6 text-muted-foreground sm:px-6">
      数据来源：
      <a
        className="text-primary underline-offset-4 hover:underline"
        href="https://www.zzcargo.com/airline/1"
        target="_blank"
        rel="noreferrer"
      >
        郑州新郑国际机场货运站公开航班动态
      </a>
      <br />
      数据仅供参考，以机场/航司官方信息为准。
    </footer>
  );
}
