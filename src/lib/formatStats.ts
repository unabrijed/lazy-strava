import type { ActivityType, StravaActivity } from "./constants";

/**
 * Strava-convention stat formatting — single source of truth for every card.
 * Conventions (Strava 2025): distance 2 decimals, pace with unit suffix,
 * time "42m 13s" under an hour / "1h 12m" over, elevation integer meters.
 */

export function formatDistance(km: number | undefined, type: ActivityType): string {
  const d = km ?? 0;
  if (type === "swim" && d < 1) return `${Math.round(d * 1000)} m`;
  return `${d.toFixed(2)} km`;
}

export function formatPaceValue(pace: string | undefined, type: ActivityType): string {
  const p = pace ?? "—";
  // Thin space: tabular-nums renders a normal space at figure width, which
  // reads as a double-wide gap before the unit.
  return type === "swim" ? `${p}\u2009/100m` : `${p}\u2009/km`;
}

export function formatSpeed(kmh: number | undefined): string {
  return `${(kmh ?? 0).toFixed(1)} km/h`;
}

export function formatElevation(m: number | undefined): string {
  return `${Math.round(m ?? 0)} m`;
}

/** Summary-style time: "42m 13s" under an hour, "1h 12m" at/over (seconds dropped). */
export function formatStatTime(seconds: number | undefined): string {
  const sec = Math.max(0, Math.round(seconds ?? 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export interface StatItem {
  label: string;
  value: string;
  field: keyof StravaActivity;
}

/**
 * Canonical Strava stat row: Distance / Pace-or-Speed-or-Elev / Time.
 * Runs and swims show pace, rides show average speed, hikes show elevation gain.
 */
export function statsForActivity(activity: StravaActivity): StatItem[] {
  const distance: StatItem = {
    label: "Distance",
    value: formatDistance(activity.distance, activity.type),
    field: "distance",
  };
  const time: StatItem = {
    label: "Time",
    value: formatStatTime(activity.duration),
    field: "duration",
  };

  const middle: StatItem =
    activity.type === "ride"
      ? { label: "Avg Speed", value: formatSpeed(activity.speed), field: "speed" }
      : activity.type === "hike"
        ? { label: "Elev Gain", value: formatElevation(activity.elevation), field: "elevation" }
        : { label: "Pace", value: formatPaceValue(activity.pace, activity.type), field: "pace" };

  return [distance, middle, time];
}

/** "June 13, 2026 at 6:42 AM · Riverside Park" — Strava's feed meta format. */
export function formatFeedDateline(
  isoDate: string | undefined,
  time24: string,
  location: string
): string {
  let datePart = "";
  if (isoDate) {
    const d = new Date(`${isoDate}T00:00:00`);
    if (!isNaN(d.getTime())) {
      datePart = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  const timeMatch = time24.match(/^(\d{1,2}):(\d{2})$/);
  let timePart = "";
  if (timeMatch) {
    const h = parseInt(timeMatch[1]!, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    timePart = `${h12}:${timeMatch[2]} ${ampm}`;
  }
  const dateTime = [datePart, timePart].filter(Boolean).join(" at ");
  return [dateTime, location].filter(Boolean).join(" · ");
}

/** Initials for the avatar circle when no emoji is set ("Alex Runner" → "AR"). */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
