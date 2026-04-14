import type { StravaActivity } from "./constants";
import { validateActivity } from "./activityValidation";

export interface VibePreset {
  id: string;
  emoji: string;
  title: string;
  /** Builds a full activity; stats are validated for consistency. */
  build: () => StravaActivity;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Curated “vibe” bundles (emoji + title + realistic stats) for quick picks.
 */
export const VIBE_PRESETS: VibePreset[] = [
  {
    id: "casual-5k",
    emoji: "🏙️",
    title: "Casual 5K",
    build: () =>
      validateActivity(
        {
          type: "run",
          routeName: "Casual 5K",
          activityDate: todayIsoDate(),
          distance: 5,
          duration: 1860,
          pace: "6:12",
          elevation: 55,
          calories: 0,
        },
        "pace",
      ),
  },
  {
    id: "sub20-5k",
    emoji: "⚡",
    title: "Sub-20 5K",
    build: () =>
      validateActivity(
        {
          type: "run",
          routeName: "Sub-20 5K",
          activityDate: todayIsoDate(),
          distance: 5,
          duration: 1140,
          pace: "3:48",
          elevation: 20,
          calories: 0,
        },
        "pace",
      ),
  },
  {
    id: "half-marathon",
    emoji: "🏅",
    title: "Half Marathon",
    build: () =>
      validateActivity(
        {
          type: "run",
          routeName: "Half Marathon — Race Day",
          activityDate: todayIsoDate(),
          distance: 21.1,
          duration: 7200,
          pace: "5:41",
          elevation: 120,
          calories: 0,
        },
        "pace",
      ),
  },
  {
    id: "century-ride",
    emoji: "🚴",
    title: "Century Ride",
    build: () =>
      validateActivity(
        {
          type: "ride",
          routeName: "Century Ride",
          activityDate: todayIsoDate(),
          distance: 160.9,
          duration: 21600,
          speed: 26.8,
          elevation: 1400,
          calories: 0,
        },
        "speed",
      ),
  },
  {
    id: "summit-hike",
    emoji: "⛰️",
    title: "Summit Hike",
    build: () =>
      validateActivity(
        {
          type: "hike",
          routeName: "Summit Ridge Trail",
          activityDate: todayIsoDate(),
          distance: 14.2,
          duration: 19800,
          pace: "23:15",
          elevation: 920,
          calories: 0,
        },
        "pace",
      ),
  },
  {
    id: "open-water",
    emoji: "🌊",
    title: "Open Water",
    build: () =>
      validateActivity(
        {
          type: "swim",
          routeName: "Open Water Swim",
          activityDate: todayIsoDate(),
          distance: 2,
          duration: 2400,
          pace: "2:00",
          calories: 0,
        },
        "pace",
      ),
  },
  {
    id: "morning-flow",
    emoji: "🧘",
    title: "Morning Flow",
    build: () =>
      validateActivity(
        {
          type: "run",
          routeName: "Morning Flow — Easy Miles",
          activityDate: todayIsoDate(),
          distance: 6.5,
          duration: 2700,
          pace: "6:55",
          elevation: 35,
          calories: 0,
        },
        "pace",
      ),
  },
  {
    id: "10k-pb",
    emoji: "🏃",
    title: "10K PB",
    build: () =>
      validateActivity(
        {
          type: "run",
          routeName: "10K PB",
          activityDate: todayIsoDate(),
          distance: 10,
          duration: 2400,
          pace: "4:00",
          elevation: 45,
          calories: 0,
        },
        "pace",
      ),
  },
];

const presetById = new Map(VIBE_PRESETS.map((p) => [p.id, p]));

export function getVibePreset(id: string): VibePreset | undefined {
  return presetById.get(id);
}

export function applyVibePreset(id: string): StravaActivity | null {
  const p = getVibePreset(id);
  return p ? p.build() : null;
}
