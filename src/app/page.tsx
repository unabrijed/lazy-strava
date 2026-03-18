"use client";

import { useRef, useState, useCallback } from "react";
import type { StravaActivity } from "@/lib/constants";
import { generateRandomActivity, getDefaultActivity } from "@/lib/randomActivity";
import { ActivityEditor } from "@/components/ActivityEditor";
import { ImageComposer } from "@/components/ImageComposer";
import { ExportButton } from "@/components/ExportButton";

export default function Home() {
  const [activity, setActivity] = useState<StravaActivity>(() =>
    getDefaultActivity("run")
  );
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState<"map" | "compact">("map");
  const [statsLayout, setStatsLayout] = useState<"horizontal" | "vertical">("vertical");
  const [statsTheme, setStatsTheme] = useState<"light" | "dark">("light");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const gradientRef = useRef<HTMLDivElement | null>(null);

  const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setUploadError(null);
      if (!file) return;
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError("Image too large. Please use a file under 10MB.");
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 4096 || img.naturalHeight > 4096) {
          setUploadError("Image very large. Export may be slow. Consider resizing.");
        }
        setBackgroundImage(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setUploadError("Could not load image. File may be corrupted or not a valid image.");
        e.target.value = "";
      };
      img.src = url;
    },
    []
  );

  const clearImage = useCallback(() => {
    if (backgroundImage) URL.revokeObjectURL(backgroundImage);
    setBackgroundImage(null);
    setUploadError(null);
  }, [backgroundImage]);

  return (
    <div className="min-h-screen bg-white text-zinc-800 min-w-0">
      <header className="border-b border-zinc-200/80 px-4 sm:px-6 py-5 sm:py-6 bg-white/80 backdrop-blur-sm">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          <span className="text-[#FC4C02]">Lazy</span> Strava
        </h1>
        <p className="mt-1.5 text-zinc-500 text-sm font-normal">
          Flex without the sweat. Strava results, zero effort.
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
        <section className="min-w-0">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 sm:mb-4">
            Step 1 — Customize your activity
          </h2>
          <ActivityEditor activity={activity} onActivityChange={setActivity} statsTheme={statsTheme} />
        </section>

        <section className="min-w-0">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 sm:mb-4">
            Step 2 — Add your photo (optional)
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="cursor-pointer min-h-[44px] inline-flex items-center rounded-lg bg-zinc-100 px-4 py-2.5 sm:py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 active:bg-zinc-200 transition-colors border border-zinc-200 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2">
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                aria-describedby={uploadError ? "upload-error" : undefined}
              />
            </label>
            {backgroundImage && (
              <button
                type="button"
                onClick={clearImage}
                className="min-h-[44px] rounded-lg bg-zinc-100 px-4 py-2.5 sm:py-2 text-sm text-zinc-600 hover:bg-zinc-200 active:bg-zinc-200 transition-colors border border-zinc-200 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2"
              >
                Remove image
              </button>
            )}
          </div>
          {uploadError && (
            <p id="upload-error" className="mt-2 text-sm text-amber-600" role="alert">
              {uploadError}
            </p>
          )}
        </section>

        <section className="min-w-0">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 sm:mb-4">
            Step 3 — Style, position & export
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
              <span className="text-sm text-zinc-500 w-full sm:w-auto">Style:</span>
              <button
                type="button"
                onClick={() => setCardStyle("map")}
                aria-label="Map and stats style"
                aria-pressed={cardStyle === "map"}
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 ${
                  cardStyle === "map"
                    ? "bg-[#FC4C02] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
                }`}
              >
                Map + Stats
              </button>
              <button
                type="button"
                onClick={() => setCardStyle("compact")}
                aria-label="Compact stats style"
                aria-pressed={cardStyle === "compact"}
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 ${
                  cardStyle === "compact"
                    ? "bg-[#FC4C02] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
                }`}
              >
                Compact
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
              <span className="text-sm text-zinc-500 w-full sm:w-auto">Stats theme:</span>
              <button
                type="button"
                onClick={() => setStatsTheme("light")}
                aria-label="Light theme for stats"
                aria-pressed={statsTheme === "light"}
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 ${
                  statsTheme === "light"
                    ? "bg-zinc-200 text-zinc-900 border border-zinc-300"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setStatsTheme("dark")}
                aria-label="Dark theme for stats"
                aria-pressed={statsTheme === "dark"}
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 ${
                  statsTheme === "dark"
                    ? "bg-zinc-200 text-zinc-900 border border-zinc-300"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
                }`}
              >
                Dark
              </button>
            </div>
            {cardStyle === "compact" && (
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <span className="text-sm text-zinc-500 w-full sm:w-auto">Stats layout:</span>
                <button
                  type="button"
                  onClick={() => setStatsLayout("vertical")}
                  aria-label="Vertical stats layout"
                  aria-pressed={statsLayout === "vertical"}
                  className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 ${
                    statsLayout === "vertical"
                      ? "bg-zinc-200 text-zinc-900 border border-zinc-300"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
                  }`}
                >
                  Vertical
                </button>
                <button
                  type="button"
                  onClick={() => setStatsLayout("horizontal")}
                  aria-label="Horizontal stats layout"
                  aria-pressed={statsLayout === "horizontal"}
                  className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-[#FC4C02] focus-visible:ring-offset-2 ${
                    statsLayout === "horizontal"
                      ? "bg-zinc-200 text-zinc-900 border border-zinc-300"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
                  }`}
                >
                  Horizontal
                </button>
              </div>
            )}
          </div>
          <ImageComposer
            activity={activity}
            backgroundImage={backgroundImage}
            cardStyle={cardStyle}
            statsLayout={statsLayout}
            statsTheme={statsTheme}
            exportRef={exportRef}
            gradientRef={gradientRef}
          />
          <div className="mt-4">
            <ExportButton
              composeRef={exportRef}
              hasBackgroundImage={!!backgroundImage}
              gradientRef={gradientRef}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
