"use client";

import { useState } from "react";
import type { StravaActivity } from "@/lib/constants";
import { validateActivity, parseDurationToSec } from "@/lib/activityValidation";
import { ACTIVITY_NAME_PRESET_GROUPS, ROUTE_NAMES } from "@/lib/constants";

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
  const [prevDuration, setPrevDuration] = useState(activity.duration);
  const [durationInput, setDurationInput] = useState(() => formatDurationForInput(activity.duration ?? 0));
  const [durationError, setDurationError] = useState(false);

  const [prevType, setPrevType] = useState(activity.type);
  const [nameGroupFilter, setNameGroupFilter] = useState<string>("all");

  // Sync state with props during render to avoid cascading renders in useEffect
  if (activity.duration !== prevDuration) {
    setPrevDuration(activity.duration);
    setDurationInput(formatDurationForInput(activity.duration ?? 0));
    setDurationError(false);
  }

  if (activity.type !== prevType) {
    setPrevType(activity.type);
    setNameGroupFilter("all");
  }

  const applyChange = (field: keyof StravaActivity, value: string | number) => {
    const next = { ...activity };
    if (field === "routeName") next.routeName = String(value);
    if (field === "activityDate") next.activityDate = String(value);
    
    if (field === "distance") {
      const v = String(value);
      next.distance = v === "" ? undefined : parseFloat(v);
    }
    if (field === "duration") {
      const v = String(value);
      next.duration = v === "" ? undefined : parseInt(v, 10);
    }
    if (field === "pace") next.pace = String(value);
    if (field === "speed") {
      const v = String(value);
      next.speed = v === "" ? undefined : parseFloat(v);
    }
    if (field === "elevation") {
      const v = String(value);
      next.elevation = v === "" ? undefined : parseInt(v, 10);
    }
    
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

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Activity name</label>
          <p className="mb-2 text-xs text-zinc-500">
            Type a custom name, or tap a suggestion below (by time of day).
          </p>
          <input
            type="text"
            value={activity.routeName}
            onChange={(e) => applyChange("routeName", e.target.value)}
            placeholder="Your title — e.g. Evening tempo run"
            className={inputClass}
            list="route-suggestions"
          />
          <datalist id="route-suggestions">
            {ROUTE_NAMES[activity.type].map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="mt-3 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-medium text-zinc-600">Suggested names</span>
              <label className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="shrink-0">Show:</span>
                <select
                  value={nameGroupFilter}
                  onChange={(e) => setNameGroupFilter(e.target.value)}
                  className="min-h-[44px] sm:min-h-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#FC4C02] focus:outline-none focus:ring-1 focus:ring-[#FC4C02]"
                >
                  <option value="all">All times</option>
                  {ACTIVITY_NAME_PRESET_GROUPS[activity.type].map((g) => (
                    <option key={g.label} value={g.label}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {nameGroupFilter === "all" ? (
              <div className="space-y-3">
                {ACTIVITY_NAME_PRESET_GROUPS[activity.type].map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.names.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => applyChange("routeName", name)}
                          className={`min-h-[44px] rounded-full border px-3 py-2 text-left text-xs font-medium transition-colors touch-manipulation sm:min-h-0 sm:py-1.5 ${
                            activity.routeName === name
                              ? "border-[#FC4C02] bg-[#FC4C02] text-white"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 active:bg-zinc-50"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 sm:flex-wrap">
                {ACTIVITY_NAME_PRESET_GROUPS[activity.type]
                  .find((g) => g.label === nameGroupFilter)
                  ?.names.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => applyChange("routeName", name)}
                      className={`min-h-[44px] shrink-0 rounded-full border px-3 py-2 text-left text-xs font-medium transition-colors touch-manipulation sm:min-h-0 sm:py-1.5 ${
                        activity.routeName === name
                          ? "border-[#FC4C02] bg-[#FC4C02] text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 active:bg-zinc-50"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Distance (km)</label>
          <input
            type="number"
            min="0"
            step={activity.type === "swim" ? 0.05 : 0.1}
            value={activity.distance ?? ""}
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
              if (durationInput === "") {
                applyChange("duration", "");
                return;
              }
              const sec = parseDurationToSec(durationInput);
              if (sec >= 0) {
                applyChange("duration", sec);
                setDurationError(false);
              } else {
                setDurationInput(formatDurationForInput(activity.duration ?? 0));
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
