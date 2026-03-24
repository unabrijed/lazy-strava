"use client";

import type { StravaActivity } from "@/lib/constants";
import { STRAVA_ORANGE } from "@/lib/constants";
import { formatDurationCompact } from "@/lib/randomActivity";

interface StravaCardCompactProps {
  activity: StravaActivity;
  layout: "horizontal" | "vertical";
  theme?: "light" | "dark";
}

const ICONS: Record<StravaActivity["type"], React.ReactNode> = {
  run: (
    <svg viewBox="0 0 24 24" fill="none" stroke={STRAVA_ORANGE} strokeWidth="1.5" className="w-10 h-10">
      <path d="M13.5 5.5c1.09 0 2 .92 2 2v4l-1.5 4 2 1 2.5-6c.5-1.5 0-3-1.5-3.5-1.5-.5-3 .5-3.5 2l-2 4-1-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ride: (
    <svg viewBox="0 0 24 24" fill="none" stroke={STRAVA_ORANGE} strokeWidth="1.5" className="w-10 h-10">
      <circle cx="6" cy="15" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="15" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15h6M6 12l2-4h8l2 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  swim: (
    <svg viewBox="0 0 24 24" fill="none" stroke={STRAVA_ORANGE} strokeWidth="1.5" className="w-10 h-10">
      <path d="M12 4l-2 4 2 4 2-4-2-4zM6 12l2 4 2-4-2-4-2 4zM18 12l-2 4-2-4 2-4 2 4zM4 16l2 4 2-4M18 16l-2 4-2-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  hike: (
    <svg viewBox="0 0 24 24" fill="none" stroke={STRAVA_ORANGE} strokeWidth="1.5" className="w-10 h-10">
      <path d="M12 2v20M8 8l4-4 4 4M8 12l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function StravaCardCompact({ activity, layout, theme = "dark" }: StravaCardCompactProps) {
  const isLight = theme === "light";
  const formattedTime = formatDurationCompact(activity.duration);
  const distanceDisplay =
    activity.type === "swim" && activity.distance < 1
      ? `${(activity.distance * 1000).toFixed(0)} m`
      : `${activity.distance.toFixed(1)} km`;

  const stats: { label: string; value: string }[] =
    activity.type === "run"
      ? [
          { label: "Distance", value: distanceDisplay },
          { label: "Pace", value: `${activity.pace ?? "—"} /km` },
          { label: "Time", value: formattedTime },
        ]
      : activity.type === "swim"
        ? [
            { label: "Distance", value: distanceDisplay },
            { label: "Pace", value: `${activity.pace ?? "—"} /100m` },
            { label: "Time", value: formattedTime },
          ]
        : activity.type === "ride"
          ? [
              { label: "Distance", value: distanceDisplay },
              { label: "Avg Speed", value: `${activity.speed ?? 0} km/h` },
              { label: "Time", value: formattedTime },
            ]
          : [
              { label: "Distance", value: distanceDisplay },
              { label: "Elevation", value: `${activity.elevation ?? 0} m` },
              { label: "Time", value: formattedTime },
            ]

  const textShadow = isLight ? "0 1px 2px rgba(255,255,255,0.8)" : "0 1px 2px rgba(0,0,0,0.8)";
  const labelColor = isLight ? "text-zinc-600" : "text-white";
  const valueColor = isLight ? "text-zinc-900" : "text-white";
  const brandColor = isLight ? "text-zinc-900" : "text-white";

  const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="text-center font-sans whitespace-nowrap">
      <p className={`text-sm font-normal ${labelColor}`} style={{ textShadow }}>{label}</p>
      <p className={`text-2xl font-semibold ${valueColor} mt-0.5`} style={{ textShadow }}>{value}</p>
    </div>
  );

  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-6 font-sans">
        {stats.map((s) => (
          <StatItem key={`${s.label}-${s.value}`} label={s.label} value={s.value} />
        ))}
        <div className="flex items-center justify-center">{ICONS[activity.type]}</div>
        <span className={`text-sm font-semibold uppercase tracking-wide ${brandColor}`} style={{ textShadow }}>STRAVA</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 font-sans">
      {stats.map((s) => (
        <StatItem key={`${s.label}-${s.value}`} label={s.label} value={s.value} />
      ))}
      <div className="flex items-center justify-center">{ICONS[activity.type]}</div>
      <span className={`text-sm font-semibold uppercase tracking-wide ${brandColor}`} style={{ textShadow }}>STRAVA</span>
    </div>
  );
}
