"use client";

import { useRef, useState } from "react";
import type { StravaActivity } from "@/lib/constants";
import { getDefaultActivity } from "@/lib/randomActivity";
import { ActivityEditor } from "@/components/ActivityEditor";
import { ImageComposer } from "@/components/ImageComposer";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

const footerLinks = [
  {
    name: "Portfolio",
    label: "Portfolio",
    href: "https://www.unabrijed.xyz",
    ariaLabel: "Visit Brijesh's portfolio",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 3.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4.5 12h15M12 3.8c2.2 2.2 3.3 4.9 3.3 8.2s-1.1 6-3.3 8.2M12 3.8C9.8 6 8.7 8.7 8.7 12s1.1 6 3.3 8.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    label: "Instagram: @unabrijed",
    href: "https://www.instagram.com/unabrijed",
    ariaLabel: "Contact on Instagram: @unabrijed",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <rect
          width="16"
          height="16"
          x="4"
          y="4"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="7" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    label: "Twitter: @unabrijed",
    href: "https://twitter.com/unabrijed",
    ariaLabel: "Contact on Twitter: @unabrijed",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M18.9 2.5h3.3l-7.2 8.2 8.4 10.8h-6.6l-5.1-6.6-5.9 6.6H2.5l7.7-8.8-8-10.2h6.8l4.6 6 5.3-6Zm-1.2 17.1h1.8L8 4.3H6L17.7 19.6Z" />
      </svg>
    ),
  },
] as const;

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

      <footer className="border-t border-zinc-200/80 px-4 sm:px-6 py-6 bg-background/80 dark:border-zinc-800/80">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row">
          <p>Contact</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Logo className="h-8 w-8 shrink-0 drop-shadow-sm" />
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 underline underline-offset-4 decoration-zinc-300 transition-colors hover:text-[#FC4C02] hover:decoration-[#FC4C02] dark:decoration-zinc-700"
                aria-label={link.ariaLabel}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </footer>

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
