"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  buildExportFilename,
  canShareFiles,
  downloadPngBlob,
  isIOS,
  parseExportState,
  pngFileFromBlob,
  renderExportBlob,
} from "@/lib/exportRenderer";

export type ExportStatus = "idle" | "preparing" | "shared" | "downloaded" | "error";

interface UseExportImageOptions {
  exportRef: React.RefObject<HTMLDivElement | null>;
  /** Serialized inputs that change the pixels; render cache is keyed on it. */
  cacheKey: string;
  filenameBase?: string;
}

interface CachedExport {
  key: string;
  blob: Blob;
  file: File | null;
}

let shareProbeResult: boolean | null = null;
function getShareSupported(): boolean {
  if (shareProbeResult === null) {
    shareProbeResult = canShareFiles(
      pngFileFromBlob(new Blob(["probe"], { type: "image/png" }), "probe.png")
    );
  }
  return shareProbeResult;
}
const noopSubscribe = () => () => {};

function formatErrorForUser(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

/**
 * Pre-renders the export PNG in the background (debounced on edits) so the
 * Share tap can call navigator.share() synchronously inside the user gesture —
 * iOS Safari revokes transient activation across slow awaits.
 */
export function useExportImage({ exportRef, cacheKey, filenameBase }: UseExportImageOptions) {
  const cacheRef = useRef<CachedExport | null>(null);
  const keyRef = useRef(cacheKey);
  const filenameRef = useRef(filenameBase);
  useEffect(() => {
    keyRef.current = cacheKey;
    filenameRef.current = filenameBase;
  }, [cacheKey, filenameBase]);
  const inFlightRef = useRef<Promise<CachedExport | null> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<ExportStatus>("idle");
  const [busy, setBusy] = useState<null | "share" | "save">(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveModalUrl, setSaveModalUrlState] = useState<string | null>(null);
  const saveModalUrlRef = useRef<string | null>(null);
  const shareSupported = useSyncExternalStore(noopSubscribe, getShareSupported, () => false);

  const setSaveModalUrl = useCallback((url: string | null) => {
    if (saveModalUrlRef.current) URL.revokeObjectURL(saveModalUrlRef.current);
    saveModalUrlRef.current = url;
    setSaveModalUrlState(url);
  }, []);

  const scheduleIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setStatus("idle"), 3000);
  }, []);

  const renderForKey = useCallback(async (): Promise<CachedExport | null> => {
    const el = exportRef.current;
    if (!el) return null;
    // If edits land mid-render the result is stale — retry on the fresh DOM.
    for (let attempt = 0; attempt < 3; attempt++) {
      const key = keyRef.current;
      const blob = await renderExportBlob(el);
      if (!blob) return null;
      if (key === keyRef.current) {
        const state = parseExportState(el);
        const name = state
          ? buildExportFilename(state, filenameRef.current)
          : `lazy-strava-${Date.now()}.png`;
        const cached: CachedExport = { key, blob, file: pngFileFromBlob(blob, name) };
        cacheRef.current = cached;
        return cached;
      }
    }
    return null;
  }, [exportRef]);

  const ensureRender = useCallback((): Promise<CachedExport | null> => {
    if (cacheRef.current?.key === keyRef.current) {
      return Promise.resolve(cacheRef.current);
    }
    if (!inFlightRef.current) {
      inFlightRef.current = renderForKey().finally(() => {
        inFlightRef.current = null;
      });
    }
    return inFlightRef.current.then((c) => (c && c.key === keyRef.current ? c : null));
  }, [renderForKey]);

  // Debounced background pre-render after every edit.
  useEffect(() => {
    const t = setTimeout(() => {
      void ensureRender().catch(() => {
        /* pre-render failures surface on the actual share/save attempt */
      });
    }, 600);
    return () => clearTimeout(t);
  }, [cacheKey, ensureRender]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (saveModalUrlRef.current) URL.revokeObjectURL(saveModalUrlRef.current);
    };
  }, []);

  const openSaveFallback = useCallback(
    (blob: Blob) => {
      setSaveModalUrl(URL.createObjectURL(blob));
      setStatus("idle");
    },
    [setSaveModalUrl]
  );

  const closeSaveModal = useCallback(() => {
    setSaveModalUrl(null);
  }, [setSaveModalUrl]);

  /** Kick a render on pointerdown so the tap usually hits a warm cache. */
  const warmUp = useCallback(() => {
    void ensureRender().catch(() => {});
  }, [ensureRender]);

  const fail = useCallback(
    (err: unknown) => {
      setErrorMessage(formatErrorForUser(err));
      setStatus("error");
      scheduleIdle();
    },
    [scheduleIdle]
  );

  const share = useCallback(() => {
    setErrorMessage(null);
    const cached = cacheRef.current;

    // Hot path: blob ready → share synchronously inside the gesture.
    if (cached && cached.key === keyRef.current && cached.file && canShareFiles(cached.file)) {
      navigator
        .share({ files: [cached.file], title: cached.file.name })
        .then(() => {
          setStatus("shared");
          scheduleIdle();
        })
        .catch((e) => {
          if ((e as { name?: string })?.name === "AbortError") return;
          openSaveFallback(cached.blob);
        });
      return;
    }

    // Cache miss: render, then attempt share; if activation expired
    // (NotAllowedError on iOS) fall back to the save modal — never a dead-end.
    setBusy("share");
    setStatus("preparing");
    ensureRender()
      .then(async (c) => {
        if (!c || !c.file) throw new Error("Could not create image file");
        if (!canShareFiles(c.file)) {
          openSaveFallback(c.blob);
          return;
        }
        try {
          await navigator.share({ files: [c.file], title: c.file.name });
          setStatus("shared");
          scheduleIdle();
        } catch (e) {
          if ((e as { name?: string })?.name === "AbortError") {
            setStatus("idle");
            return;
          }
          openSaveFallback(c.blob);
        }
      })
      .catch(fail)
      .finally(() => setBusy(null));
  }, [ensureRender, fail, openSaveFallback, scheduleIdle]);

  const save = useCallback(() => {
    setErrorMessage(null);
    const finish = (c: CachedExport) => {
      if (isIOS()) {
        // <a download> lands in the Files app on iOS; the long-press modal
        // is the honest path to Photos.
        openSaveFallback(c.blob);
      } else {
        downloadPngBlob(c.blob, c.file?.name ?? "lazy-strava.png");
        setStatus("downloaded");
        scheduleIdle();
      }
    };

    const cached = cacheRef.current;
    if (cached && cached.key === keyRef.current) {
      finish(cached);
      return;
    }
    setBusy("save");
    setStatus("preparing");
    ensureRender()
      .then((c) => {
        if (!c) throw new Error("Could not create image file");
        finish(c);
      })
      .catch(fail)
      .finally(() => setBusy(null));
  }, [ensureRender, fail, openSaveFallback, scheduleIdle]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  return {
    share,
    save,
    warmUp,
    status,
    busy,
    errorMessage,
    dismissError,
    saveModalUrl,
    closeSaveModal,
    shareSupported,
  };
}

export type Exporter = ReturnType<typeof useExportImage>;
