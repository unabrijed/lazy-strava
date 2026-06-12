"use client";

import type { Exporter } from "@/hooks/useExportImage";
import type { ExportFormatId } from "@/lib/exportFormats";
import { ExportPanel } from "./ExportPanel";

interface ExportBarProps {
  exporter: Exporter;
  formatId: ExportFormatId;
  onFormatChange: (id: ExportFormatId) => void;
  transparent: boolean;
  onTransparentChange: (v: boolean) => void;
}

/** Mobile-only fixed bottom bar so Share is always one thumb-tap away. */
export function ExportBar(props: ExportBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-background/95 px-4 pt-3 backdrop-blur-md dark:border-zinc-800/80 lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-xl">
        <ExportPanel {...props} compact />
      </div>
    </div>
  );
}
