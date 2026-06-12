"use client";

import type { FeedMeta } from "@/lib/constants";
import { randomFeedMeta } from "@/lib/randomActivity";
import { uiFieldLabel, uiInput, uiSectionLabel } from "@/lib/ui";

interface FeedMetaFormProps {
  feedMeta: FeedMeta;
  onFeedMetaChange: (meta: FeedMeta) => void;
}

/** Feed-post details — only rendered when the feed variant is selected. */
export function FeedMetaForm({ feedMeta, onFeedMetaChange }: FeedMetaFormProps) {
  const update = (patch: Partial<FeedMeta>) => onFeedMetaChange({ ...feedMeta, ...patch });

  return (
    <section aria-labelledby="feed-details-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id="feed-details-heading" className={uiSectionLabel}>
          Feed details
        </h3>
        <button
          type="button"
          onClick={() => onFeedMetaChange(randomFeedMeta())}
          className="text-xs font-semibold text-[#FC4C02] hover:underline"
        >
          Randomize
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="feed-athlete" className={uiFieldLabel}>
            Athlete name
          </label>
          <input
            id="feed-athlete"
            type="text"
            value={feedMeta.athleteName}
            onChange={(e) => update({ athleteName: e.target.value })}
            placeholder="Alex Runner"
            className={uiInput}
          />
        </div>
        <div>
          <label htmlFor="feed-avatar" className={uiFieldLabel}>
            Avatar emoji (optional)
          </label>
          <input
            id="feed-avatar"
            type="text"
            value={feedMeta.avatarEmoji ?? ""}
            onChange={(e) => update({ avatarEmoji: e.target.value.slice(0, 4) })}
            placeholder="🏃"
            className={uiInput}
          />
        </div>
        <div>
          <label htmlFor="feed-location" className={uiFieldLabel}>
            Location
          </label>
          <input
            id="feed-location"
            type="text"
            value={feedMeta.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="Riverside Park"
            className={uiInput}
          />
        </div>
        <div>
          <label htmlFor="feed-time" className={uiFieldLabel}>
            Start time
          </label>
          <input
            id="feed-time"
            type="time"
            value={feedMeta.activityTime}
            onChange={(e) => update({ activityTime: e.target.value })}
            className={uiInput}
          />
        </div>
        <div>
          <label htmlFor="feed-kudos" className={uiFieldLabel}>
            Kudos
          </label>
          <input
            id="feed-kudos"
            type="number"
            min="0"
            value={feedMeta.kudosCount}
            onChange={(e) =>
              update({ kudosCount: Math.max(0, parseInt(e.target.value, 10) || 0) })
            }
            className={uiInput}
          />
        </div>
        <div>
          <label htmlFor="feed-achievements" className={uiFieldLabel}>
            Achievements
          </label>
          <input
            id="feed-achievements"
            type="number"
            min="0"
            max="99"
            value={feedMeta.achievementCount}
            onChange={(e) =>
              update({ achievementCount: Math.max(0, parseInt(e.target.value, 10) || 0) })
            }
            className={uiInput}
          />
        </div>
      </div>
    </section>
  );
}
