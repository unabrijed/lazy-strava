"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe (defaults false on the server — mobile-first). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** lg breakpoint — gates inline tap-to-edit on cards (desktop only). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
