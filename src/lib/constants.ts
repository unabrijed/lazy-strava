export type ActivityType = "run" | "ride" | "swim" | "hike";

export interface StravaActivity {
  type: ActivityType;
  routeName: string;
  distance: number;
  duration: number;
  pace?: string;
  speed?: number;
  elevation?: number;
  calories?: number;
  activityDate?: string; // ISO date string
}

export const STRAVA_ORANGE = "#FC4C02";

export const ROUTE_NAMES: Record<ActivityType, string[]> = {
  run: [
    "Morning Run - Central Park",
    "Sunset Jog - Riverside",
    "Lunch Run - Downtown Loop",
    "Evening Tempo - Track",
    "Weekend Long Run",
    "Recovery Run - Neighborhood",
    "Hill Repeats - Mountain View",
  ],
  ride: [
    "Sunday Long Ride",
    "Morning Commute",
    "Weekend Epic - Coast Road",
    "Training Ride - Flat Loop",
    "Hill Climb - Mountain Pass",
    "City Explorers Ride",
    "Evening Spin",
  ],
  swim: [
    "Morning Laps - Pool",
    "Open Water - Lake",
    "Technique Session",
    "Endurance Swim",
    "Sprint Training",
    "Recovery Swim",
  ],
  hike: [
    "Trail to Summit",
    "Forest Loop",
    "Coastal Hike",
    "Mountain Ascent",
    "Valley Walk",
    "Scenic Ridge Trail",
  ],
};
