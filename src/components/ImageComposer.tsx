"use client";

import { useCallback } from "react";
import type { StravaActivity } from "@/lib/constants";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { routeSeedForActivity } from "@/lib/routeSeed";
import { RouteMap } from "./RouteMap";

/** Full-width export for map card (matches common story width). */
const MAP_EXPORT_WIDTH = 1080;

/** Compact: route + stats, centered; gap shows export background when “with background” is on. */
const COMPACT_EXPORT_WIDTH = 1080;

interface ExportStatePayload {
  mode: "flat";
  cardStyle: "map" | "compact";
  canvasWidth: number;
  statsTheme: "light" | "dark";
}

interface ImageComposerProps {
  activity: StravaActivity;
  cardStyle: "map" | "compact";
  statsLayout: "horizontal" | "vertical";
  statsTheme: "light" | "dark";
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Off-screen DOM for ExportButton: a single flat tree (no story “frame”).
 * Map: one StravaCard at export resolution.
 * Compact: route + stats stacked, centered; transparent gap between them for optional gradient behind.
 */
export function ImageComposer({
  activity,
  cardStyle,
  statsLayout,
  statsTheme,
  exportRef,
}: ImageComposerProps) {
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      const eRef = exportRef as React.MutableRefObject<HTMLDivElement | null> | undefined;
      if (eRef) eRef.current = el;
    },
    [exportRef]
  );

  const routeSeed = routeSeedForActivity(activity);

  const mapExportW = MAP_EXPORT_WIDTH - 32;
  const mapExportH = Math.round((mapExportW * 96) / 284);

  const compactRouteW = Math.round(COMPACT_EXPORT_WIDTH * 0.82);
  const compactRouteH = Math.round(compactRouteW * (80 / 200));

  const exportState: ExportStatePayload = {
    mode: "flat",
    cardStyle,
    canvasWidth: cardStyle === "map" ? MAP_EXPORT_WIDTH : COMPACT_EXPORT_WIDTH,
    statsTheme,
  };

  return (
    <div
      className="fixed -left-[10000px] top-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div
        ref={setRef}
        className="relative inline-block"
        data-export-state={JSON.stringify(exportState)}
      >
        {cardStyle === "map" ? (
          <div data-export-flat-root="true" className="inline-block p-8">
            <StravaCard
              activity={activity}
              theme={statsTheme}
              exportLayout={{
                width: MAP_EXPORT_WIDTH,
                mapWidth: mapExportW,
                mapHeight: mapExportH,
              }}
            />
          </div>
        ) : (
          <div
            data-export-flat-root="true"
            className="flex flex-col items-center justify-center gap-10 bg-transparent px-10 py-12"
            style={{ width: COMPACT_EXPORT_WIDTH, backgroundColor: "transparent" }}
          >
            <RouteMap
              seed={routeSeed}
              width={compactRouteW}
              height={compactRouteH}
              theme={statsTheme}
              lineOnly
            />
            <StravaCardCompact
              activity={activity}
              layout={statsLayout}
              theme={statsTheme}
            />
          </div>
        )}
      </div>
    </div>
  );
}
