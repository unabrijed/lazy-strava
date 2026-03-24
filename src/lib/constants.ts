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
}

export const STRAVA_ORANGE = "#FC4C02";

/** Grouped by time of day for UI chips; flat list derived for random/datalist. */
export const ACTIVITY_NAME_PRESET_GROUPS: Record<
  ActivityType,
  { label: string; names: string[] }[]
> = {
  run: [
    {
      label: "Morning",
      names: ["Morning Run - Central Park", "Sunrise Easy Run - Park Loop"],
    },
    {
      label: "Midday",
      names: ["Lunch Run - Downtown Loop", "Midday Office Loop"],
    },
    {
      label: "Afternoon",
      names: ["Afternoon Tempo - Track", "Post-Work Jog - Riverside"],
    },
    {
      label: "Evening",
      names: ["Sunset Jog - Riverside", "Evening Tempo - Track"],
    },
    {
      label: "Night",
      names: ["Night Run - City Lights", "Late Night Easy Run"],
    },
    {
      label: "Weekend",
      names: ["Weekend Long Run", "Saturday Park Run", "Recovery Run - Neighborhood"],
    },
  ],
  ride: [
    {
      label: "Morning",
      names: ["Morning Commute", "Sunrise Ride - Coast"],
    },
    {
      label: "Midday",
      names: ["Lunch Ride - Loop", "Midday Spin - Flat Route"],
    },
    {
      label: "Afternoon",
      names: ["Afternoon Training Ride", "Flat Loop Sprints"],
    },
    {
      label: "Evening",
      names: ["Evening Spin", "Sunset Coast Road"],
    },
    {
      label: "Night",
      names: ["Night Ride - City Lights"],
    },
    {
      label: "Weekend",
      names: ["Weekend Epic - Coast Road", "Sunday Long Ride", "Hill Climb - Mountain Pass"],
    },
  ],
  swim: [
    {
      label: "Morning",
      names: ["Morning Laps - Pool", "Early Swim Session"],
    },
    {
      label: "Midday",
      names: ["Lunch Swim - Pool", "Midday Lap Session"],
    },
    {
      label: "Afternoon",
      names: ["Afternoon Technique Session", "Open Water Practice"],
    },
    {
      label: "Evening",
      names: ["Evening Swim Session", "Pool Cooldown"],
    },
    {
      label: "Night",
      names: ["Night Swim - Pool"],
    },
    {
      label: "Weekend",
      names: ["Open Water - Lake", "Weekend Endurance Swim", "Sprint Training"],
    },
  ],
  hike: [
    {
      label: "Morning",
      names: ["Sunrise Ridge Trail", "Morning Forest Loop"],
    },
    {
      label: "Midday",
      names: ["Summit Lunch Hike", "Midday Valley Walk"],
    },
    {
      label: "Afternoon",
      names: ["Afternoon Coastal Hike", "Trail to Summit"],
    },
    {
      label: "Evening",
      names: ["Golden Hour Hike", "Scenic Ridge Trail"],
    },
    {
      label: "Night",
      names: ["Twilight Trail Walk"],
    },
    {
      label: "Weekend",
      names: ["Weekend Long Hike", "Mountain Ascent", "Forest Loop"],
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
  run: "Lunch Run - Downtown Loop",
  ride: "Afternoon Training Ride",
  swim: "Midday Lap Session",
  hike: "Midday Valley Walk",
};
