"use client";

import type { Exporter } from "@/hooks/useExportImage";
import { EXPORT_FORMAT_LIST, type ExportFormatId } from "@/lib/exportFormats";
import { uiSegmentActive, uiSegmentInactive } from "@/lib/ui";

interface ExportPanelProps {
  exporter: Exporter;
  formatId: ExportFormatId;
  onFormatChange: (id: ExportFormatId) => void;
  transparent: boolean;
  onTransparentChange: (v: boolean) => void;
  /** Tighter spacing for the mobile bottom bar. */
  compact?: boolean;
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/**
 * Format picker + Share/Save actions. Rendered in the desktop preview aside
 * and (compact) inside the mobile bottom bar.
 */
export function ExportPanel({
  exporter,
  formatId,
  onFormatChange,
  transparent,
  onTransparentChange,
  compact = false,
}: ExportPanelProps) {
  const {
    share,
    save,
    warmUp,
    status,
    busy,
    errorMessage,
    dismissError,
    shareSupported,
  } = exporter;

  const primaryBtn =
    "inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FC4C02] px-4 text-sm font-semibold text-white transition-colors touch-manipulation hover:bg-[#e64402] active:bg-[#e64402] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryBtn =
    "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-transparent px-4 text-sm font-semibold text-zinc-700 transition-colors touch-manipulation hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {EXPORT_FORMAT_LIST.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFormatChange(f.id)}
            aria-pressed={formatId === f.id}
            className={formatId === f.id ? uiSegmentActive : uiSegmentInactive}
          >
            {compact ? f.shortLabel : f.label}
          </button>
        ))}
        {formatId === "sticker" && (
          <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => onTransparentChange(e.target.checked)}
              className="h-4 w-4 accent-[#FC4C02]"
            />
            Transparent
          </label>
        )}
      </div>

      <div className="flex gap-2">
        {shareSupported ? (
          <>
            <button
              type="button"
              onClick={share}
              onPointerDown={warmUp}
              disabled={busy !== null}
              aria-busy={busy === "share"}
              className={primaryBtn}
            >
              {busy === "share" ? <Spinner className="h-5 w-5 text-white" /> : <ShareIcon className="h-5 w-5" />}
              {busy === "share" ? "Preparing…" : "Share"}
            </button>
            <button
              type="button"
              onClick={save}
              onPointerDown={warmUp}
              disabled={busy !== null}
              aria-busy={busy === "save"}
              title="Save to device"
              aria-label="Save to device"
              className={secondaryBtn}
            >
              {busy === "save" ? <Spinner className="h-5 w-5" /> : <DownloadIcon className="h-5 w-5" />}
              <span className={compact ? "sr-only" : ""}>Save</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={save}
            onPointerDown={warmUp}
            disabled={busy !== null}
            aria-busy={busy === "save"}
            className={primaryBtn}
          >
            {busy === "save" ? <Spinner className="h-5 w-5 text-white" /> : <DownloadIcon className="h-5 w-5" />}
            {busy === "save" ? "Preparing…" : "Download PNG"}
          </button>
        )}
      </div>

      {status === "shared" && (
        <p className="text-xs text-green-600 dark:text-green-500" role="status" aria-live="polite">
          Share sheet opened.
        </p>
      )}
      {status === "downloaded" && (
        <p className="text-xs text-green-600 dark:text-green-500" role="status" aria-live="polite">
          Download started.
        </p>
      )}
      {status === "error" && errorMessage && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-left dark:border-red-900/50 dark:bg-red-950/40"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-xs font-medium text-red-800 dark:text-red-200">
            Export failed: <span className="font-normal">{errorMessage}</span>
          </p>
          <button
            type="button"
            onClick={dismissError}
            className="mt-1.5 text-xs font-semibold text-red-700 underline underline-offset-2 dark:text-red-300 touch-manipulation"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
