"use client";

import { useState, useEffect, useMemo } from "react";
import type { StravaActivity } from "@/lib/constants";
import { STRAVA_ORANGE } from "@/lib/constants";
import { formatDuration } from "@/lib/randomActivity";
import { validateActivity } from "@/lib/activityValidation";
import { RouteMap } from "./RouteMap";

interface StravaCardProps {
  activity: StravaActivity;
  onChange?: (activity: StravaActivity) => void;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Strava Stats Sticker design - matches Strava's Instagram share format.
 * Uses Inter (Strava's UI font). Supports light/dark theme.
 */
export function StravaCard({
  activity,
  onChange,
  theme = "dark",
  className = "",
}: StravaCardProps) {
  const isLight = theme === "light";
  const formattedDuration = formatDuration(activity.duration);
  const distanceDisplay =
    activity.type === "swim" && activity.distance < 1
      ? `${(activity.distance * 1000).toFixed(0)} m`
      : `${activity.distance.toFixed(1)} km`;

  const routeSeed = useMemo(
    () =>
      (activity.routeName + activity.distance + activity.duration)
        .split("")
        .reduce((a, c) => a + c.charCodeAt(0), 0),
    [activity.routeName, activity.distance, activity.duration]
  );

  const handleFieldChange = (
    field: keyof StravaActivity,
    value: string | number
  ) => {
    if (!onChange) return;
    const next = { ...activity };
    if (field === "routeName") next.routeName = value as string;
    if (field === "activityDate") next.activityDate = value as string;
    if (field === "distance") next.distance = parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
    if (field === "duration") {
      const str = String(value);
      const parts = str.split(":").map(Number);
      if (parts.length === 3) next.duration = parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
      else if (parts.length === 2) next.duration = parts[0]! * 60 + parts[1]!;
      else next.duration = parseInt(str.replace(/\D/g, ""), 10) || 0;
    }
    if (field === "pace") next.pace = value as string;
    if (field === "speed") next.speed = parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
    if (field === "elevation") next.elevation = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
    if (field === "calories") next.calories = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
    const validated = validateActivity(next, field);
    onChange(validated);
  };

  return (
    <div
      className={`font-sans overflow-hidden rounded-2xl ${className}`}
      style={{
        background: isLight ? "rgba(255, 255, 255, 0.98)" : "rgba(20, 20, 20, 0.95)",
        boxShadow: isLight
          ? "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)"
          : "0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ height: 2, backgroundColor: STRAVA_ORANGE }} />
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: isLight ? "#f4f4f5" : "#141414",
          padding: "10px",
        }}
      >
        <RouteMap seed={routeSeed} width={284} height={96} />
      </div>

      <div className="px-4 py-3 space-y-3">
        {onChange ? (
          <input
            type="text"
            value={activity.routeName}
            onChange={(e) => handleFieldChange("routeName", e.target.value)}
            placeholder="Activity name"
            className={`w-full text-xs bg-transparent border-b outline-none pb-1 focus:border-[#FC4C02] ${
              isLight
                ? "text-zinc-500 border-zinc-200 placeholder:text-zinc-400"
                : "text-white/60 border-white/10 placeholder:text-white/40"
            }`}
          />
        ) : (
          <p className={`text-xs truncate ${isLight ? "text-zinc-500" : "text-white/50"}`}>{activity.routeName}</p>
        )}

        {/* Main stats row - Strava style: Distance, Time, Pace/Speed/Elevation */}
        {(() => {
          const thirdStat =
            activity.type === "run" || activity.type === "swim"
              ? {
                  label: activity.type === "swim" ? "PACE /100m" : "PACE",
                  value: activity.pace ?? "—",
                  field: "pace" as const,
                }
              : activity.type === "ride"
                ? { label: "AVG SPEED", value: `${activity.speed ?? 0} km/h`, field: "speed" as const }
                : { label: "ELEVATION", value: `${activity.elevation ?? 0} m`, field: "elevation" as const };
          return (
            <div className="grid grid-cols-3 gap-4">
              <StatBlock
                theme={theme}
                label="DISTANCE"
                value={distanceDisplay}
                editable={!!onChange}
                onEdit={(v) => {
                  const num = parseFloat(v.replace(/[^\d.]/g, "")) || 0;
                  const isMeters = v.includes("m") || (activity.type === "swim" && num >= 100);
                  if (!isNaN(num)) handleFieldChange("distance", isMeters ? num / 1000 : num);
                }}
              />
              <StatBlock
                theme={theme}
                label="TIME"
                value={formattedDuration}
                editable={!!onChange}
                onEdit={(v) => {
                  const parts = v.split(":").map(Number);
                  let s = 0;
                  if (parts.length === 3) s = parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
                  else if (parts.length === 2) s = parts[0]! * 60 + parts[1]!;
                  else s = parseInt(v, 10) || 0;
                  if (s > 0) handleFieldChange("duration", s);
                }}
              />
              <StatBlock
                theme={theme}
                label={thirdStat.label}
                value={thirdStat.value}
                editable={!!onChange}
                onEdit={(v) => {
                  if (thirdStat.field === "elevation") {
                    const n = parseInt(v.replace(/\D/g, ""), 10);
                    if (!isNaN(n)) handleFieldChange("elevation", n);
                  } else if (thirdStat.field === "speed") {
                    const n = parseFloat(v.replace(/[^\d.]/g, ""));
                    if (!isNaN(n)) handleFieldChange("speed", n);
                  } else {
                    handleFieldChange("pace", v);
                  }
                }}
              />
            </div>
          );
        })()}
      </div>

      <div
        className="flex items-center justify-center py-2"
        style={{ borderTop: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="text-sm font-semibold tracking-tight" style={{ color: STRAVA_ORANGE }}>
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
  const isLight = theme === "light";
  useEffect(() => {
    if (!editing) setInnerValue(value);
  }, [value, editing]);

  const handleBlur = () => {
    setEditing(false);
    onEdit?.(innerValue);
  };

  const labelClass = `text-[10px] font-medium uppercase tracking-widest mb-0.5 ${isLight ? "text-zinc-500" : "text-white/40"}`;
  const valueClass = `text-base font-semibold ${isLight ? "text-zinc-900" : "text-white"}`;

  if (!editable) {
    return (
      <div>
        <p className={labelClass}>{label}</p>
        <p className={valueClass}>{value}</p>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <p className={labelClass}>{label}</p>
        <input
          autoFocus
          value={innerValue}
          onChange={(e) => setInnerValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          className={`w-full text-base font-semibold rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#FC4C02] ${
            isLight ? "text-zinc-900 bg-zinc-100" : "text-white bg-white/10"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer -mx-1 px-1 py-0.5 rounded ${isLight ? "hover:bg-zinc-100" : "hover:bg-white/5"}`}
      onClick={() => {
        setInnerValue(value);
        setEditing(true);
      }}
    >
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}
