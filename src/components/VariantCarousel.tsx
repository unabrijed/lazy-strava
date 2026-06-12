"use client";

import { useEffect, useRef } from "react";
import type { CardVariant, FeedMeta, StravaActivity } from "@/lib/constants";
import { CARD_VARIANTS } from "@/lib/constants";
import { routeSeedForActivity } from "@/lib/routeSeed";
import { uiSegmentActive, uiSegmentInactive } from "@/lib/ui";
import { RouteMap } from "./RouteMap";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { StravaFeedCard } from "./StravaFeedCard";

const VARIANT_ORDER: CardVariant[] = CARD_VARIANTS.map((v) => v.id);

interface VariantCarouselProps {
  activity: StravaActivity;
  feedMeta: FeedMeta;
  theme: "light" | "dark";
  variant: CardVariant;
  onVariantChange: (v: CardVariant) => void;
  /** Enables inline tap-to-edit on cards — desktop only (conflicts with swipe). */
  onActivityChange?: (a: StravaActivity) => void;
}

/**
 * Swipeable variant strip (CSS scroll-snap), mirroring Strava's own sticker
 * picker. Pills below stay in sync and work as the desktop affordance.
 */
export function VariantCarousel({
  activity,
  feedMeta,
  theme,
  variant,
  onVariantChange,
  onActivityChange,
}: VariantCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const programmaticRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const firstSyncRef = useRef(true);
  const routeSeed = routeSeedForActivity(activity);

  // Variant state → scroll position (pill clicks, initial mount).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const idx = VARIANT_ORDER.indexOf(variant);
    const target = idx * track.clientWidth;
    if (Math.abs(track.scrollLeft - target) > 2) {
      programmaticRef.current = true;
      track.scrollTo({ left: target, behavior: firstSyncRef.current ? "auto" : "smooth" });
      const t = setTimeout(() => {
        programmaticRef.current = false;
      }, 500);
      firstSyncRef.current = false;
      return () => clearTimeout(t);
    }
    firstSyncRef.current = false;
  }, [variant]);

  // Swipe → variant state (rAF-throttled, suppressed during programmatic scroll).
  const handleScroll = () => {
    if (programmaticRef.current || rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const track = trackRef.current;
      if (!track || programmaticRef.current) return;
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      const next = VARIANT_ORDER[Math.max(0, Math.min(VARIANT_ORDER.length - 1, idx))]!;
      if (next !== variant) onVariantChange(next);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const slideClass =
    "flex h-[250px] w-full shrink-0 snap-center items-center justify-center overflow-hidden lg:h-[320px]";

  return (
    <div className="space-y-3">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain no-scrollbar"
        aria-label="Card style"
      >
        <div className={slideClass}>
          <StravaCard activity={activity} onChange={onActivityChange} theme={theme} />
        </div>
        <div className={slideClass}>
          <div className="scale-[0.65] lg:scale-[0.85]">
            <StravaFeedCard activity={activity} feedMeta={feedMeta} theme={theme} width={280} />
          </div>
        </div>
        <div className={slideClass}>
          {/* Vertical stack is tall; scale to fit the fixed slide height. */}
          <div className="scale-[0.6] lg:scale-[0.78]">
            <div className="space-y-4">
              <div className="flex justify-center">
                <RouteMap seed={routeSeed} width={240} height={96} theme={theme} lineOnly />
              </div>
              <StravaCardCompact activity={activity} layout="vertical" theme={theme} />
            </div>
          </div>
        </div>
        <div className={slideClass}>
          <div className="space-y-4">
            <div className="flex justify-center">
              <RouteMap seed={routeSeed} width={280} height={112} theme={theme} lineOnly />
            </div>
            <StravaCardCompact activity={activity} layout="horizontal" theme={theme} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" role="tablist">
        {CARD_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={variant === v.id}
            onClick={() => onVariantChange(v.id)}
            className={variant === v.id ? uiSegmentActive : uiSegmentInactive}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
