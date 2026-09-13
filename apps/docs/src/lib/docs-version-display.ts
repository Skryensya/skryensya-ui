/*
 * HOW THE DOCS NAME VERSIONS IN THE CHROME.
 *
 * Docs cuts land on majors (VERSIONED_DOCS_PLAN). The footer still prints the full tip
 * (`0.0.1-dev`, later `1.2.0`) because that is what a consumer pins against. The header and the
 * version selector speak in majors (`v0`, `v1`): that is the unit a reader switches between. Each
 * selector row still discloses the latest minor of that major so the mapping is visible without
 * stuffing the full string into the trigger.
 *
 * Pure helpers only: page code wires them to `releaseLedger()` so this file stays testable
 * without Vite's `@artifacts` alias.
 */

/** Same tip the footer prints: newest published release, or `<working>-dev` while nothing shipped. */
export function tipFromLedger(ledger: {
  readonly working: string;
  readonly releases: readonly { readonly version: string }[];
}): string {
  return ledger.releases.length > 0 ? ledger.releases[0]!.version : `${ledger.working}-dev`;
}

/** `0.0.1-dev` → `0`, `1.2.0` → `1`. The major is the docs switcher unit. */
export function majorOf(version: string): string {
  const core = version.split("-", 1)[0] ?? version;
  return core.split(".", 1)[0] ?? core;
}

/**
 * Newest first. Numbers as numbers (`0.10` > `0.9`); a finished release above its own prerelease
 * (`0.0.1` > `0.0.1-dev`).
 */
export function compareVersions(a: string, b: string): number {
  const parse = (version: string) => {
    const [core = "", prerelease = ""] = version.split("-", 2);
    const parts = core.split(".").map(Number);
    return { parts: [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0], prerelease };
  };
  const left = parse(a);
  const right = parse(b);
  for (let i = 0; i < 3; i += 1) {
    if (left.parts[i] !== right.parts[i]) return right.parts[i]! - left.parts[i]!;
  }
  if (left.prerelease === right.prerelease) return 0;
  if (left.prerelease === "") return -1;
  if (right.prerelease === "") return 1;
  return right.prerelease.localeCompare(left.prerelease);
}

export type DocsMajorLine = {
  /** Major segment only (`0`, `1`). */
  readonly major: string;
  /** Newest full version under that major (`0.0.1-dev`, `1.2.0`). */
  readonly latest: string;
  /** True when this major is the one the live site belongs to. */
  readonly isCurrent: boolean;
};

/**
 * One row per major present in the ledger (plus the live tip), newest major first.
 * Until archives mount on the CDN this list is usually a single current major: still useful,
 * because the selector can show `v0` up top and `0.0.1-dev` as that major's tip.
 *
 * "Current" is the major of `working` (the tree being edited), not necessarily the major of the
 * last published release the footer pins: those can diverge the day a new major opens.
 */
export function majorLinesFromLedger(ledger: {
  readonly working: string;
  readonly releases: readonly { readonly version: string }[];
}): readonly DocsMajorLine[] {
  const tip = tipFromLedger(ledger);
  const versions = new Set<string>([tip, `${ledger.working}-dev`]);
  for (const release of ledger.releases) versions.add(release.version);

  const latestByMajor = new Map<string, string>();
  for (const version of versions) {
    const major = majorOf(version);
    const previous = latestByMajor.get(major);
    if (previous === undefined || compareVersions(version, previous) < 0) {
      latestByMajor.set(major, version);
    }
  }

  const currentMajor = majorOf(ledger.working);
  return [...latestByMajor.entries()]
    .map(([major, latest]) => ({
      major,
      latest,
      isCurrent: major === currentMajor,
    }))
    .sort((a, b) => compareVersions(a.latest, b.latest));
}
