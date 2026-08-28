/**
 * `runId` IS the timestamp: `evals/agent/report.ts` names each run folder
 * `new Date().toISOString().replaceAll(/[:.]/g, "-")` (filesystem-safe), e.g.
 * `2026-08-24T20-53-07-521Z`. Reversing that substitution is the only parsing this needs  -  no
 * separate `runDate` field to keep in sync with the folder name that already carries it.
 */
export function parseRunId(runId: string): Date {
  return new Date(runId.replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, "T$1:$2:$3.$4Z"));
}

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

/** "3h ago", "in 2 days" (never expected here, but `numeric: "auto"` covers it)  -  English-only, like the eval corpus itself. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const deltaSeconds = (date.getTime() - now.getTime()) / 1000;
  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(deltaSeconds) >= secondsInUnit || unit === "second") {
      return relativeTimeFormat.format(Math.round(deltaSeconds / secondsInUnit), unit);
    }
  }
  return relativeTimeFormat.format(0, "second");
}
