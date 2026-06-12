"use client";

import { useState, useMemo } from "react";
import type { StravaActivity } from "@/lib/constants";
import { CARD_COLORS, STRAVA_ORANGE } from "@/lib/constants";
import { statsForActivity } from "@/lib/formatStats";
import { validateActivity } from "@/lib/activityValidation";
import { routeSeedForActivity } from "@/lib/routeSeed";
import { RouteMap } from "./RouteMap";

export type StravaCardExportLayout = {
  width: number;
  mapWidth: number;
  mapHeight: number;
};

interface StravaCardProps {
  activity: StravaActivity;
  onChange?: (activity: StravaActivity) => void;
  theme?: "light" | "dark";
  className?: string;
  /** Wider map + container for PNG export (off-screen composer). */
  exportLayout?: StravaCardExportLayout;
}

/** Accepts "42m 13s", "1h 12m", "42:13", "1:12:45" or plain seconds. */
function parseFlexibleDuration(v: string): number {
  const str = v.trim();
  const hms = str.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?$/i);
  if (hms && (hms[1] || hms[2] || hms[3])) {
    return (
      (parseInt(hms[1] ?? "0", 10) || 0) * 3600 +
      (parseInt(hms[2] ?? "0", 10) || 0) * 60 +
      (parseInt(hms[3] ?? "0", 10) || 0)
    );
  }
  const parts = str.split(":").map(Number);
  if (parts.length === 3 && parts.every((n) => !isNaN(n)))
    return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  if (parts.length === 2 && parts.every((n) => !isNaN(n))) return parts[0]! * 60 + parts[1]!;
  return parseInt(str.replace(/\D/g, ""), 10) || 0;
}

/**
 * Strava Stats Sticker design - matches Strava's Instagram share format.
 * Uses Inter (Strava's UI font) with tabular numerals. Supports light/dark theme.
 */
export function StravaCard({
  activity,
  onChange,
  theme = "dark",
  className = "",
  exportLayout,
}: StravaCardProps) {
  const colors = CARD_COLORS[theme];
  const mapW = exportLayout?.mapWidth ?? 284;
  const mapH = exportLayout?.mapHeight ?? 96;

  const routeSeed = useMemo(() => routeSeedForActivity(activity), [activity]);
  const stats = statsForActivity(activity);

  const handleFieldChange = (field: keyof StravaActivity, value: string | number) => {
    if (!onChange) return;
    const next = { ...activity };
    if (field === "routeName") next.routeName = value as string;
    if (field === "distance") {
      const str = String(value);
      const num = parseFloat(str.replace(/[^\d.]/g, "")) || 0;
      const isMeters =
        /\d\s*m\b/.test(str) && !/km/.test(str) && (activity.type === "swim" || num >= 100);
      next.distance = isMeters ? num / 1000 : num;
    }
    if (field === "duration") next.duration = parseFlexibleDuration(String(value));
    if (field === "pace") {
      const m = String(value).match(/\d{1,2}:\d{2}/);
      next.pace = m ? m[0] : String(value);
    }
    if (field === "speed") next.speed = parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
    if (field === "elevation")
      next.elevation = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
    const validated = validateActivity(next, field);
    onChange(validated);
  };

  return (
    <div
      className={`font-sans overflow-hidden rounded-2xl ${className}`}
      style={{
        width: exportLayout?.width,
        background: colors.card,
        boxShadow:
          theme === "light"
            ? "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)"
            : "0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="relative flex justify-center overflow-hidden"
        style={{
          padding: exportLayout ? "16px" : "10px",
        }}
      >
        <RouteMap seed={routeSeed} width={mapW} height={mapH} theme={theme} lineOnly />
      </div>

      <div className={`space-y-3 ${exportLayout ? "px-6 py-4" : "px-4 py-3"}`}>
        {onChange ? (
          <input
            type="text"
            value={activity.routeName}
            onChange={(e) => handleFieldChange("routeName", e.target.value)}
            placeholder="Activity name"
            className="w-full text-xs bg-transparent border-b outline-none pb-1 focus:border-[#FC4C02]"
            style={{
              color: colors.secondary,
              borderColor: colors.divider,
            }}
          />
        ) : (
          <p className="text-xs truncate" style={{ color: colors.secondary }}>
            {activity.routeName}
          </p>
        )}

        {/* Canonical Strava stat row: Distance / Pace-or-Speed-or-Elev / Time */}
        <div className="flex w-full justify-between gap-3 overflow-hidden">
          {stats.map((stat) => (
            <div key={stat.field} className="flex-1 min-w-0">
              <StatBlock
                theme={theme}
                label={stat.label}
                value={stat.value}
                editable={!!onChange}
                onEdit={(v) => handleFieldChange(stat.field, v)}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-center py-2"
        style={{ borderTop: `1px solid ${colors.divider}` }}
      >
        <span
          className="text-[13px] font-bold uppercase tracking-[0.08em]"
          style={{ color: STRAVA_ORANGE }}
        >
          strava
        </span>
      </div>
    </div>
  );
}

function StatBlock({
  theme = "dark",
  label,
  value,
  editable,
  onEdit,
}: {
  theme?: "light" | "dark";
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [innerValue, setInnerValue] = useState(value);
  const colors = CARD_COLORS[theme];

  const handleBlur = () => {
    setEditing(false);
    onEdit?.(innerValue);
  };

  const labelStyle = { color: colors.secondary };
  const valueStyle = { color: colors.text };
  const labelClass = "text-[11px] font-medium mb-0.5";
  const valueClass = "text-base font-semibold tabular-nums";

  if (!editable) {
    return (
      <div>
        <p className={labelClass} style={labelStyle}>
          {label}
        </p>
        <p className={valueClass} style={valueStyle}>
          {value}
        </p>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <p className={labelClass} style={labelStyle}>
          {label}
        </p>
        <input
          autoFocus
          value={innerValue}
          onChange={(e) => setInnerValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          className="w-full text-base font-semibold tabular-nums rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#FC4C02]"
          style={{
            color: colors.text,
            background: theme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.10)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer -mx-1 px-1 py-0.5 rounded ${
        theme === "light" ? "hover:bg-zinc-100" : "hover:bg-white/5"
      }`}
      onClick={() => {
        setInnerValue(value);
        setEditing(true);
      }}
    >
      <p className={labelClass} style={labelStyle}>
        {label}
      </p>
      <p className={valueClass} style={valueStyle}>
        {value}
      </p>
    </div>
  );
}
