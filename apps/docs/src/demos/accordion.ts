import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The three accordions on the page, from one composition written once.
 *
 * Each trigger is `TileContent` (title over description) plus `TileChevron` (the disclosure mark).
 * Both were blocked until recently — the chevron was a declared part no template painted, so every
 * demo hand-wrote the same nine lines twice, as an HTML string and as JSX, and they had already
 * drifted: the authored HTML carried `data-part="chevron"` and the React half did not.
 *
 * ONE THING IS LOST IN THE MOVE, deliberately. The body paragraphs used to wrap a path in `<code>`
 * ("el healthcheck pega a /status"). There is no inline-code signature in `typography` — no part, no
 * React export, no CSS rule — so emitting one would mean publishing a new component in the middle of
 * a page conversion. The sentences keep their words and lose the monospace; the gap is filed rather
 * than papered over with `Strong`, which would be the wrong semantics for a path.
 */

/** One section: the trigger's copy and mark, then the body. */
const item = (t: Translate, value: string): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: { value },
  children: [
    {
      contract: "accordion",
      signature: "Accordion.Trigger",
      children: [
        {
          contract: "tile",
          signature: "TileContent",
          slots: {
            title: t(`demo.accordion.${value}.title` as never),
            description: t(`demo.accordion.${value}.description` as never),
          },
        },
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    {
      contract: "accordion",
      signature: "Accordion.Content",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t(`demo.accordion.${value}.p1` as never),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t(`demo.accordion.${value}.p2` as never),
            },
          ],
        },
      ],
    },
  ],
});

const deployment = ["runtime", "rollout", "rollback"];

/** One section on its own: the smallest thing an accordion can be. */
export const accordionSingleTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "Accordion",
  options: { type: "single", collapsible: true },
  children: [item(t, "environment")],
});

/** Three sections, one open at a time — what `type: "single"` buys. */
export const accordionExclusiveTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "Accordion",
  options: { type: "single", collapsible: true },
  children: deployment.map((value) => item(t, value)),
});

/** The same three, any number open at once. */
export const accordionMultipleTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "Accordion",
  options: { type: "multiple" },
  children: deployment.map((value) => item(t, value)),
});
