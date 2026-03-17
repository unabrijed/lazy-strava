import type { ActivityType, StravaActivity } from "./constants";
import { ROUTE_NAMES } from "./constants";

/** Stable default activity for hydration (no random/Date). */
export function getDefaultActivity(type: ActivityType = "run"): StravaActivity {
  const base = { activityDate: "2025-03-15" };
  switch (type) {
    case "run":
      return {
        ...base,
        type: "run",
        routeName: ROUTE_NAMES.run[0]!,
        distance: 5.2,
        duration: 1620,
        pace: "5:12",
        elevation: 85,
        calories: 420,
      };
    case "ride":
      return {
        ...base,
        type: "ride",
        routeName: ROUTE_NAMES.ride[0]!,
        distance: 42.5,
        duration: 5400,
        speed: 28.3,
        elevation: 320,
        calories: 980,
      };
    case "swim":
      return {
        ...base,
        type: "swim",
        routeName: ROUTE_NAMES.swim[0]!,
        distance: 1.5,
        duration: 2160,
        pace: "2:00",
        calories: 260,
      };
    case "hike":
      return {
        ...base,
        type: "hike",
        routeName: ROUTE_NAMES.hike[0]!,
        distance: 12.5,
        duration: 10800,
        elevation: 650,
        calories: 720,
      };
  }
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function randomFrom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]!;
}

function formatPace(minPerKm: number): string {
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function secondsToDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function randomActivityDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 7));
  return d.toISOString().slice(0, 10);
}

export function generateRandomActivity(type: ActivityType): StravaActivity {
  const base = { activityDate: randomActivityDate() };
  switch (type) {
    case "run": {
      const distance = Math.round(randomBetween(3, 15) * 10) / 10;
      const paceMinPerKm = randomBetween(4.5, 7);
      const durationSec = distance * 1000 * (paceMinPerKm / 60) * 60;
      const elevation = randomInt(20, 200);
      const calories = Math.round(durationSec * 0.1 + distance * 60);
      return {
        ...base,
        type: "run",
        routeName: randomFrom(ROUTE_NAMES.run),
        distance,
        duration: Math.round(durationSec),
        pace: formatPace(paceMinPerKm),
        elevation,
        calories,
      };
    }
    case "ride": {
      const distance = Math.round(randomBetween(15, 80) * 10) / 10;
      const speedKmh = randomBetween(22, 35);
      const durationSec = (distance / speedKmh) * 3600;
      const elevation = randomInt(100, 800);
      const calories = Math.round(durationSec * 0.08 + distance * 25);
      return {
        ...base,
        type: "ride",
        routeName: randomFrom(ROUTE_NAMES.ride),
        distance,
        duration: Math.round(durationSec),
        speed: Math.round(speedKmh * 10) / 10,
        elevation,
        calories,
      };
    }
    case "swim": {
      const distanceM = randomInt(500, 3000);
      const distance = Math.round(distanceM / 100) / 10;
      const pacePer100m = randomBetween(1.75, 2.5);
      const durationSec = (distanceM / 100) * pacePer100m * 60;
      const calories = Math.round(durationSec * 0.12);
      return {
        ...base,
        type: "swim",
        routeName: randomFrom(ROUTE_NAMES.swim),
        distance,
        duration: Math.round(durationSec),
        pace: formatPace(pacePer100m),
        calories,
      };
    }
    case "hike": {
      const distance = Math.round(randomBetween(5, 25) * 10) / 10;
      const paceMinPerKm = randomBetween(12, 20);
      const durationSec = distance * 1000 * (paceMinPerKm / 60) * 60;
      const elevation = randomInt(200, 1200);
      const calories = Math.round(durationSec * 0.06 + elevation * 0.5);
      return {
        ...base,
        type: "hike",
        routeName: randomFrom(ROUTE_NAMES.hike),
        distance,
        duration: Math.round(durationSec),
        elevation,
        calories,
      };
    }
  }
}

export function formatDuration(seconds: number): string {
  return secondsToDuration(seconds);
}

/** Compact format for overlay: "29m 20s" */
export function formatDurationCompact(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}
