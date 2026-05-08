import { ReactNode } from "react";
import { PreviewBanner } from "@/components/preview/PreviewBanner";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PreviewBanner />
      {children}
    </div>
  );
}
