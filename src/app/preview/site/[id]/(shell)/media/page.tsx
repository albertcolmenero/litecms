import { Upload, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ASSETS } from "@/components/preview/mock";

export default function MediaLibrary() {
  return (
    <>
      <PageHeader
        title="Media"
        description="Images and PDFs uploaded to Vercel Blob. 10 MB max per file."
        action={
          <Button>
            <Upload className="mr-1.5 h-4 w-4" />
            Upload
          </Button>
        }
      />

      <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">Drop files here</p>
        <p className="mt-0.5 text-xs text-muted-foreground">or click Upload to browse</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ASSETS.map((a) => {
          const isImage = a.mimeType.startsWith("image/");
          return (
            <div
              key={a.id}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/20 transition-colors"
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                {isImage ? (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-foreground">{a.filename}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                  {a.size} · {a.mimeType.split("/")[1]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
