"use client";

import type { ActivityType, StravaActivity } from "@/lib/constants";
import { validateActivity } from "@/lib/activityValidation";
import { generateRandomActivity } from "@/lib/randomActivity";
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
} from "@/lib/ui";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { randomRouteVariant, routeSeedForActivity } from "@/lib/routeSeed";
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
  const updateActivity = (next: StravaActivity) => {
    onActivityChange(next);
  };


  const handleSelectedTypeRandomize = () => {
    onActivityChange(generateRandomActivity(activity.type));
  };

  const handleTypeChange = (type: ActivityType) => {
    onActivityChange(generateRandomActivity(type));
  };

  const handleRouteNameChange = (value: string) => {
    onActivityChange(validateActivity({ ...activity, routeName: value }));
  };

  const handleRouteRandomize = () => {
    onActivityChange({ ...activity, routeVariant: randomRouteVariant() });
  };

  const routeSeed = routeSeedForActivity(activity);
  const selectedActivityLabel =
    ACTIVITY_TYPES.find((item) => item.type === activity.type)?.label ?? "Activity";

  const preview =
    cardStyle === "map" ? (
      <StravaCard activity={activity} onChange={updateActivity} theme={statsTheme} />
    ) : (
      <div className="space-y-4">
        <div className="flex justify-center">
          <RouteMap seed={routeSeed} width={280} height={112} theme={statsTheme} />
        </div>
        <StravaCardCompact activity={activity} layout={statsLayout} theme={statsTheme} />
      </div>
    );

  return (
    <div className={`${uiCardShell} overflow-hidden lg:grid lg:grid-cols-[minmax(360px,1fr)_minmax(320px,420px)]`}>
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Build your activity
          </h2>
        </div>

        <section aria-labelledby="activity-type-heading">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 id="activity-type-heading" className={uiSectionLabel}>
              Type
            </h3>
            <button type="button" onClick={handleSelectedTypeRandomize} className={uiRandomButton}>
              <ShuffleIcon className="h-4 w-4" aria-hidden />
              Random {selectedActivityLabel}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIVITY_TYPES.map(({ type, label, icon }) => {
              const selected = activity.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`${selected ? uiActivityTypeCellActive : uiActivityTypeCell} lg:min-h-11 lg:py-2`}
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
            Name
          </label>
          <input
            id="activity-route-name"
            type="text"
            value={activity.routeName}
            onChange={(e) => handleRouteNameChange(e.target.value)}
            placeholder="Name your activity"
            className={uiActivityTitleInput}
          />
        </section>

        <ActivityFieldsForm activity={activity} onActivityChange={updateActivity} />
      </div>

      <div className={`${uiDivider} lg:hidden`} />

      <aside className="bg-zinc-50/60 dark:bg-zinc-900/30 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800">
        <div className="p-5 sm:p-6 space-y-5 lg:sticky lg:top-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className={uiSectionLabel}>Preview</p>
              <button type="button" onClick={handleRouteRandomize} className={uiRandomButton}>
                <ShuffleIcon className="h-4 w-4" aria-hidden />
                Random route
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {cardStyle === "compact" && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Stats</span>
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

          <div className="flex justify-center">{preview}</div>

          <ExportButton composeRef={exportRef} filename={activity.routeName} cardStyle={cardStyle} />
        </div>
      </aside>
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
