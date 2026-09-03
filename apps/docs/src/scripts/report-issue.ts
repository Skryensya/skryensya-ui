/*
 * Appends a browser/viewport line to the "Report an issue" tile's pre-filled GitHub body, the one
 * thing `Base.astro` cannot know at render time. Progressive enhancement over a link that already
 * works without this: server-rendered, it opens GitHub with the page and a bug-report skeleton
 * (expected/actual/repro steps, `footer.reportIssue.body`) already in the textarea; this only adds
 * an `**Environment:**` section under it.
 *
 * THE TEMPLATE IS DATA, NOT TEXT THIS FILE OWNS. `data-sk-report-issue-environment` carries
 * `footer.reportIssue.environment` verbatim, `{ua}`/`{viewport}` placeholders and all, so the
 * copy (and its language) stays entirely in `ui.ts`; this file only fills the two blanks the DOM
 * can answer that a translation string cannot.
 */

function readEnvironmentTemplate(link: HTMLAnchorElement): string | null {
  return link.getAttribute("data-sk-report-issue-environment");
}

export function initReportIssue(): void {
  const link = document.querySelector<HTMLAnchorElement>("[data-sk-report-issue]");
  if (!link) return;

  const template = readEnvironmentTemplate(link);
  if (!template) return;

  const url = new URL(link.href);
  const body = url.searchParams.get("body");
  // No `body` param at all means a hand-edited or third-party link this script has no business
  // rewriting; leave it exactly as authored rather than guessing where an environment line belongs.
  if (body === null) return;

  const environment = template
    .replace("{ua}", navigator.userAgent)
    .replace("{viewport}", `${window.innerWidth}×${window.innerHeight}`);

  url.searchParams.set("body", body + environment);
  link.href = url.toString();
}
