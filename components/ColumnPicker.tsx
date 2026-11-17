import { Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COLUMNS } from "@/lib/columns";

export function ColumnPicker({
  visible,
  onToggle,
  onReset,
}: {
  visible: string[];
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  const groups = [...new Set(COLUMNS.map((column) => column.group))];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Columns3 className="size-4" />
          列设置
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[70vh] w-72 overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">显示列</span>
          <button type="button" className="text-xs text-primary" onClick={onReset}>
            恢复默认
          </button>
        </div>
        {groups.map((group) => (
          <div key={group} className="mb-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{group}</p>
            {COLUMNS.filter((column) => column.group === group).map((column) => (
              <label key={column.id} className="flex items-center gap-2 py-1 text-sm">
                <Checkbox
                  checked={visible.includes(column.id)}
                  onCheckedChange={() => onToggle(column.id)}
                />
                {column.label}
              </label>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
