"use client";

import { useState } from "react";
import type { StravaActivity } from "@/lib/constants";
import { validateActivity, parseDurationToSec } from "@/lib/activityValidation";
import {
  uiFieldLabel,
  uiInput,
  uiSectionLabel,
} from "@/lib/ui";

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

  if (activity.duration !== prevDuration) {
    setPrevDuration(activity.duration);
    setDurationInput(formatDurationForInput(activity.duration ?? 0));
    setDurationError(false);
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

  return (
    <div className="space-y-4">

      <div>
        <label htmlFor="activity-date" className={uiFieldLabel}>
          Date
        </label>
        <input
          id="activity-date"
          type="date"
          value={activity.activityDate ?? ""}
          onChange={(e) => applyChange("activityDate", e.target.value)}
          className={`${uiInput} sm:max-w-xs`}
        />
      </div>

      <div>
        <p className={`${uiSectionLabel} mb-3`}>Stats</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={uiFieldLabel}>Distance (km)</label>
            <input
              type="number"
              min="0"
              step={activity.type === "swim" ? 0.05 : 0.1}
              value={activity.distance ?? ""}
              onChange={(e) => applyChange("distance", e.target.value)}
              placeholder={activity.type === "swim" ? "0.5" : "5.2"}
              className={uiInput}
            />
          </div>

          <div>
            <label className={uiFieldLabel}>Duration</label>
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
              className={uiInput}
              aria-invalid={durationError}
              aria-describedby={durationError ? "duration-hint" : undefined}
            />
            {durationError && (
              <p id="duration-hint" className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                Use HH:MM:SS or MM:SS (e.g. 27:00 or 1:05:30)
              </p>
            )}
          </div>

          {(activity.type === "run" || activity.type === "swim" || activity.type === "hike") && (
            <div>
              <label className={uiFieldLabel}>Pace</label>
              <input
                type="text"
                value={activity.pace ?? ""}
                onChange={(e) => applyChange("pace", e.target.value)}
                placeholder={activity.type === "swim" ? "2:00" : "5:30"}
                className={uiInput}
              />
            </div>
          )}

          {activity.type === "ride" && (
            <div>
              <label className={uiFieldLabel}>Speed</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={activity.speed ?? ""}
                onChange={(e) => applyChange("speed", e.target.value)}
                placeholder="28"
                className={uiInput}
              />
            </div>
          )}

          {(activity.type === "run" || activity.type === "ride" || activity.type === "hike") && (
            <div>
              <label className={uiFieldLabel}>Elev.</label>
              <input
                type="number"
                min="0"
                value={activity.elevation ?? ""}
                onChange={(e) => applyChange("elevation", e.target.value)}
                placeholder="100"
                className={uiInput}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
