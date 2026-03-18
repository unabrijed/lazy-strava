"use client";

import { useState } from "react";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

interface ExportButtonProps {
  composeRef: React.RefObject<HTMLDivElement | null>;
  hasBackgroundImage: boolean;
  gradientRef?: React.RefObject<HTMLDivElement | null>;
}

export function ExportButton({ composeRef, hasBackgroundImage, gradientRef }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleExport = async () => {
    const el = composeRef.current;
    if (!el || loading) return;
    setStatus("idle");
    setLoading(true);
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    try {
      const gradientEl = gradientRef?.current;
      if (!hasBackgroundImage && gradientEl) {
        gradientEl.style.opacity = "0";
        await new Promise((r) => requestAnimationFrame(r));
      }

      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(el, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: hasBackgroundImage ? "#0a0a0a" : null,
      });

      if (gradientEl) {
        gradientEl.style.opacity = "";
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        setStatus("error");
        return;
      }

      if (canvas.width !== STORY_WIDTH || canvas.height !== STORY_HEIGHT) {
        console.warn(
          `Export resolution mismatch: got ${canvas.width}×${canvas.height}, expected ${STORY_WIDTH}×${STORY_HEIGHT}`
        );
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = hasBackgroundImage
        ? `lazy-strava-story-${Date.now()}.png`
        : `lazy-strava-stats-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Export failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        aria-live="polite"
        aria-busy={loading}
        aria-label={loading ? "Exporting image" : "Export for Instagram"}
        className="min-h-[48px] w-full sm:w-auto rounded-lg bg-[#FC4C02] px-6 py-3 font-medium text-white hover:bg-[#e64402] active:bg-[#e64402] disabled:opacity-70 disabled:cursor-not-allowed transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2"
      >
        {loading ? "Exporting..." : "Export for Instagram"}
      </button>
      {status === "success" && (
        <p className="text-sm text-green-600" role="status" aria-live="polite">
          Download started. Check your downloads folder.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
          Export failed. Try again.
        </p>
      )}
    </div>
  );
}
