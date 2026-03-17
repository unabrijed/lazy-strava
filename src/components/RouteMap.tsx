"use client";

/**
 * Generates an SVG path that resembles a Strava route polyline.
 * Mimics the orange trace Strava shows on activity maps.
 * Uses a deterministic seed for consistent shape per activity.
 */
function generateRoutePath(seed: number, width: number, height: number): string {
  const points: { x: number; y: number }[] = [];
  const steps = 16 + (seed % 8);
  const pad = 12;
  const w = width - pad * 2;
  const h = height - pad * 2;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const wiggle = 0.15;
    const x =
      pad +
      w * (0.1 + 0.8 * t + wiggle * Math.sin(seed * 0.3 + i * 0.8)) +
      Math.sin(i * 0.4) * 8;
    const y =
      pad +
      h * (0.15 + 0.7 * t) +
      Math.sin(seed * 0.7 + t * 4) * 15 +
      Math.cos(i * 0.35) * 6;
    points.push({
      x: Math.max(pad, Math.min(width - pad, x)),
      y: Math.max(pad, Math.min(height - pad, y)),
    });
  }

  return points.map((p, i) => (i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(" ");
}

interface RouteMapProps {
  seed?: number;
  className?: string;
  width?: number;
  height?: number;
}

export function RouteMap({
  seed = 42,
  className = "",
  width = 280,
  height = 100,
}: RouteMapProps) {
  const path = generateRoutePath(seed, width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <path
        d={path}
        fill="none"
        stroke="#FC4C02"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
