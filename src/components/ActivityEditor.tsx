"use client";

import type { ActivityType, StravaActivity } from "@/lib/constants";
import { generateRandomActivity } from "@/lib/randomActivity";
import { StravaCard } from "./StravaCard";
import { ActivityFieldsForm } from "./ActivityFieldsForm";

interface ActivityEditorProps {
  activity: StravaActivity;
  onActivityChange: (activity: StravaActivity) => void;
  statsTheme?: "light" | "dark";
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: string }[] = [
  { type: "run", label: "Run", icon: "🏃" },
  { type: "ride", label: "Ride", icon: "🚴" },
  { type: "swim", label: "Swim", icon: "🏊" },
  { type: "hike", label: "Hike", icon: "🥾" },
];

export function ActivityEditor({ activity, onActivityChange, statsTheme = "light" }: ActivityEditorProps) {
  const handleRandomize = () => {
    onActivityChange(generateRandomActivity(activity.type));
  };

  const handleTypeChange = (type: ActivityType) => {
    onActivityChange(generateRandomActivity(type));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`min-h-[44px] rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors touch-manipulation ${
                activity.type === type
                  ? "bg-[#FC4C02] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-200"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleRandomize}
          className="min-h-[44px] rounded-lg bg-zinc-100 px-4 py-2.5 sm:py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 transition-colors border border-zinc-200 touch-manipulation active:bg-zinc-200"
        >
          🎲 Feeling lazy? Use random
        </button>
      </div>

      <ActivityFieldsForm activity={activity} onActivityChange={onActivityChange} />
      <StravaCard activity={activity} onChange={onActivityChange} theme={statsTheme} />
    </div>
  );
}
