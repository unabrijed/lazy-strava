"use client";

import { useState, useRef, useEffect } from "react";

function formatErrorForUser(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

const DEFAULT_EXPORT_WIDTH = 1080;

interface ExportState {
  mode: "flat";
  canvasWidth: number;
  cardStyle: "map" | "compact";
  /** Omitted in older builds; default dark. */
  statsTheme?: "light" | "dark";
}

function parseExportState(composeEl: HTMLElement): ExportState | null {
  const stateStr = composeEl.getAttribute("data-export-state");
  if (!stateStr) return null;
  try {
    const s = JSON.parse(stateStr) as ExportState;
    if (s.mode !== "flat") return null;
    return s;
  } catch {
    return null;
  }
}

/** Solid canvas fill for “with background” — matches app light/dark surfaces. */
function exportSolidBackgroundColor(statsTheme: "light" | "dark"): string {
  return statsTheme === "light" ? "#fafafa" : "#09090b";
}

function buildExportFilename(
  exportState: ExportState,
  withBackground: boolean,
  activityLabel: string | undefined
): string {
  const slug = (activityLabel ?? "activity")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 48) || "activity";
  const bg = withBackground ? "solid" : "transparent";
  const theme = exportState.statsTheme ?? "dark";
  return `lazy-strava-stats-${exportState.cardStyle}-${theme}-${bg}-${slug}-${Date.now()}.png`;
}

interface ExportButtonProps {
  composeRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  /** Matches story vs compact so help text is accurate. */
  cardStyle?: "map" | "compact";
}

type ExportAction = "download" | "share";
type LoadingKey =
  | "with-bg-download"
  | "with-bg-share"
  | "no-bg-download"
  | "no-bg-share"
  | null;

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Captures the off-screen export tree (single flat DOM) with html2canvas,
 * then optionally draws a theme-matched solid behind the image (fills gaps in compact layout).
 */
export function ExportButton({
  composeRef,
  filename,
  cardStyle = "map",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState<LoadingKey>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [successKind, setSuccessKind] = useState<"share" | "download">("download");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearErrorAutoDismiss = () => {
    if (errorClearTimeoutRef.current) {
      clearTimeout(errorClearTimeoutRef.current);
      errorClearTimeoutRef.current = null;
    }
  };

  const dismissError = () => {
    clearErrorAutoDismiss();
    setErrorMessage(null);
    setStatus("idle");
  };

  const scheduleErrorClear = () => {
    clearErrorAutoDismiss();
    errorClearTimeoutRef.current = setTimeout(() => {
      setStatus("idle");
      setErrorMessage(null);
      errorClearTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (errorClearTimeoutRef.current) {
        clearTimeout(errorClearTimeoutRef.current);
      }
    };
  }, []);

  const handleExport = async (
    withBackground: boolean,
    action: ExportAction
  ) => {
    const el = composeRef.current;
    if (!el || loading) return;
    clearErrorAutoDismiss();
    setStatus("idle");
    setErrorMessage(null);
    setLoading(true);
    const key: LoadingKey = withBackground
      ? action === "download"
        ? "with-bg-download"
        : "with-bg-share"
      : action === "download"
        ? "no-bg-download"
        : "no-bg-share";
    setLoadingKey(key);

    try {
      const blob = await renderStoryPngBlob(el, {
        withBackground,
        fallbackWidth: DEFAULT_EXPORT_WIDTH,
      });

      if (!blob) {
        setErrorMessage(
          "Could not create image file (browser blocked or canvas too large). Try a different browser or smaller canvas."
        );
        setStatus("error");
        scheduleErrorClear();
        return;
      }

      const parsed = parseExportState(el);
      const downloadName =
        parsed != null
          ? buildExportFilename(parsed, withBackground, filename)
          : `lazy-strava-stats-export-${withBackground ? "solid" : "transparent"}-${Date.now()}.png`;

      if (action === "download") {
        downloadPngBlob(blob, downloadName);
        setSuccessKind("download");
      } else {
        const how = await sharePngFile(blob, downloadName);
        if (how === "aborted") return;
        if (how === "unavailable") {
          setErrorMessage(
            "Sharing isn’t available in this browser. Use the download button to save the PNG."
          );
          setStatus("error");
          scheduleErrorClear();
          return;
        }
        setSuccessKind("share");
      }

      setErrorMessage(null);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Export failed:", err);
      setErrorMessage(formatErrorForUser(err));
      setStatus("error");
      scheduleErrorClear();
    } finally {
      setLoading(false);
      setLoadingKey(null);
    }
  };

  const iconBtnBase =
    "inline-flex h-11 min-w-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {cardStyle === "compact" ? (
          <>
            Route + stats only, centered (horizontal/vertical matches your layout).{" "}
            <span className="font-medium text-zinc-600 dark:text-zinc-300">With background</span> uses a
            solid that matches the preview theme (light or dark) behind transparent gaps;{" "}
            <span className="font-medium text-zinc-600 dark:text-zinc-300">without background</span> is a
            transparent PNG for layering on your own photo.
          </>
        ) : (
          <>
            Full card (mini map + stats) at 1080px wide — no tall empty story frame.{" "}
            <span className="font-medium text-zinc-600 dark:text-zinc-300">With background</span> adds a
            theme-matched solid around the card; use{" "}
            <span className="font-medium text-zinc-600 dark:text-zinc-300">without background</span> for a
            PNG with no outer fill.
          </>
        )}
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50 space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            With background
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Same image as transparent export, with a light or dark solid behind (matches your preview theme).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport(true, "download")}
            disabled={loading}
            aria-busy={loadingKey === "with-bg-download"}
            title="Download PNG with background"
            aria-label="Download PNG with background"
            className={`${iconBtnBase} bg-[#FC4C02] text-white hover:bg-[#e64402] active:bg-[#e64402]`}
          >
            {loadingKey === "with-bg-download" ? (
              <Spinner className="h-5 w-5 text-white" />
            ) : (
              <DownloadIcon className="h-5 w-5" />
            )}
            <span className="sm:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport(true, "share")}
            disabled={loading}
            aria-busy={loadingKey === "with-bg-share"}
            title="Share PNG with background"
            aria-label="Share PNG with background"
            className={`${iconBtnBase} border-2 border-[#FC4C02] bg-transparent text-[#FC4C02] hover:bg-[#FC4C02]/10 active:bg-[#FC4C02]/15 dark:hover:bg-[#FC4C02]/15`}
          >
            {loadingKey === "with-bg-share" ? (
              <Spinner className="h-5 w-5 text-[#FC4C02]" />
            ) : (
              <ShareIcon className="h-5 w-5" />
            )}
            <span className="sm:inline">Share</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 dark:border-zinc-600 dark:bg-zinc-950/40 space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Without background
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Transparent PNG — drop onto your own image in Stories or editors.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport(false, "download")}
            disabled={loading}
            aria-busy={loadingKey === "no-bg-download"}
            title="Download transparent PNG"
            aria-label="Download transparent PNG"
            className={`${iconBtnBase} bg-zinc-800 text-white hover:bg-zinc-900 active:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600`}
          >
            {loadingKey === "no-bg-download" ? (
              <Spinner className="h-5 w-5 text-white" />
            ) : (
              <DownloadIcon className="h-5 w-5" />
            )}
            <span className="sm:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport(false, "share")}
            disabled={loading}
            aria-busy={loadingKey === "no-bg-share"}
            title="Share transparent PNG"
            aria-label="Share transparent PNG"
            className={`${iconBtnBase} border-2 border-zinc-400 bg-transparent text-zinc-800 hover:bg-zinc-200/80 dark:border-zinc-500 dark:text-zinc-200 dark:hover:bg-zinc-800/80`}
          >
            {loadingKey === "no-bg-share" ? (
              <Spinner className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
            ) : (
              <ShareIcon className="h-5 w-5" />
            )}
            <span className="sm:inline">Share</span>
          </button>
        </div>
      </div>

      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-500" role="status" aria-live="polite">
          {successKind === "share"
            ? "Share sheet opened — pick an app or Save Image."
            : "Download started. On mobile, check the notification bar if the file doesn’t appear in Downloads."}
        </p>
      )}
      {status === "error" && errorMessage && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-left dark:border-red-900/50 dark:bg-red-950/40"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-200">Export failed</p>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300 wrap-break-word whitespace-pre-wrap">{errorMessage}</p>
          <button
            type="button"
            onClick={dismissError}
            className="mt-3 min-h-[44px] rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 touch-manipulation dark:border-red-800 dark:bg-red-950/30 dark:text-red-100 dark:hover:bg-red-900/40"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

async function renderStoryPngBlob(
  composeEl: HTMLElement,
  options: {
    withBackground: boolean;
    fallbackWidth: number;
  }
): Promise<Blob | null> {
  const { withBackground, fallbackWidth } = options;
  const stateStr = composeEl.getAttribute("data-export-state");
  if (!stateStr) throw new Error("No export state found");
  const exportState: ExportState = JSON.parse(stateStr);
  if (exportState.mode !== "flat") {
    throw new Error("Unsupported export mode");
  }

  const flatRoot = composeEl.querySelector("[data-export-flat-root]") as HTMLElement | null;
  if (!flatRoot) throw new Error("No export root");

  const cW = exportState.canvasWidth || fallbackWidth;
  const renderScale = Math.max(2, Math.ceil(cW / 400));

  const html2canvas = (await import("html2canvas-pro")).default;

  await new Promise((r) => requestAnimationFrame(r));

  const snapshot = await html2canvas(flatRoot, {
    scale: renderScale,
    useCORS: true,
    allowTaint: true,
    // Must be `null` for transparency — omitting the option makes html2canvas-pro use opaque white.
    backgroundColor: null,
    removeContainer: true,
  });

  const out = document.createElement("canvas");
  out.width = snapshot.width;
  out.height = snapshot.height;
  const ctx = out.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Could not get 2d context");

  if (withBackground) {
    const theme = exportState.statsTheme ?? "dark";
    ctx.fillStyle = exportSolidBackgroundColor(theme);
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
 * Saves a PNG using a temporary &lt;a download&gt; link (blob URL).
 * Mobile Safari often ignores this; users can use Share on supported devices.
 */
function downloadPngBlob(blob: Blob, downloadName: string): void {
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

async function sharePngFile(
  blob: Blob,
  downloadName: string
): Promise<"share" | "unavailable" | "aborted"> {
  const file =
    typeof File !== "undefined"
      ? new File([blob], downloadName, { type: "image/png" })
      : null;

  if (!file || typeof navigator === "undefined") {
    return "unavailable";
  }

  if (!navigator.canShare?.({ files: [file] })) {
    return "unavailable";
  }

  try {
    await navigator.share({
      files: [file],
      title: downloadName,
    });
    return "share";
  } catch (e) {
    const err = e as { name?: string };
    if (err?.name === "AbortError") return "aborted";
    return "unavailable";
  }
}
