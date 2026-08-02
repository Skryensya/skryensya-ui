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
 * The runtime section's second paragraph names a path, and it is `Code` — a signature that did not
 * exist when this file was first written. Converting the page had to drop the monospace because
 * `typography` had no inline-code part at all; publishing one is what let the sentence come back
 * whole. `Strong` was the nearest thing available and it is the wrong claim: a path is not emphasis.
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
              children:
                value === "runtime"
                  ? [
                      t("demo.accordion.runtime.p2a"),
                      {
                        contract: "typography",
                        signature: "Code",
                        children: t("demo.accordion.runtime.p2code"),
                      },
                      t("demo.accordion.runtime.p2b"),
                    ]
                  : t(`demo.accordion.${value}.p2` as never),
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

/*
 * THE PLATFORM'S OWN VERSION, for the same three sections.
 *
 * Siblings sharing a `name` make the BROWSER keep one open, which is what the coordinator above
 * does with a machine. Putting them side by side is the page's whole argument: the choice is not
 * about capability, it is about who owns the behaviour — and `<details>` cannot animate its panel
 * or be driven from outside, which is the entire difference.
 *
 * The chevron is not here. `TileChevron` belongs to a tile's trigger, and a `<summary>` is not
 * one; the marker `<details>` draws itself is the platform's and needs no markup.
 */
export const detailsGroupTree = (t: Translate): UsageTree => ({
  contract: "details",
  signature: "DetailsGroup",
  attrs: { "aria-label": t("demo.accordion.detailsLabel") },
  children: deployment.map((value, i) => ({
    contract: "details",
    signature: "Details",
    options: { name: "deployment", ...(i === 0 ? { open: true } : {}) },
    slots: {
      summary: {
        contract: "tile",
        signature: "TileContent",
        slots: {
          title: t(`demo.accordion.${value}.title` as never),
          description: t(`demo.accordion.${value}.description` as never),
        },
      },
      children: {
        contract: "typography",
        signature: "Text",
        options: { tone: "secondary" },
        children: t(`demo.accordion.${value}.p1` as never),
      },
    },
  })),
});
