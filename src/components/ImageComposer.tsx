"use client";

import { useCallback } from "react";
import type { CardVariant, FeedMeta, StravaActivity } from "@/lib/constants";
import { CARD_COLORS } from "@/lib/constants";
import { EXPORT_FORMATS, type ExportFormatId } from "@/lib/exportFormats";
import type { ExportRenderState } from "@/lib/exportRenderer";
import { routeSeedForActivity } from "@/lib/routeSeed";
import { RouteMap } from "./RouteMap";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { StravaFeedCard } from "./StravaFeedCard";

interface ImageComposerProps {
  activity: StravaActivity;
  feedMeta: FeedMeta;
  variant: CardVariant;
  formatId: ExportFormatId;
  transparent: boolean;
  statsTheme: "light" | "dark";
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Off-screen DOM captured by the export renderer. Laid out at roughly preview
 * scale (CSS px) and rasterized up to 1080w by html2canvas's scale factor, so
 * exports keep the exact proportions of the on-screen preview.
 */
export function ImageComposer({
  activity,
  feedMeta,
  variant,
  formatId,
  transparent,
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
  const format = EXPORT_FORMATS[formatId];

  const exportState: ExportRenderState = {
    mode: "flat",
    variant,
    formatId,
    statsTheme,
    transparent: format.framed ? false : transparent,
  };

  const renderContent = (width: number) => {
    switch (variant) {
      case "sticker": {
        const mapW = width - 32;
        return (
          <StravaCard
            activity={activity}
            theme={statsTheme}
            exportLayout={{
              width,
              mapWidth: mapW,
              mapHeight: Math.round((mapW * 96) / 284),
            }}
          />
        );
      }
      case "feed":
        return (
          <StravaFeedCard
            activity={activity}
            feedMeta={feedMeta}
            theme={statsTheme}
            width={width}
          />
        );
      case "stats": {
        const mapW = Math.round(width * 0.8);
        return (
          <div className="flex flex-col items-center gap-8">
            <RouteMap
              seed={routeSeed}
              width={mapW}
              height={Math.round(mapW * 0.4)}
              theme={statsTheme}
              lineOnly
            />
            <StravaCardCompact activity={activity} layout="vertical" theme={statsTheme} />
          </div>
        );
      }
      case "statsRow": {
        return (
          <div className="flex flex-col items-center gap-8" style={{ width }}>
            <RouteMap
              seed={routeSeed}
              width={Math.round(width * 0.9)}
              height={Math.round(width * 0.36)}
              theme={statsTheme}
              lineOnly
            />
            <StravaCardCompact activity={activity} layout="horizontal" theme={statsTheme} />
          </div>
        );
      }
    }
  };

  // Tall variants need shrinking to fit the short square frame's safe area.
  const framedScale =
    formatId === "square" ? (variant === "feed" ? 0.8 : variant === "stats" ? 0.75 : 1) : 1;

  return (
    <div className="fixed -left-[10000px] top-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        ref={setRef}
        className="relative inline-block"
        data-export-state={JSON.stringify(exportState)}
      >
        {format.framed ? (
          <div
            data-export-flat-root="true"
            className="flex flex-col items-center justify-center overflow-hidden"
            style={{
              width: format.frameWidth,
              height: format.frameHeight ?? undefined,
              backgroundColor: CARD_COLORS[statsTheme].bg,
              paddingTop: format.safeTop,
              paddingBottom: format.safeBottom,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <div
              style={
                framedScale !== 1 ? { transform: `scale(${framedScale})` } : undefined
              }
            >
              {renderContent(Math.round(format.frameWidth * 0.84))}
            </div>
          </div>
        ) : (
          <div
            data-export-flat-root="true"
            className="inline-block bg-transparent"
            style={{ padding: 16 }}
          >
            {renderContent(format.frameWidth - 32)}
          </div>
        )}
      </div>
    </div>
  );
}
