"use client";

import { useState } from "react";
import type { ActivityType, StravaActivity } from "@/lib/constants";
import { ROUTE_NAMES } from "@/lib/constants";
import { validateActivity } from "@/lib/activityValidation";
import { generateFullyRandomActivity, generateRandomActivity } from "@/lib/randomActivity";
import { applyVibePreset, VIBE_PRESETS } from "@/lib/vibePresets";
import {
  uiActivityTitleInput,
  uiActivityTypeCell,
  uiActivityTypeCellActive,
  uiCardShell,
  uiDivider,
  uiFieldLabel,
  uiRandomButton,
  uiSectionLabel,
  uiToggleActive,
  uiToggleInactive,
  uiVibeTile,
  uiVibeTileActive,
} from "@/lib/ui";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { RouteMap } from "./RouteMap";
import { ActivityFieldsForm } from "./ActivityFieldsForm";
import { ExportButton } from "./ExportButton";

interface ActivityEditorProps {
  activity: StravaActivity;
  onActivityChange: (activity: StravaActivity) => void;
  statsTheme?: "light" | "dark";
  cardStyle: "map" | "compact";
  statsLayout: "horizontal" | "vertical";
  onCardStyleChange: (style: "map" | "compact") => void;
  onStatsLayoutChange: (layout: "horizontal" | "vertical") => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: string }[] = [
  { type: "run", label: "Run", icon: "🏃" },
  { type: "ride", label: "Ride", icon: "🚴" },
  { type: "swim", label: "Swim", icon: "🏊" },
  { type: "hike", label: "Hike", icon: "🥾" },
];

export function ActivityEditor({
  activity,
  onActivityChange,
  statsTheme = "light",
  cardStyle,
  statsLayout,
  onCardStyleChange,
  onStatsLayoutChange,
  exportRef,
}: ActivityEditorProps) {
  const [activeVibeId, setActiveVibeId] = useState<string | null>(null);

  const clearVibeAndUpdate = (next: StravaActivity) => {
    setActiveVibeId(null);
    onActivityChange(next);
  };

  const handleRandomize = () => {
    setActiveVibeId(null);
    onActivityChange(generateFullyRandomActivity());
  };

  const handleVibePreset = (id: string) => {
    const next = applyVibePreset(id);
    if (next) {
      onActivityChange(next);
      setActiveVibeId(id);
    }
  };

  const handleTypeChange = (type: ActivityType) => {
    setActiveVibeId(null);
    onActivityChange(generateRandomActivity(type));
  };

  const handleRouteNameChange = (value: string) => {
    setActiveVibeId(null);
    onActivityChange(validateActivity({ ...activity, routeName: value }));
  };

  const routeSeed =
    (activity.routeName + activity.distance + activity.duration)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div className={`${uiCardShell} overflow-hidden`}>
      <div className="p-5 sm:p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Build your activity
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Pick a vibe, sport, and title — tune stats below.
          </p>
        </div>

        <section aria-labelledby="vibe-presets-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 id="vibe-presets-heading" className={uiSectionLabel}>
              Vibe presets
            </h3>
            <button type="button" onClick={handleRandomize} className={uiRandomButton}>
              <ShuffleIcon className="h-4 w-4" aria-hidden />
              Random
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {VIBE_PRESETS.map((p) => {
              const selected = activeVibeId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleVibePreset(p.id)}
                  className={selected ? uiVibeTileActive : uiVibeTile}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {p.emoji}
                  </span>
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="activity-type-heading">
          <h3 id="activity-type-heading" className={`${uiSectionLabel} mb-3`}>
            Activity type
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIVITY_TYPES.map(({ type, label, icon }) => {
              const selected = activity.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={selected ? uiActivityTypeCellActive : uiActivityTypeCell}
                >
                  <span className="text-xl" aria-hidden>
                    {icon}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="activity-name-heading">
          <label htmlFor="activity-route-name" id="activity-name-heading" className={uiFieldLabel}>
            Activity name
          </label>
          <input
            id="activity-route-name"
            type="text"
            value={activity.routeName}
            onChange={(e) => handleRouteNameChange(e.target.value)}
            placeholder="Name your activity"
            className={uiActivityTitleInput}
            list="route-suggestions"
          />
          <datalist id="route-suggestions">
            {ROUTE_NAMES[activity.type].map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </section>

        <ActivityFieldsForm activity={activity} onActivityChange={clearVibeAndUpdate} />
      </div>

      <div className={uiDivider} />

      <div className="px-5 sm:px-6 py-5 space-y-4 bg-zinc-50/60 dark:bg-zinc-900/30">
        <p className={uiSectionLabel}>Export</p>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 w-full sm:w-auto">Story layout</span>
          <button
            type="button"
            onClick={() => onCardStyleChange("map")}
            aria-pressed={cardStyle === "map"}
            className={cardStyle === "map" ? uiToggleActive : uiToggleInactive}
          >
            Map + stats
          </button>
          <button
            type="button"
            onClick={() => onCardStyleChange("compact")}
            aria-pressed={cardStyle === "compact"}
            className={cardStyle === "compact" ? uiToggleActive : uiToggleInactive}
          >
            Compact
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Preview matches the app theme (
          <span className="font-medium text-zinc-600 dark:text-zinc-300">
            {statsTheme === "dark" ? "dark" : "light"}
          </span>
          ). Use the header control to switch.
        </p>
        {cardStyle === "compact" && (
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-400 w-full sm:w-auto">Compact stats</span>
            <button
              type="button"
              onClick={() => onStatsLayoutChange("vertical")}
              aria-pressed={statsLayout === "vertical"}
              className={statsLayout === "vertical" ? uiToggleActive : uiToggleInactive}
            >
              Vertical
            </button>
            <button
              type="button"
              onClick={() => onStatsLayoutChange("horizontal")}
              aria-pressed={statsLayout === "horizontal"}
              className={statsLayout === "horizontal" ? uiToggleActive : uiToggleInactive}
            >
              Horizontal
            </button>
          </div>
        )}
      </div>

      <div className={uiDivider} />

      <div className="p-5 sm:p-6 space-y-3">
        <p className={uiSectionLabel}>Preview</p>
        {cardStyle === "map" ? (
          <StravaCard activity={activity} onChange={clearVibeAndUpdate} theme={statsTheme} />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <RouteMap seed={routeSeed} width={280} height={112} theme={statsTheme} />
            </div>
            <StravaCardCompact activity={activity} layout={statsLayout} theme={statsTheme} />
          </div>
        )}
      </div>

      <div className={`${uiDivider} bg-zinc-50/60 dark:bg-zinc-900/30`} />

      <div className="px-5 sm:px-6 py-5 bg-zinc-50/60 dark:bg-zinc-900/30">
        <ExportButton composeRef={exportRef} filename={activity.routeName} cardStyle={cardStyle} />
      </div>
    </div>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15 21 21" />
      <path d="M4 4l5 5" />
    </svg>
  );
}
