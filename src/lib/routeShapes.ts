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
  [
    [0.08, 0.72],
    [0.2, 0.55],
    [0.34, 0.62],
    [0.5, 0.45],
    [0.66, 0.5],
    [0.78, 0.36],
    [0.92, 0.42],
  ],
  [
    [0.2, 0.22],
    [0.4, 0.12],
    [0.7, 0.2],
    [0.88, 0.42],
    [0.78, 0.72],
    [0.5, 0.88],
    [0.24, 0.76],
    [0.12, 0.48],
    [0.2, 0.22],
  ],
  [
    [0.1, 0.8],
    [0.22, 0.68],
    [0.3, 0.48],
    [0.44, 0.52],
    [0.52, 0.34],
    [0.68, 0.28],
    [0.82, 0.42],
    [0.74, 0.62],
    [0.9, 0.76],
  ],
  [
    [0.14, 0.5],
    [0.24, 0.28],
    [0.44, 0.22],
    [0.58, 0.34],
    [0.46, 0.5],
    [0.58, 0.68],
    [0.78, 0.72],
    [0.9, 0.5],
  ],
  [
    [0.12, 0.78],
    [0.2, 0.58],
    [0.32, 0.44],
    [0.48, 0.5],
    [0.62, 0.34],
    [0.8, 0.24],
    [0.92, 0.12],
  ],
  [
    [0.18, 0.82],
    [0.32, 0.7],
    [0.26, 0.54],
    [0.4, 0.42],
    [0.58, 0.48],
    [0.72, 0.34],
    [0.86, 0.48],
    [0.72, 0.62],
    [0.56, 0.56],
    [0.42, 0.7],
    [0.18, 0.82],
  ],
  [
    [0.1, 0.32],
    [0.24, 0.24],
    [0.38, 0.36],
    [0.32, 0.54],
    [0.46, 0.68],
    [0.64, 0.58],
    [0.78, 0.72],
    [0.9, 0.58],
  ],
  [
    [0.1, 0.7],
    [0.24, 0.48],
    [0.4, 0.62],
    [0.54, 0.42],
    [0.7, 0.58],
    [0.86, 0.36],
    [0.72, 0.2],
    [0.54, 0.34],
    [0.38, 0.18],
    [0.2, 0.34],
  ],
  [
    [0.28, 0.16],
    [0.52, 0.1],
    [0.78, 0.22],
    [0.9, 0.48],
    [0.82, 0.76],
    [0.58, 0.9],
    [0.3, 0.82],
    [0.12, 0.58],
    [0.16, 0.32],
    [0.28, 0.16],
  ],
  [
    [0.08, 0.52],
    [0.22, 0.38],
    [0.36, 0.52],
    [0.5, 0.38],
    [0.64, 0.52],
    [0.78, 0.38],
    [0.92, 0.52],
  ],
  [
    [0.12, 0.22],
    [0.26, 0.36],
    [0.18, 0.54],
    [0.34, 0.72],
    [0.54, 0.66],
    [0.62, 0.46],
    [0.78, 0.32],
    [0.9, 0.46],
  ],
  [
    [0.22, 0.86],
    [0.18, 0.62],
    [0.32, 0.44],
    [0.5, 0.34],
    [0.68, 0.2],
    [0.86, 0.28],
    [0.76, 0.44],
    [0.58, 0.56],
    [0.46, 0.76],
    [0.22, 0.86],
  ],
];

export const ROUTE_PRESET_LABELS = [
  "City loop",
  "Out & back",
  "Trail",
  "Sprint",
  "Epic",
  "Point-to-point",
  "Park loop",
  "Ridgeline",
  "Figure eight",
  "Diagonal",
  "Nested loop",
  "Switchbacks",
  "Zigzag",
  "Big loop",
  "Wave",
  "Hook",
  "Lollipop",
] as const;

export function routeIndexFromSeed(seed: number): number {
  const n = ROUTE_PRESETS.length;
  return ((seed % n) + n) % n;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(n: number): number {
  return Math.min(0.96, Math.max(0.04, n));
}

function isClosedLoop(pts: [number, number][]): boolean {
  const first = pts[0];
  const last = pts[pts.length - 1];
  return !!first && !!last && Math.abs(first[0] - last[0]) < 0.001 && Math.abs(first[1] - last[1]) < 0.001;
}

/**
 * Builds a deterministic variation of a preset route. The base silhouettes stay
 * believable, while mirroring, scaling, rotation, and point jitter make repeated
 * random activities look noticeably different instead of cycling through five maps.
 */
export function routePointsFromSeed(seed: number): [number, number][] {
  const rng = mulberry32(seed || 42);
  const base = ROUTE_PRESETS[routeIndexFromSeed(seed)] ?? ROUTE_PRESETS[0]!;
  const closed = isClosedLoop(base);
  const mirrorX = rng() > 0.5;
  const mirrorY = rng() > 0.68;
  const angle = (rng() - 0.5) * 0.32;
  const sx = 0.86 + rng() * 0.24;
  const sy = 0.86 + rng() * 0.24;
  const tx = (rng() - 0.5) * 0.08;
  const ty = (rng() - 0.5) * 0.08;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const varied = base.map(([x0, y0], i) => {
    let x = mirrorX ? 1 - x0 : x0;
    let y = mirrorY ? 1 - y0 : y0;

    // Keep endpoints of open routes more stable; make middle knots wander.
    const endpoint = !closed && (i === 0 || i === base.length - 1);
    const jitter = endpoint ? 0.015 : 0.065;
    x += (rng() - 0.5) * jitter;
    y += (rng() - 0.5) * jitter;

    x = (x - 0.5) * sx;
    y = (y - 0.5) * sy;
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return [clamp01(0.5 + rx + tx), clamp01(0.5 + ry + ty)] as [number, number];
  });

  if (closed) varied[varied.length - 1] = varied[0]!;
  return varied;
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
