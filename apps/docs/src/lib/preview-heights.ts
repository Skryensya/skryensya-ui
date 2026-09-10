import heights from "@artifacts/preview-heights.json";

/*
 * THE HEIGHT A PREVIEW WILL SETTLE AT, SO THE PAGE CAN RESERVE IT BEFORE IT DOES.
 *
 * Source is `artifacts/preview-heights.json`, written by
 * `packages/ai-gates/scripts/build-preview-heights.ts` from a real browser reading a real
 * production build. It cannot be derived here: a stage is an iframe, an iframe has no content
 * height, and the number only exists once `fitFrame` has measured the document inside it and
 * written it back. Until that lands the stage stands at one global 12rem floor and then snaps, so
 * every preview shorter or taller than 12rem shifts the page under the reader exactly once.
 *
 * Keyed by `[pathname][previewId]`, the same shape and for the same reason as `test-results.ts`: a
 * lookup, not a second list for `*Page.astro` to keep in sync by hand. The id is the one
 * `ComponentPreview.astro` already derives and renders, so nothing new has to be authored to make a
 * preview measurable. It is the id and not the LABEL because a page may print one label twice (the
 * ComponentPreview page documents itself with a preview inside a preview, both called
 * "ComponentPreview"), while the id is deduped per page at render time and cannot collide.
 *
 * A MISS IS NORMAL AND MUST NOT THROW, same as `testStatus`'s: the artifact is a by-hand build step
 * outside `turbo check`, so a fresh checkout has none of it, and a demo added since the last pass
 * has no entry yet. Both fall back to the 12rem floor, which is exactly today's behaviour: the
 * reader gets the jump they already had, never a page that fails to build. The warning is what
 * tells a build which previews are still unmeasured, and it is deliberately one line per preview
 * rather than a count, so the fix (`pnpm --filter @skryensya/ai-gates heights`) has a list to work
 * from.
 */

type Heights = {
  readonly generatedAt: string;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly pages: Readonly<Record<string, Readonly<Record<string, number>>>>;
};

const compiled = heights as unknown as Heights;

/*
 * `/components/avatar/` and `/components/avatar` are the same page, and which one arrives depends
 * on the trailing-slash setting and on whether the page is being served by `astro dev` or read out
 * of a built directory. Normalising both sides is cheaper than making every caller care, and the
 * root path is the one that must survive the trim.
 */
const normalize = (pathname: string): string => {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};

const warned = new Set<string>();

/**
 * The stage's settled height in CSS pixels, or `null` when this preview has never been measured.
 *
 * `null` is the honest answer rather than the 12rem default: the caller reserves nothing, and the
 * stylesheet's own fallback applies, so there is exactly one place that decides what "unmeasured"
 * looks like.
 */
export function previewHeight(pathname: string, previewId: string): number | null {
  const height = compiled.pages[normalize(pathname)]?.[previewId];
  if (typeof height === "number") return height;

  const key = `${normalize(pathname)}::${previewId}`;
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `[docs] preview-heights.json has no entry for "${previewId}" on ${normalize(pathname)}. It keeps ` +
        "the 12rem loading floor and will shift once when it settles. Run " +
        "`pnpm --filter @skryensya/ai-gates heights -- --only <page>`.",
    );
  }
  return null;
}
