/**
 * Normalized polylines in [0, 1]² — hand-tuned silhouettes (loops, out-and-backs, etc.).
 * Same idea as a fixed “route style” library, not GPS data.
 */
export const ROUTE_PRESETS: [number, number][][] = [
  [
    [0.2, 0.75],
    [0.12, 0.55],
    [0.18, 0.3],
    [0.35, 0.15],
    [0.55, 0.1],
    [0.75, 0.2],
    [0.85, 0.45],
    [0.78, 0.7],
    [0.6, 0.85],
    [0.4, 0.88],
    [0.2, 0.75],
  ],
  [
    [0.1, 0.65],
    [0.25, 0.45],
    [0.4, 0.3],
    [0.55, 0.25],
    [0.7, 0.3],
    [0.85, 0.5],
    [0.75, 0.4],
    [0.6, 0.3],
    [0.45, 0.25],
    [0.3, 0.4],
    [0.15, 0.6],
    [0.1, 0.65],
  ],
  [
    [0.08, 0.85],
    [0.18, 0.65],
    [0.14, 0.48],
    [0.28, 0.35],
    [0.42, 0.4],
    [0.5, 0.25],
    [0.64, 0.2],
    [0.72, 0.35],
    [0.82, 0.22],
    [0.92, 0.14],
  ],
  [[0.08, 0.6], [0.22, 0.35], [0.45, 0.42], [0.6, 0.22], [0.78, 0.3], [0.92, 0.55]],
  [
    [0.1, 0.5],
    [0.14, 0.3],
    [0.28, 0.18],
    [0.4, 0.32],
    [0.37, 0.52],
    [0.5, 0.72],
    [0.65, 0.6],
    [0.72, 0.4],
    [0.86, 0.3],
    [0.93, 0.5],
    [0.8, 0.7],
    [0.65, 0.82],
    [0.44, 0.78],
    [0.28, 0.65],
  ],
];

export const ROUTE_PRESET_LABELS = [
  "City loop",
  "Out & back",
  "Trail",
  "Sprint",
  "Epic",
] as const;

export function routeIndexFromSeed(seed: number): number {
  const n = ROUTE_PRESETS.length;
  return ((seed % n) + n) % n;
}

/**
 * Maps normalized points into a pixel rect, then builds a smooth SVG path:
 * for each interior knot, a quadratic segment uses that knot as the control point and
 * ends at the midpoint toward the next knot; the last segment uses smooth quadratic (T)
 * to the final point. Visually this reads like a Strava-style trace rather than a jagged polyline.
 */
export function mkRoutePath(
  pts: [number, number][],
  w: number,
  h: number,
  ox = 0,
  oy = 0
): { d: string; start: [number, number]; end: [number, number] } {
  const s = pts.map(([x, y]) => [ox + x * w, oy + y * h] as [number, number]);
  let d = `M ${s[0]![0].toFixed(2)} ${s[0]![1].toFixed(2)}`;
  for (let i = 1; i < s.length - 1; i++) {
    const mx = ((s[i]![0] + s[i + 1]![0]) / 2).toFixed(2);
    const my = ((s[i]![1] + s[i + 1]![1]) / 2).toFixed(2);
    d += ` Q ${s[i]![0].toFixed(2)} ${s[i]![1].toFixed(2)} ${mx} ${my}`;
  }
  d += ` T ${s[s.length - 1]![0].toFixed(2)} ${s[s.length - 1]![1].toFixed(2)}`;
  return { d, start: s[0]!, end: s[s.length - 1]! };
}
