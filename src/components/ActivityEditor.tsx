"use client";

import type { ActivityType, CardVariant, FeedMeta, StravaActivity } from "@/lib/constants";
import { validateActivity } from "@/lib/activityValidation";
import { generateRandomActivity } from "@/lib/randomActivity";
import {
  uiActivityTitleInput,
  uiActivityTypeCell,
  uiActivityTypeCellActive,
  uiCardShell,
  uiFieldLabel,
  uiRandomButton,
  uiSectionLabel,
} from "@/lib/ui";
import { ActivityFieldsForm } from "./ActivityFieldsForm";
import { FeedMetaForm } from "./FeedMetaForm";

interface ActivityEditorProps {
  activity: StravaActivity;
  onActivityChange: (activity: StravaActivity) => void;
  variant: CardVariant;
  feedMeta: FeedMeta;
  onFeedMetaChange: (meta: FeedMeta) => void;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: string }[] = [
  { type: "run", label: "Run", icon: "🏃" },
  { type: "ride", label: "Ride", icon: "🚴" },
  { type: "swim", label: "Swim", icon: "🏊" },
  { type: "hike", label: "Hike", icon: "🥾" },
];

/** Form-only editor — the live preview lives in PreviewPanel. */
export function ActivityEditor({
  activity,
  onActivityChange,
  variant,
  feedMeta,
  onFeedMetaChange,
}: ActivityEditorProps) {
  const handleSelectedTypeRandomize = () => {
    onActivityChange(generateRandomActivity(activity.type));
  };

  const handleTypeChange = (type: ActivityType) => {
    onActivityChange(generateRandomActivity(type));
  };

  const handleRouteNameChange = (value: string) => {
    onActivityChange(validateActivity({ ...activity, routeName: value }));
  };

  const selectedActivityLabel =
    ACTIVITY_TYPES.find((item) => item.type === activity.type)?.label ?? "Activity";

  return (
    <div className={`${uiCardShell} overflow-hidden`}>
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

        <ActivityFieldsForm activity={activity} onActivityChange={onActivityChange} />

        {variant === "feed" && (
          <FeedMetaForm feedMeta={feedMeta} onFeedMetaChange={onFeedMetaChange} />
        )}
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
