"use client";

import type { SVGProps } from "react";
import { useSyncExternalStore } from "react";
import { useTheme } from "./ThemeProvider";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  // false during SSR/hydration, true on the client — lint-clean mounted gate.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ml-auto inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FC4C02] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle color theme"
      }
    >
      {!mounted ? (
        <span
          className="inline-block h-5 w-5 shrink-0 rounded-full bg-zinc-400/40"
          aria-hidden
        />
      ) : isDark ? (
        <SunIcon className="h-5 w-5 text-amber-400" aria-hidden />
      ) : (
        <MoonIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" aria-hidden />
      )}
    </button>
  );
}

function SunIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
