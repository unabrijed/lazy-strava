"use client";

import { useId } from "react";
import { STRAVA_ORANGE } from "@/lib/constants";
import { mkRoutePath, routePointsFromSeed } from "@/lib/routeShapes";

const MAP_DARK = "#111118";
const MAP_LIGHT = "#e6e6ea";

interface RouteMapProps {
  seed?: number;
  className?: string;
  width?: number;
  height?: number;
  /** Light map chrome matches light cards; dark matches Strava-style map strip. */
  theme?: "light" | "dark";
  /**
   * Only the route stroke + endpoints (no dark map panel / grid). Use for PNG export
   * on transparent backgrounds (e.g. compact layout).
   */
  lineOnly?: boolean;
}

export function RouteMap({
  seed = 42,
  className = "",
  width = 280,
  height = 100,
  theme = "dark",
  lineOnly = false,
}: RouteMapProps) {
  const patternId = useId();
  const gridPatternId = `route-map-grid-${patternId.replace(/:/g, "")}`;
  const isLight = theme === "light";
  const mapBg = isLight ? MAP_LIGHT : MAP_DARK;
  const gridStroke = isLight ? "rgba(0,0,0,0.08)" : "#1e1e28";
  const dotFill = isLight ? "rgba(0,0,0,0.12)" : "#2a2a3a";

  const pad = Math.max(8, Math.round(Math.min(width, height) * 0.04));
  const rw = width - pad * 2;
  const rh = height - pad * 2;

  const pts = routePointsFromSeed(seed);
  const { d, start, end } = mkRoutePath(pts, rw, rh, pad, pad);

  const sw = Math.max(1.2, Math.min(2.5, width / 120));
  const dotNodes: [number, number][] = [
    [0.15, 0.22],
    [0.35, 0.42],
    [0.55, 0.18],
    [0.72, 0.65],
    [0.42, 0.78],
    [0.82, 0.35],
    [0.25, 0.6],
    [0.65, 0.45],
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", margin: "0 auto" }}
    >
      {!lineOnly && (
        <defs>
          <pattern
            id={gridPatternId}
            width={28}
            height={28}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              stroke={gridStroke}
              strokeWidth={0.5}
            />
          </pattern>
        </defs>
      )}
      {!lineOnly && (
        <>
          <rect width={width} height={height} fill={mapBg} />
          <rect width={width} height={height} fill={`url(#${gridPatternId})`} opacity={0.5} />
          {dotNodes.map(([nx, ny], i) => (
            <circle
              key={i}
              cx={nx * width}
              cy={ny * height}
              r={1.5}
              fill={dotFill}
              opacity={0.7}
            />
          ))}
        </>
      )}

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
      <path
        d={d}
        fill="none"
        stroke={STRAVA_ORANGE}
        strokeWidth={sw}
        strokeLinecap="round"
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
