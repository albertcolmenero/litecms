"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function InsertAffordance({
  onClick,
  compact,
  emptyHint,
}: {
  onClick: () => void;
  compact?: boolean;
  emptyHint?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/ins relative flex items-center justify-center",
        compact ? "h-2 -my-1" : "h-6",
        emptyHint && "h-12",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2 transition-opacity",
          emptyHint ? "opacity-100" : "opacity-0 group-hover/ins:opacity-100",
        )}
      >
        <span className="h-px flex-1 bg-blue-400/50" />
        <button
          onClick={onClick}
          className="flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
        >
          <Plus className="h-3 w-3" />
          {emptyHint ? "Add a block" : "Insert"}
        </button>
        <span className="h-px flex-1 bg-blue-400/50" />
      </div>
    </div>
  );
}
