"use client";

import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";
import type { BlockContext } from "./blocks";
import { type Path } from "@/lib/wysiwyg-ast";

export function ActionBar({ path, ctx, label }: { path: Path; ctx: BlockContext; label?: string }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute left-0 -top-9 z-20 flex items-center gap-0.5 rounded-md border border-border bg-popover px-1 py-0.5 shadow-md"
    >
      <span className="px-1.5 py-1 text-[11px] font-medium text-muted-foreground">
        {label ?? "Block"}
      </span>
      <span className="h-4 w-px bg-border mx-0.5" />
      <button
        onClick={() => ctx.onMoveUp(path)}
        title="Move up"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => ctx.onMoveDown(path)}
        title="Move down"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => ctx.onDuplicate(path)}
        title="Duplicate"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => ctx.onDelete(path)}
        title="Delete"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
