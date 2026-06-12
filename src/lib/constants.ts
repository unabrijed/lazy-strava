export type ActivityType = "run" | "ride" | "swim" | "hike";

export interface StravaActivity {
  type: ActivityType;
  routeName: string;
  distance?: number;
  duration?: number;
  pace?: string;
  speed?: number;
  elevation?: number;
  calories?: number;
  activityDate?: string; // ISO date string
  /** Optional salt for changing the displayed route without changing stats/name. */
  routeVariant?: number;
}

export const STRAVA_ORANGE = "#FC4C02";

/**
 * Output card variants, presented as a swipeable strip (like Strava's own
 * sticker picker). `stats`/`statsRow` are the compact overlay in vertical /
 * horizontal arrangement.
 */
export type CardVariant = "sticker" | "feed" | "stats" | "statsRow";

export const CARD_VARIANTS: { id: CardVariant; label: string }[] = [
  { id: "sticker", label: "Sticker" },
  { id: "feed", label: "Feed post" },
  { id: "stats", label: "Stats" },
  { id: "statsRow", label: "Stats row" },
];

/**
 * Card-internal palette (Strava 2025 light/dark surfaces). Cards consume these
 * as inline-style hex — independent of the site theme and safe for html2canvas
 * (no oklch color functions).
 */
export const CARD_COLORS = {
  light: {
    bg: "#F7F7FA",
    card: "#FFFFFF",
    text: "#242428",
    secondary: "#6D6D78",
    divider: "rgba(0,0,0,0.08)",
  },
  dark: {
    bg: "#101012",
    card: "#1C1C1E",
    text: "#FFFFFF",
    secondary: "#A9A9B2",
    divider: "rgba(255,255,255,0.10)",
  },
} as const;

/** Extra fields for the feed-post mimic; kept separate from StravaActivity so
 * validation/random generation/route seeding stay untouched. */
export interface FeedMeta {
  athleteName: string;
  /** Emoji avatar; initials derived from athleteName when absent. */
  avatarEmoji?: string;
  location: string;
  /** "HH:MM" 24h — date itself stays on StravaActivity.activityDate. */
  activityTime: string;
  kudosCount: number;
  achievementCount: number;
}

export const DEFAULT_FEED_META: FeedMeta = {
  athleteName: "Alex Runner",
  location: "Riverside Park",
  activityTime: "06:42",
  kudosCount: 23,
  achievementCount: 2,
};

/** Grouped by time of day for UI chips; flat list derived for random/datalist. */
export const ACTIVITY_NAME_PRESET_GROUPS: Record<
  ActivityType,
  { label: string; names: string[] }[]
> = {
  run: [
    {
      label: "Easy",
      names: [
        "Morning Easy Run",
        "Evening Easy Run",
        "Recovery Run",
        "Easy Neighborhood Run",
        "Coffee Run",
        "Shakeout Run",
      ],
    },
    {
      label: "Workout",
      names: [
        "Tempo Run",
        "Progression Run",
        "Track Intervals",
        "Hill Repeats",
        "5K Effort",
        "10K Training Run",
      ],
    },
    {
      label: "Long",
      names: [
        "Weekend Long Run",
        "Sunday Long Run",
        "Long Run",
        "Steady Long Run",
        "Park Loop Long Run",
        "Riverside Long Run",
      ],
    },
  ],
  ride: [
    {
      label: "Easy",
      names: [
        "Morning Ride",
        "Evening Spin",
        "Easy Ride",
        "Recovery Spin",
        "Coffee Ride",
        "Neighborhood Spin",
      ],
    },
    {
      label: "Workout",
      names: [
        "Tempo Ride",
        "Interval Ride",
        "Hill Climb Ride",
        "Rolling Roads Ride",
        "Flat Route Sprints",
        "Training Ride",
      ],
    },
    {
      label: "Long",
      names: [
        "Weekend Long Ride",
        "Sunday Ride",
        "Endurance Ride",
        "Backroads Ride",
        "Coastal Ride",
        "Cafe Stop Ride",
      ],
    },
  ],
  swim: [
    {
      label: "Pool",
      names: [
        "Morning Swim",
        "Evening Swim",
        "Pool Laps",
        "Easy Swim",
        "Recovery Swim",
        "Lunch Swim",
      ],
    },
    {
      label: "Workout",
      names: [
        "Technique Swim",
        "Pull Set",
        "Threshold Swim",
        "Sprint Set",
        "Endurance Swim",
        "Drills and Laps",
      ],
    },
    {
      label: "Open Water",
      names: [
        "Open Water Swim",
        "Lake Swim",
        "Reservoir Swim",
        "Buoy Loop Swim",
        "Weekend Open Water",
        "Steady Open Water Swim",
      ],
    },
  ],
  hike: [
    {
      label: "Easy",
      names: [
        "Morning Hike",
        "Evening Hike",
        "Forest Walk",
        "Easy Trail Walk",
        "Nature Trail",
        "Valley Walk",
      ],
    },
    {
      label: "Trail",
      names: [
        "Ridge Trail Hike",
        "Waterfall Trail",
        "Forest Loop",
        "Canyon Trail",
        "Lookout Trail",
        "Meadow Loop",
      ],
    },
    {
      label: "Summit",
      names: [
        "Summit Hike",
        "Mountain Hike",
        "Ridgeline Hike",
        "Weekend Long Hike",
        "Steady Climb",
        "Trail to the Viewpoint",
      ],
    },
  ],
};

function flattenPresetGroups(type: ActivityType): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of ACTIVITY_NAME_PRESET_GROUPS[type]) {
    for (const n of g.names) {
      if (!seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
  }
  return out;
}

/** Flat list for datalist, random generation, and any code that needs all names. */
export const ROUTE_NAMES: Record<ActivityType, string[]> = {
  run: flattenPresetGroups("run"),
  ride: flattenPresetGroups("ride"),
  swim: flattenPresetGroups("swim"),
  hike: flattenPresetGroups("hike"),
};

/** Stable defaults (not morning-first) for hydration and first paint. */
export const DEFAULT_ROUTE_NAME: Record<ActivityType, string> = {
  run: "Morning Easy Run",
  ride: "Morning Ride",
  swim: "Pool Laps",
  hike: "Forest Walk",
};
