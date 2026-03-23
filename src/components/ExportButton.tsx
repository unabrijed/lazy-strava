"use client";

import { useState } from "react";

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;

interface LayerState {
  id: string;
  pos: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface ExportState {
  canvasWidth: number;
  canvasHeight: number;
  cardStyle: "map" | "compact";
  layers: LayerState[];
}

interface ExportButtonProps {
  composeRef: React.RefObject<HTMLDivElement | null>;
  hasBackgroundImage: boolean;
  backgroundMediaUrl?: string;
  filename?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

/**
 * Renders individual overlay DOM elements at 1:1 scale using html2canvas,
 * then composites them onto a Canvas 2D at the correct position/scale/rotation.
 * This bypasses html2canvas's broken CSS transform interpretation entirely.
 */
export function ExportButton({
  composeRef,
  hasBackgroundImage,
  backgroundMediaUrl,
  filename,
  canvasWidth = DEFAULT_WIDTH,
  canvasHeight = DEFAULT_HEIGHT,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleExport = async () => {
    const el = composeRef.current;
    if (!el || loading) return;
    setStatus("idle");
    setLoading(true);

    try {
      // 1. Read layer state from the DOM
      const stateStr = el.getAttribute("data-export-state");
      if (!stateStr) throw new Error("No export state found");
      const exportState: ExportState = JSON.parse(stateStr);
      const cW = exportState.canvasWidth || canvasWidth;
      const cH = exportState.canvasHeight || canvasHeight;

      // 2. Create main canvas at the image's native resolution
      const mainCanvas = document.createElement("canvas");
      mainCanvas.width = cW;
      mainCanvas.height = cH;
      const ctx = mainCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      // 3. Draw background
      if (hasBackgroundImage && backgroundMediaUrl) {
        const bgImg = await loadImage(backgroundMediaUrl);
        ctx.drawImage(bgImg, 0, 0, cW, cH);
      } else {
        // Draw gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, cH);
        grad.addColorStop(0, "#e4e4e7"); // zinc-200
        grad.addColorStop(1, "#d4d4d8"); // zinc-300
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cW, cH);
      }

      // 4. Render and composite each overlay layer
      const html2canvas = (await import("html2canvas-pro")).default;

      for (const layer of exportState.layers) {
        // Find the overlay content element in the DOM
        const contentEl = el.querySelector(
          `[data-layer-content="${layer.id}"]`
        ) as HTMLElement | null;
        if (!contentEl) continue;

        // Clone the element into an off-screen container for clean rendering
        const offscreen = document.createElement("div");
        offscreen.style.position = "fixed";
        offscreen.style.left = "-9999px";
        offscreen.style.top = "0";
        offscreen.style.zIndex = "-1";
        offscreen.style.pointerEvents = "none";
        // Important: match the font/styles context
        offscreen.className = document.body.className;
        document.body.appendChild(offscreen);

        const clone = contentEl.cloneNode(true) as HTMLElement;
        // Strip any selection ring classes from the clone
        clone.querySelectorAll(".ring-2").forEach((ringEl) => {
          ringEl.classList.remove("ring-2", "ring-[#FC4C02]", "ring-offset-2");
        });
        // Remove html2canvas-ignore elements (resize/rotate handles)
        clone.querySelectorAll("[data-html2canvas-ignore]").forEach((h) => h.remove());
        offscreen.appendChild(clone);

        // Give the browser a frame to layout the clone
        await new Promise((r) => requestAnimationFrame(r));

        // Render at higher scale so the bitmap has enough resolution for the large canvas
        // e.g., if canvas is 3024px wide and the element is ~320px, we need ~3x scale
        const renderScale = Math.max(2, Math.ceil(cW / 500));
        const layerCanvas = await html2canvas(clone, {
          scale: renderScale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null, // transparent background
        });

        // Clean up off-screen container
        document.body.removeChild(offscreen);

        // 5. Composite onto main canvas using Canvas 2D transforms
        // layerCanvas is renderScale× larger than the DOM element's CSS size.
        // We need to divide by renderScale when drawing so the element appears
        // at its correct CSS-pixel size relative to the canvas.
        const lw = layerCanvas.width / renderScale;
        const lh = layerCanvas.height / renderScale;
        const targetX = layer.pos.x * cW;
        const targetY = layer.pos.y * cH;
        const radians = (layer.rotation * Math.PI) / 180;

        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate(radians);
        ctx.scale(layer.scale, layer.scale);
        // Draw centered at origin using the CSS-pixel size, canvas stretches
        // the high-res bitmap down to the correct visual size
        ctx.drawImage(layerCanvas, -lw / 2, -lh / 2, lw, lh);
        ctx.restore();
      }

      // 6. Export as PNG
      const blob = await new Promise<Blob | null>((resolve) => {
        mainCanvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        setStatus("error");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeFilename = filename
        ? filename.replace(/[^a-z0-9]/gi, "-").toLowerCase()
        : hasBackgroundImage
          ? "story"
          : "stats";
      a.download = `lazy-strava-${safeFilename}-${Date.now()}.png`;
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

/** Helper to load an image as a promise */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
