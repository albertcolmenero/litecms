import Link from "next/link";

export function PreviewBanner() {
  return (
    <div className="flex items-center justify-center gap-3 bg-foreground px-4 py-1.5 text-center text-[11px] font-medium text-background">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Prototype — clickable IA preview, no live data
      </span>
      <span className="text-background/50">·</span>
      <Link href="/app" className="text-background/80 hover:text-background underline-offset-2 hover:underline">
        Back to live dashboard
      </Link>
    </div>
  );
}
