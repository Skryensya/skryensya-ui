import type { ComponentContract } from "./contract.js";

/*
 * DETAILS: the disclosure the platform already has.
 *
 * `<details>`/`<summary>` opens, closes, is keyboard-reachable and is announced, with no script at
 * all. A `name` shared across siblings makes the browser itself keep only one open, which is the
 * whole of what an accordion's coordinator does; this is not a lesser Accordion, it is the same
 * behaviour with a different owner.
 *
 * The difference that decides between them is ANIMATION and CONTROL: `Accordion` runs a machine, so
 * it can transition its panels, report state and be driven from outside. `Details` cannot, and does
 * not need a runtime to work. Choosing is choosing who owns the behaviour, the same question
 * `Select.native` and `DatePicker.native` ask.
 *
 * SHAPE MIRRORS `ExpandableTile`, not a single signature with a `summary` prop: `Details` composes
 * `Details.Summary` and `Details.Content` as children, the same way `ExpandableTile` composes
 * `ExpandableTileTrigger` and `ExpandableTileContent`. A `summary` prop hiding that structure read
 * as more component than the platform actually needed; this way the React binding is close to
 * writing `<details><summary>…</summary>…</details>` by hand, which is the whole point of reaching
 * for the platform's own element instead of a machine.
 */
export const detailsParts = {
  group: "sk-details-group",
  root: "sk-details",
  summary: "sk-details__summary",
  indicator: "sk-details__indicator",
  content: "sk-details__content",
} as const;

export type DetailsPart = keyof typeof detailsParts;
export type DetailsPartClass = (typeof detailsParts)[DetailsPart];

export const detailsContract = {
  id: "details",
  css: "@skryensya/core/components/details.css",
  parts: detailsParts,

  options: {
    /**
     * Siblings sharing a name are exclusive; the browser closes the others itself.
     *
     * This is the whole reason to reach for `<details>` over `Accordion` when nothing needs to be
     * animated or controlled: the exclusivity is the platform's, not a coordinator's.
     */
    name: { type: "string", attr: "name" },
    /**
     * Starts expanded. After that the browser owns it.
     *
     * NOT exercised by the canonical tree, and the reason is unresolved rather than uninteresting:
     * the emitted markup carries `open` and React's `<details open>` came out closed, with no
     * warning logged and with every other option on the same node arriving fine. Left out of the
     * fixture so the gate is not green over a divergence; the option is real and the bindings
     * disagree about it, which is worth chasing with fresh eyes.
     */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
  },

  signatures: {
    DetailsGroup: {
      intent: ["faq-without-javascript", "exclusive-disclosures", "no-runtime-accordion"],
      host: { element: "section" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Details"], required: true } },
      template: { element: "section", part: "group", host: true, slot: "children" },
      react: { from: "@skryensya/react/details", name: "DetailsGroup" },
    },

    Details: {
      intent: ["one-disclosure", "expandable-section", "no-javascript"],
      host: { element: "details" },
      parents: ["DetailsGroup"],
      options: ["name", "open"],
      slots: {
        children: {
          accepts: "signature",
          of: ["Details.Summary", "Details.Content"],
          required: true,
          ordered: true,
          cardinality: { "Details.Summary": "one", "Details.Content": "one" },
        },
      },
      template: { element: "details", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/details", name: "Details" },
    },

    "Details.Summary": {
      intent: ["disclosure-trigger", "what-the-closed-state-shows"],
      host: { element: "summary" },
      parents: ["Details"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "summary",
        part: "summary",
        also: ["sk-interactive"],
        host: true,
        children: [
          { slot: "children" },
          /*
           * The disclosure mark, BAKED IN rather than composed; unlike `Accordion.Trigger`, which
           * leaves `TileChevron` to the author. `<summary>` already suppresses the browser's own
           * triangle (`list-style: none`, `.sk-details__summary::marker { content: "" }`), so an
           * instance with nothing composed here would lose the affordance WCAG expects a disclosure
           * to have, not just look plain. `details.css` already carried the swap rules for
           * `sk-details__indicator` before any template painted it.
           *
           * Two icons, never a rotated one, same rule `TileChevron`'s own comment states: the set
           * supplies chevron-down and chevron-up, and `[open]` on the ancestor `<details>` is what
           * CSS keys the swap on; no JS, because the platform already owns `open` here.
           */
          {
            element: "span",
            part: "indicator",
            attrs: { "aria-hidden": "true" },
            children: [
              {
                element: "span",
                attrs: { "data-state": "closed" },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } },
                ],
              },
              {
                element: "span",
                attrs: { "data-state": "open" },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "chevron-up", "data-sk-icon-size": "md" } },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/details", name: "Details.Summary" },
    },

    "Details.Content": {
      intent: ["disclosure-body", "what-opening-reveals"],
      host: { element: "div" },
      parents: ["Details"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "content", host: true, slot: "children" },
      react: { from: "@skryensya/react/details", name: "Details.Content" },
    },
  },
} as const satisfies ComponentContract;
