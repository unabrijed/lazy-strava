"use client";

import { useRef } from "react";
import html2canvas from "html2canvas-pro";

interface ExportButtonProps {
  composeRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportButton({ composeRef }: ExportButtonProps) {
  const handleExport = async () => {
    const el = composeRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "instant", block: "center" });

    try {
      const canvas = await html2canvas(el, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0a0a0a",
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lazy-strava-story-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="min-h-[48px] w-full sm:w-auto rounded-lg bg-[#FC4C02] px-6 py-3 font-medium text-white hover:bg-[#e64402] active:bg-[#e64402] transition-colors touch-manipulation"
    >
      Export for Instagram
    </button>
  );
}
