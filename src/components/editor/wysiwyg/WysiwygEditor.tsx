"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  type AstNode,
  type AstRoot,
  type Path,
  duplicateAt,
  getNodeAtPath,
  insertAt,
  isAncestor,
  moveDown,
  moveUp,
  parseMarkdown,
  pathsEqual,
  removeAt,
  serializeMarkdown,
} from "@/lib/wysiwyg-ast";
import { BlockRenderer, type BlockContext } from "./blocks";
import { AttributePanel } from "./AttributePanel";
import { SlashMenu } from "./SlashMenu";

type Props = {
  source: string;
  site?: any;
  onChange?: (markdown: string) => void;
};

export function WysiwygEditor({ source, site, onChange }: Props) {
  // Parse on mount + when source changes from outside (e.g. mode toggle).
  // We track the last source we serialized to suppress re-parse loops.
  const lastEmittedRef = useRef<string>(source);
  const [{ tree, frontmatter }, setParsed] = useState(() => parseMarkdown(source));
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashTarget, setSlashTarget] = useState<{ parentPath: Path; index: number } | null>(null);

  // Re-parse when external source changes (and isn't what we just emitted)
  useEffect(() => {
    if (source === lastEmittedRef.current) return;
    const next = parseMarkdown(source);
    setParsed(next);
    setSelectedPath(null);
    lastEmittedRef.current = source;
  }, [source]);

  const emit = useCallback(
    (newTree: AstRoot) => {
      const nextSource = serializeMarkdown(newTree, frontmatter);
      lastEmittedRef.current = nextSource;
      onChange?.(nextSource);
    },
    [onChange, frontmatter],
  );

  const mutate = useCallback(
    (fn: (tree: AstRoot) => AstRoot) => {
      setParsed((prev) => {
        const newTree = fn(prev.tree);
        emit(newTree);
        return { ...prev, tree: newTree };
      });
    },
    [emit],
  );

  const mutateAndSelect = useCallback(
    (fn: (tree: AstRoot) => { tree: AstRoot; newPath: Path }) => {
      setParsed((prev) => {
        const { tree: newTree, newPath } = fn(prev.tree);
        emit(newTree);
        setSelectedPath(newPath);
        return { ...prev, tree: newTree };
      });
    },
    [emit],
  );

  const handleSelect = useCallback((path: Path | null) => {
    setSelectedPath(path);
  }, []);

  const handleInsertAt = useCallback((parentPath: Path, index: number) => {
    setSlashTarget({ parentPath, index });
    setSlashOpen(true);
  }, []);

  const handleSlashPick = useCallback(
    (factory: () => AstNode) => {
      if (!slashTarget) return;
      const newNode = factory();
      mutateAndSelect((t) => {
        const next = insertAt(t, slashTarget.parentPath, slashTarget.index, newNode);
        return { tree: next, newPath: [...slashTarget.parentPath, slashTarget.index] };
      });
    },
    [slashTarget, mutateAndSelect],
  );

  const handleMoveUp = useCallback(
    (path: Path) => {
      setParsed((prev) => {
        const { tree: nextTree, newPath } = moveUp(prev.tree, path);
        emit(nextTree);
        setSelectedPath(newPath);
        return { ...prev, tree: nextTree };
      });
    },
    [emit],
  );

  const handleMoveDown = useCallback(
    (path: Path) => {
      setParsed((prev) => {
        const { tree: nextTree, newPath } = moveDown(prev.tree, path);
        emit(nextTree);
        setSelectedPath(newPath);
        return { ...prev, tree: nextTree };
      });
    },
    [emit],
  );

  const handleDuplicate = useCallback(
    (path: Path) => {
      mutate((t) => duplicateAt(t, path));
    },
    [mutate],
  );

  const handleDelete = useCallback(
    (path: Path) => {
      // Clear selection if deleting selected (or its ancestor)
      if (selectedPath && (pathsEqual(selectedPath, path) || isAncestor(path, selectedPath))) {
        setSelectedPath(null);
      }
      mutate((t) => removeAt(t, path));
    },
    [mutate, selectedPath],
  );

  // Keyboard shortcut: Cmd+/ or just "/" when nothing focused → open slash menu at end
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (slashOpen) {
          setSlashOpen(false);
        } else {
          setSelectedPath(null);
        }
        return;
      }
      // Slash open when not in a contentEditable / input
      const target = e.target as HTMLElement;
      const inEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (e.key === "/" && (e.metaKey || e.ctrlKey) && !inEditable) {
        e.preventDefault();
        const rootChildren = (tree.children || []).length;
        setSlashTarget({ parentPath: [], index: rootChildren });
        setSlashOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slashOpen, tree]);

  const ctx: BlockContext = useMemo(
    () => ({
      selectedPath,
      onSelect: handleSelect,
      onMutate: mutate,
      onMutateAndSelect: mutateAndSelect,
      onInsertAt: handleInsertAt,
      onMoveUp: handleMoveUp,
      onMoveDown: handleMoveDown,
      onDuplicate: handleDuplicate,
      onDelete: handleDelete,
    }),
    [
      selectedPath,
      handleSelect,
      mutate,
      mutateAndSelect,
      handleInsertAt,
      handleMoveUp,
      handleMoveDown,
      handleDuplicate,
      handleDelete,
    ],
  );

  const selectedNode = selectedPath ? getNodeAtPath(tree, selectedPath) : null;

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Canvas */}
      <div
        className="flex-1 overflow-y-auto bg-background p-8"
        onClick={() => setSelectedPath(null)}
      >
        <div className="mx-auto max-w-5xl space-y-1">
          {tree.children.length === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSlashTarget({ parentPath: [], index: 0 });
                setSlashOpen(true);
              }}
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-12 hover:border-foreground/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="mt-3 text-sm font-medium">This page is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click to add your first block
              </p>
            </button>
          ) : (
            <BlockRenderer node={tree} path={[]} ctx={ctx} isRoot />
          )}
        </div>
      </div>

      {/* Right rail */}
      <aside className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto">
        <AttributePanel
          node={selectedNode}
          path={selectedPath}
          onMutate={mutate}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </aside>

      {/* Slash menu */}
      <SlashMenu
        open={slashOpen}
        onClose={() => setSlashOpen(false)}
        onPick={handleSlashPick}
      />
    </div>
  );
}
