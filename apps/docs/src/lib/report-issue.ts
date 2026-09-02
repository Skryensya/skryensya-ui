/*
 * The "Report an issue" link the docs footer carries on every railed page (`Base.astro`'s footer),
 * which is exactly every component and foundation page: nothing fullBleed (Presets, Templates, the
 * marketing home) loses its rail-less layout for this, and nothing gets a second, page-local copy.
 *
 * GitHub's own `issues/new` form accepts `title`/`body` as query params and pre-fills them from a
 * plain link — no API call, no token, no dependency on this repo publishing issue templates. The
 * reader still reviews and submits on GitHub; this never files anything on their behalf.
 */
const REPO = "Skryensya/skryensya-ui";

export function reportIssueUrl(pageTitle: string, body: string): string {
  const params = new URLSearchParams({
    // `docs:` matches this repo's own commit-type vocabulary (CLAUDE.md), so a triaged issue reads
    // the same shorthand a contributor already uses in a commit message.
    title: `docs: ${pageTitle}`,
    body,
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}
