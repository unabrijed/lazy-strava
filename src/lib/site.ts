export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lazy-strava.vercel.app");

export const SITE_NAME = "Lazy Strava";
export const SITE_DESCRIPTION =
  "Create realistic Strava-style activity cards for Instagram stories with editable run, ride, swim, and hike stats.";
