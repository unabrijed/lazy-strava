"use client";

import { useRef, useState } from "react";
import type { StravaActivity } from "@/lib/constants";
import { getDefaultActivity } from "@/lib/randomActivity";
import { ActivityEditor } from "@/components/ActivityEditor";
import { ImageComposer } from "@/components/ImageComposer";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
  const [activity, setActivity] = useState<StravaActivity>(() => getDefaultActivity("run"));
  const [cardStyle, setCardStyle] = useState<"map" | "compact">("map");
  const [statsLayout, setStatsLayout] = useState<"horizontal" | "vertical">("vertical");
  const { theme: statsTheme } = useTheme();
  const exportRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground min-w-0">
      <header className="border-b border-zinc-200/80 px-4 sm:px-6 py-5 sm:py-6 bg-background/80 backdrop-blur-sm dark:border-zinc-800/80">
        <div className="mx-auto max-w-6xl flex items-center gap-3 sm:gap-4 w-full min-w-0">
          <Logo className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-sm shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              <span className="text-[#FC4C02]">Lazy</span> Strava
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-sm font-normal max-w-sm">
              Flex without the sweat. Strava results, zero effort.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-2 sm:px-6 py-6 sm:py-10">
        <ActivityEditor
          activity={activity}
          onActivityChange={setActivity}
          statsTheme={statsTheme}
          cardStyle={cardStyle}
          statsLayout={statsLayout}
          onCardStyleChange={setCardStyle}
          onStatsLayoutChange={setStatsLayout}
          exportRef={exportRef}
        />
      </main>

      <ImageComposer
        activity={activity}
        cardStyle={cardStyle}
        statsLayout={statsLayout}
        statsTheme={statsTheme}
        exportRef={exportRef}
      />
    </div>
  );
}
