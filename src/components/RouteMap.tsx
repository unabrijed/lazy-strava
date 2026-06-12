"use client";

import { STRAVA_ORANGE } from "@/lib/constants";
import { mkRoutePath, routePointsFromSeed } from "@/lib/routeShapes";

// Strava-style map surfaces: warm paper beige in light, deep slate in dark.
const MAP_DARK = "#1A1C22";
const MAP_LIGHT = "#E9E6DF";
const STREET_DARK = "#262A33";
const STREET_LIGHT = "#FFFFFF";

interface RouteMapProps {
  seed?: number;
  className?: string;
  width?: number;
  height?: number;
  /** Light map chrome matches light cards; dark matches Strava-style map strip. */
  theme?: "light" | "dark";
  /**
   * Only the route stroke + endpoints (no map panel / streets). Use for PNG
   * export on transparent backgrounds (e.g. compact layout).
   */
  lineOnly?: boolean;
}

/** Tiny deterministic LCG so the street layout is stable per seed (no Math.random — SSR-safe). */
function seededRng(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Street {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
}

/** Pseudo street network: mostly axis-aligned segments with slight skew, like a map at this zoom. */
function streetsFromSeed(seed: number, width: number, height: number): Street[] {
  const rng = seededRng(seed * 7 + 13);
  const out: Street[] = [];
  const hCount = 3 + Math.floor(rng() * 2);
  const vCount = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < hCount; i++) {
    const y = height * (0.08 + 0.84 * rng());
    out.push({
      x1: 0,
      y1: y,
      x2: width,
      y2: y + (rng() - 0.5) * height * 0.25,
      major: rng() < 0.3,
    });
  }
  for (let i = 0; i < vCount; i++) {
    const x = width * (0.08 + 0.84 * rng());
    out.push({
      x1: x,
      y1: 0,
      x2: x + (rng() - 0.5) * width * 0.25,
      y2: height,
      major: rng() < 0.3,
    });
  }
  return out;
}

export function RouteMap({
  seed = 42,
  className = "",
  width = 280,
  height = 100,
  theme = "dark",
  lineOnly = false,
}: RouteMapProps) {
  const isLight = theme === "light";
  const mapBg = isLight ? MAP_LIGHT : MAP_DARK;
  const streetStroke = isLight ? STREET_LIGHT : STREET_DARK;

  const pad = Math.max(8, Math.round(Math.min(width, height) * 0.04));
  const rw = width - pad * 2;
  const rh = height - pad * 2;

  const pts = routePointsFromSeed(seed);
  const { d, start, end } = mkRoutePath(pts, rw, rh, pad, pad);

  const sw = Math.max(1.2, Math.min(2.5, width / 120));
  const streets = lineOnly ? [] : streetsFromSeed(seed, width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", margin: "0 auto" }}
    >
      {!lineOnly && (
        <>
          <rect width={width} height={height} fill={mapBg} />
          {streets.map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={streetStroke}
              strokeWidth={s.major ? sw * 2.2 : sw * 1.1}
              strokeOpacity={isLight ? 0.9 : 0.85}
              strokeLinecap="round"
            />
          ))}
        </>
      )}

      {lineOnly ? (
        // Transparent-sticker style: soft orange glow around the line.
        <>
          <path
            d={d}
            fill="none"
            stroke={STRAVA_ORANGE}
            strokeWidth={sw * 3.5}
            strokeOpacity={0.18}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke={STRAVA_ORANGE}
            strokeWidth={sw * 1.6}
            strokeOpacity={0.45}
            strokeLinecap="round"
          />
        </>
      ) : (
        // Map style: subtle casing under the polyline, like Strava's maps.
        <path
          d={d}
          fill="none"
          stroke={isLight ? "#FFFFFF" : "#0F1014"}
          strokeWidth={sw * 2.2}
          strokeOpacity={0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={STRAVA_ORANGE}
        strokeWidth={lineOnly ? sw : sw * 1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={start[0]} cy={start[1]} r={sw * 2.4} fill={STRAVA_ORANGE} />
      <circle
        cx={start[0]}
        cy={start[1]}
        r={sw * 1.2}
        fill={lineOnly ? "rgba(255,255,255,0.92)" : isLight ? MAP_LIGHT : "#141414"}
      />
      <circle cx={end[0]} cy={end[1]} r={sw * 3} fill={STRAVA_ORANGE} />
      <circle cx={end[0]} cy={end[1]} r={sw * 1.2} fill="#FF8C00" />
    </svg>
  );
}
