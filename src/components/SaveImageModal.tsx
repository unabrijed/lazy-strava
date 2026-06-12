"use client";

import { useEffect } from "react";
import { downloadPngBlob } from "@/lib/exportRenderer";

interface SaveImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

/**
 * iOS-friendly save fallback: <a download> dumps PNGs into the Files app, so
 * we show the rendered image and let the user long-press → Add to Photos.
 */
export function SaveImageModal({ imageUrl, onClose }: SaveImageModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const downloadAsFile = async () => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    downloadPngBlob(blob, `lazy-strava-${Date.now()}.png`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Save image"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-sm font-medium text-white">
          Press and hold the image, then tap <span className="font-semibold">Add to Photos</span>
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Your generated activity image"
          className="max-h-[60vh] w-auto max-w-full rounded-xl shadow-2xl"
          style={{
            // checkerboard so transparent stickers are visible
            backgroundImage:
              "linear-gradient(45deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.12) 75%), linear-gradient(45deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.12) 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        />
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={downloadAsFile}
            className="min-h-[44px] text-sm text-zinc-300 underline underline-offset-4 touch-manipulation"
          >
            Download as file instead
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-lg bg-white/15 px-5 text-sm font-semibold text-white touch-manipulation hover:bg-white/25"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
