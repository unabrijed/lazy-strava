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
  const exportRef = useRef<HTMLDivElement | null>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
    },
    []
  );

  const clearImage = useCallback(() => {
    if (backgroundImage) URL.revokeObjectURL(backgroundImage);
    setBackgroundImage(null);
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
            Step 1 — Customize your fake run
          </h2>
          <ActivityEditor activity={activity} onActivityChange={setActivity} statsTheme={statsTheme} />
        </section>

        <section className="min-w-0">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 sm:mb-4">
            Step 2 — Add your photo (optional)
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
          <label className="cursor-pointer min-h-[44px] inline-flex items-center rounded-lg bg-zinc-100 px-4 py-2.5 sm:py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 active:bg-zinc-200 transition-colors border border-zinc-200 touch-manipulation">
                    Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {backgroundImage && (
              <button
                onClick={clearImage}
                className="min-h-[44px] rounded-lg bg-zinc-100 px-4 py-2.5 sm:py-2 text-sm text-zinc-600 hover:bg-zinc-200 active:bg-zinc-200 transition-colors border border-zinc-200 touch-manipulation"
              >
                Remove image
              </button>
            )}
          </div>
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
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
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
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
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
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
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
                className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
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
                  className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
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
                  className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
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
          />
          <div className="mt-4">
            <ExportButton composeRef={exportRef} />
          </div>
        </section>
      </main>
    </div>
  );
}
