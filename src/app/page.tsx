"use client";

import { useMemo, useRef, useState } from "react";
import type { CardVariant, FeedMeta, StravaActivity } from "@/lib/constants";
import { DEFAULT_FEED_META } from "@/lib/constants";
import type { ExportFormatId } from "@/lib/exportFormats";
import { getDefaultActivity } from "@/lib/randomActivity";
import { randomRouteVariant } from "@/lib/routeSeed";
import { useExportImage } from "@/hooks/useExportImage";
import { ActivityEditor } from "@/components/ActivityEditor";
import { ExportBar } from "@/components/ExportBar";
import { ExportPanel } from "@/components/ExportPanel";
import { ImageComposer } from "@/components/ImageComposer";
import { Logo } from "@/components/Logo";
import { PreviewPanel } from "@/components/PreviewPanel";
import { SaveImageModal } from "@/components/SaveImageModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

const footerLinks = [
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
  const [variant, setVariant] = useState<CardVariant>("sticker");
  const [formatId, setFormatId] = useState<ExportFormatId>("sticker");
  const [transparent, setTransparent] = useState(true);
  const [feedMeta, setFeedMeta] = useState<FeedMeta>(DEFAULT_FEED_META);
  const { theme: statsTheme } = useTheme();
  const exportRef = useRef<HTMLDivElement | null>(null);

  // Every input that changes the exported pixels — keys the pre-render cache.
  const cacheKey = useMemo(
    () =>
      JSON.stringify({
        activity,
        variant,
        formatId,
        transparent,
        statsTheme,
        feedMeta: variant === "feed" ? feedMeta : null,
      }),
    [activity, variant, formatId, transparent, statsTheme, feedMeta]
  );

  const exporter = useExportImage({
    exportRef,
    cacheKey,
    filenameBase: activity.routeName,
  });

  const handleRouteRandomize = () => {
    setActivity({ ...activity, routeVariant: randomRouteVariant() });
  };

  const exportControls = {
    exporter,
    formatId,
    onFormatChange: setFormatId,
    transparent,
    onTransparentChange: setTransparent,
  };

  return (
    <div className="min-h-screen bg-background text-foreground min-w-0">
      <header className="border-b border-zinc-200/80 px-4 sm:px-6 py-3 sm:py-6 bg-background/80 backdrop-blur-sm dark:border-zinc-800/80">
        <div className="mx-auto max-w-6xl flex items-center gap-3 sm:gap-4 w-full min-w-0">
          <Logo className="w-9 h-9 sm:w-12 sm:h-12 drop-shadow-sm shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
              <span className="text-[#FC4C02]">Lazy</span> Strava
            </h1>
            <p className="mt-1 hidden text-zinc-500 dark:text-zinc-400 text-sm font-normal max-w-sm sm:block">
              Flex without the sweat. Strava results, zero effort.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-2 sm:px-6 pt-0 pb-6 sm:pt-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start lg:gap-8 lg:py-10">
        {/* DOM-first so it can pin to the top on mobile. Sticky lives on this
            wrapper — main spans the full page height, giving it scroll room. */}
        <div className="sticky top-0 z-30 lg:top-6 lg:col-start-2 lg:row-start-1">
          <PreviewPanel
            activity={activity}
            feedMeta={feedMeta}
            theme={statsTheme}
            variant={variant}
            onVariantChange={setVariant}
            onActivityChange={setActivity}
            onRouteRandomize={handleRouteRandomize}
          >
            <ExportPanel {...exportControls} />
          </PreviewPanel>
        </div>

        <div className="pt-5 lg:col-start-1 lg:row-start-1 lg:pt-0">
          <ActivityEditor
            activity={activity}
            onActivityChange={setActivity}
            variant={variant}
            feedMeta={feedMeta}
            onFeedMetaChange={setFeedMeta}
          />
        </div>
      </main>

      <footer className="border-t border-zinc-200/80 px-4 sm:px-6 py-6 pb-44 lg:pb-6 bg-background/80 dark:border-zinc-800/80">
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

      <ExportBar {...exportControls} />

      {exporter.saveModalUrl && (
        <SaveImageModal imageUrl={exporter.saveModalUrl} onClose={exporter.closeSaveModal} />
      )}

      <ImageComposer
        activity={activity}
        feedMeta={feedMeta}
        variant={variant}
        formatId={formatId}
        transparent={transparent}
        statsTheme={statsTheme}
        exportRef={exportRef}
      />
    </div>
  );
}
