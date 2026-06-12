import { CARD_COLORS, type CardVariant } from "./constants";
import { EXPORT_TARGET_WIDTH, MAX_CANVAS_EDGE, type ExportFormatId } from "./exportFormats";

/**
 * Isolated capture pipeline (html2canvas-pro). All Safari/iOS hardening lives
 * here so the rendering backend can be swapped without touching any UI.
 */

export interface ExportRenderState {
  mode: "flat";
  variant: CardVariant;
  formatId: ExportFormatId;
  statsTheme: "light" | "dark";
  transparent: boolean;
}

export function parseExportState(composeEl: HTMLElement): ExportRenderState | null {
  const stateStr = composeEl.getAttribute("data-export-state");
  if (!stateStr) return null;
  try {
    const s = JSON.parse(stateStr) as ExportRenderState;
    if (s.mode !== "flat") return null;
    return s;
  } catch {
    return null;
  }
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function buildExportFilename(
  state: ExportRenderState,
  activityLabel: string | undefined
): string {
  const slug =
    (activityLabel ?? "activity")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 48) || "activity";
  const bg = state.transparent ? "transparent" : "solid";
  return `lazy-strava-${state.variant}-${state.formatId}-${state.statsTheme}-${bg}-${slug}-${Date.now()}.png`;
}

function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

/**
 * Renders the off-screen export tree to a PNG blob.
 * Hardening: waits for fonts, double-renders on iOS (blank-first-render bug),
 * caps the canvas edge under iOS limits.
 */
export async function renderExportBlob(composeEl: HTMLElement): Promise<Blob | null> {
  const state = parseExportState(composeEl);
  if (!state) throw new Error("No export state found");

  const flatRoot = composeEl.querySelector("[data-export-flat-root]") as HTMLElement | null;
  if (!flatRoot) throw new Error("No export root");

  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  await nextFrame();
  await nextFrame();

  const rect = flatRoot.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) throw new Error("Export root has no size");
  let scale = EXPORT_TARGET_WIDTH / rect.width;
  scale = Math.min(scale, MAX_CANVAS_EDGE / Math.max(rect.width, rect.height));

  const html2canvas = (await import("html2canvas-pro")).default;

  const capture = () =>
    html2canvas(flatRoot, {
      scale,
      useCORS: true,
      allowTaint: true,
      // Must be `null` for transparency — omitting makes html2canvas-pro use opaque white.
      backgroundColor: null,
      removeContainer: true,
    });

  // iOS Safari frequently produces a blank canvas on the first render after
  // load; the documented workaround is to render twice and keep the second.
  if (isIOS()) {
    await capture();
  }
  const snapshot = await capture();

  const out = document.createElement("canvas");
  out.width = snapshot.width;
  out.height = snapshot.height;
  const ctx = out.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Could not get 2d context");

  // Framed formats paint their background in-DOM; only the content-sized
  // sticker needs a solid composited behind it when not transparent.
  if (state.formatId === "sticker" && !state.transparent) {
    ctx.fillStyle = CARD_COLORS[state.statsTheme].bg;
    ctx.fillRect(0, 0, out.width, out.height);
  } else {
    ctx.clearRect(0, 0, out.width, out.height);
  }
  ctx.drawImage(snapshot, 0, 0);

  return new Promise((resolve) => {
    out.toBlob(resolve, "image/png");
  });
}

/**
 * Saves a PNG via a temporary <a download> link. Works on Android/desktop;
 * iOS Safari routes it to the Files app (callers should prefer the
 * long-press-to-save modal there).
 */
export function downloadPngBlob(blob: Blob, downloadName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = downloadName;
  a.rel = "noopener";
  a.style.cssText = "position:fixed;left:-9999px;top:0;";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 2500);
}

export function pngFileFromBlob(blob: Blob, name: string): File | null {
  if (typeof File === "undefined") return null;
  return new File([blob], name, { type: "image/png" });
}

export function canShareFiles(file: File | null): boolean {
  if (!file || typeof navigator === "undefined") return false;
  return !!navigator.canShare?.({ files: [file] });
}
