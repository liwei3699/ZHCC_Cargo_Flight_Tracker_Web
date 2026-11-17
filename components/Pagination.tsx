import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}) {
  const [jump, setJump] = useState("");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        每页
        <select
          className="h-8 rounded-lg border border-border bg-white px-2 text-xs"
          value={pageSize}
          onChange={(event) => onPageSize(Number(event.target.value))}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        条
      </label>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPage(1)}
          aria-label="首页"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="上一页"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          第 {page} / {pageCount} 页
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label="下一页"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPage(pageCount)}
          aria-label="末页"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const next = Number(jump);
          if (Number.isInteger(next) && next >= 1 && next <= pageCount) onPage(next);
          setJump("");
        }}
      >
        <span className="text-xs text-muted-foreground">跳至</span>
        <input
          className="h-8 w-14 rounded-lg border border-border bg-white px-2 text-center text-xs"
          value={jump}
          onChange={(event) => setJump(event.target.value)}
          aria-label="跳转页码"
          inputMode="numeric"
        />
        <span className="text-xs text-muted-foreground">页</span>
      </form>
    </div>
  );
}
