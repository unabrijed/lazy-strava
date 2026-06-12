"use client";

import { useMemo } from "react";
import type { FeedMeta, StravaActivity } from "@/lib/constants";
import { CARD_COLORS, STRAVA_ORANGE } from "@/lib/constants";
import { formatFeedDateline, initialsFromName, statsForActivity } from "@/lib/formatStats";
import { routeSeedForActivity } from "@/lib/routeSeed";
import { RouteMap } from "./RouteMap";

interface StravaFeedCardProps {
  activity: StravaActivity;
  feedMeta: FeedMeta;
  theme?: "light" | "dark";
  /** Card width in px; map block derives 16:9 from it. */
  width?: number;
  className?: string;
}

/** Deterministic colors for the kudos avatar stack. */
const KUDOS_AVATAR_COLORS = ["#5B8DEF", "#E2725B", "#52A675", "#9B6BC3"];

/**
 * Strava feed-post mimic: avatar + athlete header, bold title, stat row with
 * dividers, full-bleed map, kudos line, social action bar. Styled like a
 * screenshot of the app itself — no wordmark inside the card.
 */
export function StravaFeedCard({
  activity,
  feedMeta,
  theme = "dark",
  width = 300,
  className = "",
}: StravaFeedCardProps) {
  const colors = CARD_COLORS[theme];
  const routeSeed = useMemo(() => routeSeedForActivity(activity), [activity]);
  const stats = statsForActivity(activity);
  const mapH = Math.round((width * 9) / 16);
  const dateline = formatFeedDateline(activity.activityDate, feedMeta.activityTime, feedMeta.location);
  const kudosAvatars = Math.min(3, feedMeta.kudosCount);

  return (
    <div
      className={`font-sans overflow-hidden rounded-xl ${className}`}
      style={{
        width,
        background: colors.card,
        boxShadow:
          theme === "light"
            ? "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)"
            : "0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* Header: avatar, athlete, dateline */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: STRAVA_ORANGE }}
        >
          {feedMeta.avatarEmoji?.trim() ? (
            <span className="text-lg leading-none">{feedMeta.avatarEmoji.trim()}</span>
          ) : (
            initialsFromName(feedMeta.athleteName)
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: colors.text }}>
            {feedMeta.athleteName || "Athlete"}
          </p>
          <p className="truncate text-[11px]" style={{ color: colors.secondary }}>
            {dateline}
          </p>
        </div>
      </div>

      {/* Title */}
      <p
        className="truncate px-3.5 pt-2 text-[17px] font-semibold leading-snug"
        style={{ color: colors.text }}
      >
        {activity.routeName}
      </p>

      {/* Stat row, achievements trophy at the end */}
      <div className="flex items-center px-3.5 pb-3 pt-2">
        {stats.map((stat, i) => (
          <div
            key={stat.field}
            className={i > 0 ? "min-w-0 flex-1 pl-3" : "min-w-0 flex-1"}
            style={i > 0 ? { borderLeft: `1px solid ${colors.divider}` } : undefined}
          >
            <p className="text-[11px] font-medium" style={{ color: colors.secondary }}>
              {stat.label}
            </p>
            <p
              className="whitespace-nowrap text-base font-semibold tabular-nums"
              style={{ color: colors.text }}
            >
              {stat.value}
            </p>
          </div>
        ))}
        {feedMeta.achievementCount > 0 && (
          <div
            className="flex shrink-0 items-center gap-1 self-center pl-3"
            style={{ color: colors.secondary }}
          >
            <TrophyIcon className="h-4 w-4" />
            <span className="text-xs font-medium tabular-nums">{feedMeta.achievementCount}</span>
          </div>
        )}
      </div>

      {/* Map block, full-bleed 16:9 */}
      <RouteMap seed={routeSeed} width={width} height={mapH} theme={theme} />

      {/* Kudos line: avatar stack + counts */}
      <div className="flex items-center gap-2 px-3.5 pt-2.5 pb-2">
        {kudosAvatars > 0 && (
          <div className="flex shrink-0 -space-x-1.5">
            {Array.from({ length: kudosAvatars }, (_, i) => (
              <span
                key={i}
                className="inline-block h-[18px] w-[18px] rounded-full"
                style={{
                  background: KUDOS_AVATAR_COLORS[(feedMeta.kudosCount + i) % KUDOS_AVATAR_COLORS.length],
                  border: `2px solid ${colors.card}`,
                }}
              />
            ))}
          </div>
        )}
        <p className="truncate text-xs" style={{ color: colors.secondary }}>
          <span className="tabular-nums">{feedMeta.kudosCount}</span> kudos ·{" "}
          <span className="tabular-nums">0</span> comments
        </p>
      </div>

      {/* Social action bar */}
      <div
        className="flex items-center justify-around px-6 py-2"
        style={{ borderTop: `1px solid ${colors.divider}`, color: colors.secondary }}
      >
        <ThumbIcon className="h-[18px] w-[18px]" />
        <CommentIcon className="h-[18px] w-[18px]" />
        <ShareArrowIcon className="h-[18px] w-[18px]" />
      </div>
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 3.5 4 3.5M17 6h3a1 1 0 0 1 1 1c0 2-1.5 3.5-4 3.5" />
    </svg>
  );
}

function ThumbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 10v11M3 11h4v9H4a1 1 0 0 1-1-1v-8zM7 11l4-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 12a8 8 0 0 1-8 8H4l2.5-3A8 8 0 1 1 21 12z" />
    </svg>
  );
}

function ShareArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M12 15V3M7 8l5-5 5 5" />
    </svg>
  );
}
