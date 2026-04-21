import type { StravaActivity } from "./constants";

/**
 * Deterministic non-cryptographic hash for turning activity details into a
 * route-map seed. This gives many more visible route variations than summing
 * char codes, while staying stable across renders/exports.
 */
export function hashStringToSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function randomRouteVariant(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export function routeSeedForActivity(activity: StravaActivity): number {
  return hashStringToSeed(
    [
      activity.routeVariant ?? "",
      activity.type,
      activity.routeName,
      activity.activityDate ?? "",
      activity.distance ?? "",
      activity.duration ?? "",
      activity.elevation ?? "",
      activity.speed ?? "",
      activity.pace ?? "",
    ].join("|")
  );
}
