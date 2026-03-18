"use client";

import { useState, useEffect } from "react";
import type { StravaActivity } from "@/lib/constants";
import { validateActivity, parseDurationToSec } from "@/lib/activityValidation";
import { ROUTE_NAMES } from "@/lib/constants";

interface ActivityFieldsFormProps {
  activity: StravaActivity;
  onActivityChange: (activity: StravaActivity) => void;
}

function formatDurationForInput(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function ActivityFieldsForm({ activity, onActivityChange }: ActivityFieldsFormProps) {
  const [durationInput, setDurationInput] = useState(() => formatDurationForInput(activity.duration));
  const [durationError, setDurationError] = useState(false);

  useEffect(() => {
    setDurationInput(formatDurationForInput(activity.duration));
    setDurationError(false);
  }, [activity.duration]);

  const applyChange = (field: keyof StravaActivity, value: string | number) => {
    const next = { ...activity };
    if (field === "routeName") next.routeName = String(value);
    if (field === "activityDate") next.activityDate = String(value);
    if (field === "distance") next.distance = parseFloat(String(value)) || 0;
    if (field === "duration") next.duration = parseInt(String(value), 10) || 0;
    if (field === "pace") next.pace = String(value);
    if (field === "speed") next.speed = parseFloat(String(value)) || 0;
    if (field === "elevation") next.elevation = parseInt(String(value), 10) || 0;
    const validated = validateActivity(next, field);
    onActivityChange(validated);
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FC4C02] focus:outline-none focus:ring-1 focus:ring-[#FC4C02]";

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:p-5 space-y-4">
      <h3 className="text-sm font-medium text-zinc-700">Edit activity details</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Date</label>
          <input
            type="date"
            value={activity.activityDate ?? ""}
            onChange={(e) => applyChange("activityDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Activity name</label>
          <input
            type="text"
            value={activity.routeName}
            onChange={(e) => applyChange("routeName", e.target.value)}
            placeholder="e.g. Morning Run"
            className={inputClass}
            list="route-suggestions"
          />
          <datalist id="route-suggestions">
            {ROUTE_NAMES[activity.type].map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Distance (km)</label>
          <input
            type="number"
            min="0"
            step={activity.type === "swim" ? 0.05 : 0.1}
            value={activity.distance || ""}
            onChange={(e) => applyChange("distance", e.target.value)}
            placeholder={activity.type === "swim" ? "0.5" : "5.2"}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Duration (HH:MM:SS or MM:SS)</label>
          <input
            type="text"
            value={durationInput}
            onChange={(e) => {
              setDurationInput(e.target.value);
              setDurationError(false);
            }}
            onBlur={() => {
              const sec = parseDurationToSec(durationInput);
              if (sec > 0) {
                applyChange("duration", sec);
                setDurationError(false);
              } else {
                setDurationInput(formatDurationForInput(activity.duration));
                setDurationError(true);
              }
            }}
            placeholder="00:27:00"
            className={inputClass}
            aria-invalid={durationError}
            aria-describedby={durationError ? "duration-hint" : undefined}
          />
          {durationError && (
            <p id="duration-hint" className="mt-1 text-xs text-amber-600">
              Use HH:MM:SS or MM:SS (e.g. 27:00 or 1:05:30)
            </p>
          )}
        </div>

        {(activity.type === "run" || activity.type === "swim" || activity.type === "hike") && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Pace {activity.type === "swim" ? "(min/100m)" : "(min/km)"}
            </label>
            <input
              type="text"
              value={activity.pace ?? ""}
              onChange={(e) => applyChange("pace", e.target.value)}
              placeholder={activity.type === "swim" ? "2:00" : "5:30"}
              className={inputClass}
              aria-describedby="pace-hint"
            />
            <p id="pace-hint" className="mt-1 text-xs text-zinc-500">
              Format: M:SS (e.g. 5:30)
            </p>
          </div>
        )}

        {activity.type === "ride" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Avg speed (km/h)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activity.speed ?? ""}
              onChange={(e) => applyChange("speed", e.target.value)}
              placeholder="28"
              className={inputClass}
            />
          </div>
        )}

        {(activity.type === "run" || activity.type === "ride" || activity.type === "hike") && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Elevation (m)</label>
            <input
              type="number"
              min="0"
              value={activity.elevation ?? ""}
              onChange={(e) => applyChange("elevation", e.target.value)}
              placeholder="100"
              className={inputClass}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Values are validated to realistic ranges. Distance, duration, and pace/speed stay consistent.
      </p>
    </div>
  );
}
