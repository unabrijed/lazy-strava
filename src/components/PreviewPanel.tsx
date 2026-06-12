"use client";

import type { CardVariant, FeedMeta, StravaActivity } from "@/lib/constants";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { uiSectionLabel } from "@/lib/ui";
import { VariantCarousel } from "./VariantCarousel";

interface PreviewPanelProps {
  activity: StravaActivity;
  feedMeta: FeedMeta;
  theme: "light" | "dark";
  variant: CardVariant;
  onVariantChange: (v: CardVariant) => void;
  onActivityChange: (a: StravaActivity) => void;
  onRouteRandomize: () => void;
  /** Desktop-only extras (export panel) rendered under the carousel. */
  children?: React.ReactNode;
}

/**
 * The always-visible live preview. Mobile: pinned to the top of the viewport
 * while the form scrolls beneath. Desktop: sticky right-hand aside.
 */
export function PreviewPanel({
  activity,
  feedMeta,
  theme,
  variant,
  onVariantChange,
  onActivityChange,
  onRouteRandomize,
  children,
}: PreviewPanelProps) {
  // Inline tap-to-edit conflicts with the swipe surface on touch; the form is
  // the single editing surface on mobile.
  const isDesktop = useIsDesktop();

  return (
    <div className="-mx-2 border-b border-zinc-200/80 bg-background/95 px-3 pb-3 pt-2 backdrop-blur-md dark:border-zinc-800/80 sm:-mx-6 sm:px-6 lg:m-0 lg:rounded-2xl lg:border lg:border-zinc-200/90 lg:bg-zinc-50/60 lg:p-6 lg:backdrop-blur-none dark:lg:border-zinc-700/90 dark:lg:bg-zinc-900/30">
      <div className="space-y-3 lg:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className={uiSectionLabel}>Preview</p>
          <button
            type="button"
            onClick={onRouteRandomize}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#FC4C02] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#e34402] active:bg-[#cc3d02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FC4C02] lg:px-4 lg:py-2.5 lg:text-sm"
          >
            <ShuffleIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
            Random route
          </button>
        </div>

        <VariantCarousel
          activity={activity}
          feedMeta={feedMeta}
          theme={theme}
          variant={variant}
          onVariantChange={onVariantChange}
          onActivityChange={isDesktop ? onActivityChange : undefined}
        />

        {children && <div className="hidden lg:block">{children}</div>}
      </div>
    </div>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
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
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15 21 21" />
      <path d="M4 4l5 5" />
    </svg>
  );
}
