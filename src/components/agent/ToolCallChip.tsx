"use client";

import { Check, Loader2, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ToolPart = {
  type: string; // "tool-page_read" | "tool-page_replaceWhole" | etc.
  state: string; // "input-streaming" | "input-available" | "output-available" | "output-error"
  toolCallId?: string;
  input?: any;
  output?: any;
  errorText?: string;
};

const TOOL_LABELS: Record<string, string> = {
  page_getContext: "Reading site context",
  page_read: "Reading current page",
  page_expandBlock: "Reading block",
  page_editBlocks: "Editing blocks",
  page_replaceWhole: "Building page",
  media_search: "Searching media",
  forms_list: "Listing forms",
  style_getRecipe: "Loading recipe",
  style_getBrandVoice: "Loading brand voice",
};

function getToolName(partType: string): string {
  return partType.replace(/^tool-/, "");
}

function summarizeInput(toolName: string, input: any): string {
  if (!input) return "";
  switch (toolName) {
    case "page_replaceWhole":
      return `${input.markdown?.length ?? 0} chars · ${input.reason ?? ""}`;
    case "page_editBlocks":
      return `${input.ops?.length ?? 0} op${input.ops?.length === 1 ? "" : "s"} · ${input.reason ?? ""}`;
    case "page_expandBlock":
      return `block ${input.blockId}`;
    case "media_search":
      return input.query ? `"${input.query}"` : "all";
    case "style_getRecipe":
      return `pageType="${input.pageType ?? "home"}"`;
    default:
      return "";
  }
}

export function ToolCallChip({ part }: { part: ToolPart }) {
  const [expanded, setExpanded] = useState(false);
  const toolName = getToolName(part.type);
  const label = TOOL_LABELS[toolName] ?? toolName;
  const summary = summarizeInput(toolName, part.input);

  const isStreaming = part.state === "input-streaming" || part.state === "input-available";
  const isDone = part.state === "output-available";
  const isError = part.state === "output-error";

  return (
    <div className="my-1 rounded-md border border-border bg-muted/30 text-xs">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
      >
        <span className="flex h-4 w-4 items-center justify-center">
          {isStreaming ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : isError ? (
            <X className="h-3 w-3 text-destructive" />
          ) : (
            <Check className="h-3 w-3 text-emerald-600" />
          )}
        </span>
        <span className="font-mono text-muted-foreground">{label}</span>
        {summary ? <span className="text-muted-foreground/70 truncate">{summary}</span> : null}
        <ChevronDown className={cn("ml-auto h-3 w-3 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded ? (
        <div className="border-t border-border px-2.5 py-2 text-[11px] font-mono text-muted-foreground space-y-1.5">
          {part.input ? (
            <div>
              <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Input</div>
              <pre className="whitespace-pre-wrap break-all rounded bg-background border border-border p-1.5 max-h-40 overflow-y-auto">
                {JSON.stringify(part.input, null, 2).slice(0, 1500)}
              </pre>
            </div>
          ) : null}
          {part.output ? (
            <div>
              <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Output</div>
              <pre className="whitespace-pre-wrap break-all rounded bg-background border border-border p-1.5 max-h-40 overflow-y-auto">
                {JSON.stringify(part.output, null, 2).slice(0, 1500)}
              </pre>
            </div>
          ) : null}
          {part.errorText ? (
            <div className="text-destructive">{part.errorText}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
