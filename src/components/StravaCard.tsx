"use client";

import { useState } from "react";
import type { StravaActivity } from "@/lib/constants";
import { STRAVA_ORANGE } from "@/lib/constants";
import { formatDuration } from "@/lib/randomActivity";

interface StravaCardProps {
  activity: StravaActivity;
  onChange?: (activity: StravaActivity) => void;
  isCompact?: boolean;
  className?: string;
}

const ICONS: Record<StravaActivity["type"], string> = {
  run: "🏃",
  ride: "🚴",
  swim: "🏊",
  hike: "🥾",
};

export function StravaCard({
  activity,
  onChange,
  isCompact = false,
  className = "",
}: StravaCardProps) {
  const formattedDuration = formatDuration(activity.duration);
  const distanceUnit = activity.type === "swim" ? "km" : "km";
  const distanceDisplay =
    activity.type === "swim" && activity.distance < 1
      ? `${(activity.distance * 1000).toFixed(0)}m`
      : `${activity.distance} ${distanceUnit}`;

  const handleFieldChange = (
    field: keyof StravaActivity,
    value: string | number
  ) => {
    if (!onChange) return;
    const next = { ...activity };
    if (field === "routeName") next.routeName = value as string;
    if (field === "distance") next.distance = parseFloat(value as string) || 0;
    if (field === "duration") next.duration = parseInt(value as string, 10) || 0;
    if (field === "pace") next.pace = value as string;
    if (field === "speed") next.speed = parseFloat(value as string) || 0;
    if (field === "elevation") next.elevation = parseInt(value as string, 10) || 0;
    if (field === "calories") next.calories = parseInt(value as string, 10) || 0;
    onChange(next);
  };

  const EditableValue = ({
    value,
    field,
    parse = (v) => v,
    format = (v) => String(v),
  }: {
    value: string | number;
    field: keyof StravaActivity;
    parse?: (v: string) => string | number;
    format?: (v: string | number) => string;
  }) => {
    if (!onChange)
      return <span>{format(value)}</span>;
    return (
      <input
        type="text"
        value={format(value)}
        onChange={(e) => handleFieldChange(field, parse(e.target.value))}
        className="w-full min-w-0 rounded bg-transparent px-1 py-0.5 text-inherit outline-none ring-1 ring-white/20 focus:ring-[var(--strava)]"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  return (
    <div
      className={`overflow-hidden rounded-xl bg-[#1a1a1a] text-white shadow-xl ${className}`}
      style={{ ["--strava" as string]: STRAVA_ORANGE }}
    >
      <div
        className="h-16 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]"
        style={{ borderTop: `3px solid ${STRAVA_ORANGE}` }}
      />
      <div className="space-y-4 px-4 pb-4">
        <div className="flex items-center gap-2 -mt-2">
          <span className="text-2xl">{ICONS[activity.type]}</span>
          <h2 className="font-semibold text-lg truncate flex-1 min-w-0">
            {onChange ? (
              <input
                type="text"
                value={activity.routeName}
                onChange={(e) => handleFieldChange("routeName", e.target.value)}
                className="w-full bg-transparent outline-none focus:ring-0 border-b border-white/20 focus:border-[var(--strava)]"
              />
            ) : (
              activity.routeName
            )}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Metric
            label="Distance"
            value={distanceDisplay}
            editable={onChange}
            onEdit={(v) => {
              const parsed = parseFloat(v) || parseFloat(v.replace("m", "")) / 1000;
              if (!isNaN(parsed)) handleFieldChange("distance", parsed);
            }}
          />
          <Metric
            label="Duration"
            value={formattedDuration}
            editable={onChange}
            onEdit={(v) => {
              const parts = v.split(":").map(Number);
              let s = 0;
              if (parts.length === 3) s = parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
              else if (parts.length === 2) s = parts[0]! * 60 + parts[1]!;
              else s = parseInt(v, 10) || 0;
              if (s > 0) handleFieldChange("duration", s);
            }}
          />
          {activity.pace != null && (
            <Metric
              label={activity.type === "swim" ? "Pace /100m" : "Pace"}
              value={activity.pace}
              editable={onChange}
              onEdit={(v) => handleFieldChange("pace", v)}
            />
          )}
          {activity.speed != null && (
            <Metric
              label="Avg Speed"
              value={`${activity.speed} km/h`}
              editable={onChange}
              onEdit={(v) => {
                const n = parseFloat(v.replace(/[^\d.]/g, ""));
                if (!isNaN(n)) handleFieldChange("speed", n);
              }}
            />
          )}
          {activity.elevation != null && (
            <Metric
              label="Elev Gain"
              value={`${activity.elevation} m`}
              editable={onChange}
              onEdit={(v) => {
                const n = parseInt(v.replace(/\D/g, ""), 10);
                if (!isNaN(n)) handleFieldChange("elevation", n);
              }}
            />
          )}
          {activity.calories != null && (
            <Metric
              label="Calories"
              value={`${activity.calories}`}
              editable={onChange}
              onEdit={(v) => {
                const n = parseInt(v.replace(/\D/g, ""), 10);
                if (!isNaN(n)) handleFieldChange("calories", n);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  editable,
  onEdit,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [innerValue, setInnerValue] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    onEdit?.(innerValue);
  };

  if (!editable)
    return (
      <div>
        <p className="text-xs text-white/60 uppercase tracking-wider">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    );

  if (editing)
    return (
      <div>
        <p className="text-xs text-white/60 uppercase tracking-wider">{label}</p>
        <input
          autoFocus
          value={innerValue}
          onChange={(e) => setInnerValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          className="w-full rounded bg-white/10 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[var(--strava)]"
        />
      </div>
    );

  return (
    <div
      className="cursor-pointer rounded px-2 py-1 -mx-2 -my-1 hover:bg-white/5 transition-colors"
      onClick={() => {
        setInnerValue(value);
        setEditing(true);
      }}
    >
      <p className="text-xs text-white/60 uppercase tracking-wider">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

