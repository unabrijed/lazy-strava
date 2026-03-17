import type { ActivityType, StravaActivity } from "./constants";

/** Realistic human limits per activity type. */
const LIMITS: Record<
  ActivityType,
  {
    distanceMin: number;
    distanceMax: number;
    durationMinSec: number;
    durationMaxSec: number;
    paceMinPerKm?: number;
    paceMaxPerKm?: number;
    paceMinPer100m?: number;
    paceMaxPer100m?: number;
    speedMinKmh?: number;
    speedMaxKmh?: number;
    elevationMin?: number;
    elevationMax?: number;
  }
> = {
  run: {
    distanceMin: 0.5,
    distanceMax: 50,
    durationMinSec: 600, // 10 min
    durationMaxSec: 28800, // 8 h
    paceMinPerKm: 3, // 3:00/km elite
    paceMaxPerKm: 15, // 15:00/km slow walk
    elevationMin: 0,
    elevationMax: 3000,
  },
  ride: {
    distanceMin: 1,
    distanceMax: 300,
    durationMinSec: 900, // 15 min
    durationMaxSec: 86400, // 24 h
    speedMinKmh: 8,
    speedMaxKmh: 60,
    elevationMin: 0,
    elevationMax: 5000,
  },
  swim: {
    distanceMin: 0.05, // 50 m
    distanceMax: 15,
    durationMinSec: 600, // 10 min
    durationMaxSec: 21600, // 6 h
    paceMinPer100m: 0.75, // 45s/100m elite
    paceMaxPer100m: 4, // 4:00/100m casual
    elevationMin: 0,
    elevationMax: 0,
  },
  hike: {
    distanceMin: 1,
    distanceMax: 50,
    durationMinSec: 3600, // 1 h
    durationMaxSec: 86400, // 24 h
    paceMinPerKm: 8, // 8 min/km fast
    paceMaxPerKm: 45, // 45 min/km very slow
    elevationMin: 0,
    elevationMax: 3500,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Parse "M:SS" or "MM:SS" to minutes (decimal). Used for pace/km or pace/100m. */
function parsePaceToMinutes(paceStr: string): number | null {
  const m = String(paceStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const mins = parseInt(m[1]!, 10);
  const secs = parseInt(m[2]!, 10);
  if (isNaN(mins) || isNaN(secs)) return null;
  return mins + secs / 60;
}

function minPerKmToPace(minPerKm: number): string {
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function parseDurationToSec(val: string | number): number {
  if (typeof val === "number") return Math.round(val);
  const str = String(val).trim();
  const parts = str.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return parseInt(str, 10) || 0;
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  return parts[0] ?? 0;
}

/** Validate and normalize activity so distance, duration, pace/speed stay consistent and realistic. */
export function validateActivity(
  activity: StravaActivity,
  changedField?: keyof StravaActivity
): StravaActivity {
  const limits = LIMITS[activity.type];
  const out = { ...activity };

  // Clamp distance
  out.distance = clamp(out.distance, limits.distanceMin, limits.distanceMax);
  out.distance = Math.round(out.distance * 10) / 10;

  // Clamp duration
  out.duration = clamp(out.duration, limits.durationMinSec, limits.durationMaxSec);
  out.duration = Math.round(out.duration);

  if (activity.type === "run" || activity.type === "hike") {
    const paceLim = limits.paceMinPerKm!;
    const paceMax = limits.paceMaxPerKm!;
    const paceFromDistDur = out.distance > 0 ? out.duration / 60 / out.distance : paceLim; // min/km

    if (changedField === "distance" || changedField === "pace") {
      const pace = out.pace ? parsePaceToMinutes(out.pace) : paceFromDistDur;
      const paceClamped = clamp(pace ?? paceFromDistDur, paceLim, paceMax);
      out.pace = minPerKmToPace(paceClamped);
      out.duration = Math.round(out.distance * paceClamped * 60); // km * min/km * 60 = sec
    } else if (changedField === "duration") {
      const paceClamped = clamp(paceFromDistDur, paceLim, paceMax);
      out.pace = minPerKmToPace(paceClamped);
      out.duration = Math.round(out.distance * paceClamped * 60);
    } else {
      const p = parsePaceToMinutes(out.pace ?? "0:00") ?? paceFromDistDur;
      const paceClamped = clamp(p, paceLim, paceMax);
      out.pace = minPerKmToPace(paceClamped);
      out.duration = Math.round(out.distance * paceClamped * 60);
    }

    if (out.elevation != null && limits.elevationMax != null) {
      out.elevation = clamp(out.elevation, limits.elevationMin ?? 0, limits.elevationMax);
    }
  }

  if (activity.type === "ride") {
    const speedLim = limits.speedMinKmh!;
    const speedMax = limits.speedMaxKmh!;

    if (changedField === "distance" || changedField === "speed") {
      const speed = out.speed ?? out.distance / (out.duration / 3600);
      const speedClamped = clamp(speed, speedLim, speedMax);
      out.speed = Math.round(speedClamped * 10) / 10;
      out.duration = Math.round((out.distance / out.speed!) * 3600);
    } else if (changedField === "duration") {
      const speed = out.distance / (out.duration / 3600);
      const speedClamped = clamp(speed, speedLim, speedMax);
      out.speed = Math.round(speedClamped * 10) / 10;
      out.duration = Math.round((out.distance / out.speed!) * 3600);
    } else {
      const speed = out.speed ?? out.distance / (out.duration / 3600);
      const speedClamped = clamp(speed, speedLim, speedMax);
      out.speed = Math.round(speedClamped * 10) / 10;
      out.duration = Math.round((out.distance / out.speed!) * 3600);
    }

    if (out.elevation != null && limits.elevationMax != null) {
      out.elevation = clamp(out.elevation, limits.elevationMin ?? 0, limits.elevationMax);
    }
  }

  if (activity.type === "swim") {
    const paceLim = limits.paceMinPer100m!;
    const paceMax = limits.paceMaxPer100m!;
    const distM = out.distance * 1000;
    const paceFromDistDur = distM > 0 ? (out.duration / 60) / (distM / 100) : 2; // min per 100m

    if (changedField === "distance" || changedField === "pace") {
      const pacePer100 = out.pace ? parsePaceToMinutes(out.pace) : paceFromDistDur;
      const paceClamped = clamp(pacePer100 ?? paceFromDistDur, paceLim, paceMax);
      out.pace = minPerKmToPace(paceClamped); // same format M:SS for per-100m
      out.duration = Math.round((distM / 100) * paceClamped * 60);
    } else if (changedField === "duration") {
      const paceClamped = clamp(paceFromDistDur, paceLim, paceMax);
      out.pace = minPerKmToPace(paceClamped);
      out.duration = Math.round((distM / 100) * paceClamped * 60);
    } else {
      const p = out.pace ? parsePaceToMinutes(out.pace) : paceFromDistDur;
      const paceClamped = clamp(p ?? paceFromDistDur, paceLim, paceMax);
      out.pace = minPerKmToPace(paceClamped);
      out.duration = Math.round((distM / 100) * paceClamped * 60);
    }
  }

  // Calories estimate
  if (activity.type === "run") {
    out.calories = Math.round(out.duration * 0.1 + out.distance * 60);
  } else if (activity.type === "ride") {
    out.calories = Math.round(out.duration * 0.08 + out.distance * 25);
  } else if (activity.type === "swim") {
    out.calories = Math.round(out.duration * 0.12);
  } else if (activity.type === "hike") {
    out.calories = Math.round(out.duration * 0.06 + (out.elevation ?? 0) * 0.5);
  }

  return out;
}

export function parseDurationInput(val: string): number {
  return parseDurationToSec(val);
}

export { parseDurationToSec, parsePaceToMinutes, minPerKmToPace };
