import type { ComponentContract } from "./contract.js";

/*
 * DETAILS — the disclosure the platform already has.
 *
 * `<details>`/`<summary>` opens, closes, is keyboard-reachable and is announced, with no script at
 * all. A `name` shared across siblings makes the browser itself keep only one open, which is the
 * whole of what an accordion's coordinator does — so this is not a lesser Accordion, it is the same
 * behaviour with a different owner.
 *
 * The difference that decides between them is ANIMATION and CONTROL: `Accordion` runs a machine, so
 * it can transition its panels, report state and be driven from outside. `Details` cannot, and does
 * not need a runtime to work. Choosing is choosing who owns the behaviour, the same question
 * `Select.native` and `DatePicker.native` ask.
 */
export const detailsParts = {
  group: "sk-details-group",
  root: "sk-details",
  summary: "sk-details__summary",
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
     * Siblings sharing a name are exclusive — the browser closes the others itself.
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
        /** What the closed state shows and what opens it. */
        summary: { accepts: "node", required: true },
        /** What opening reveals. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "details",
        part: "root",
        host: true,
        children: [
          {
            element: "summary",
            part: "summary",
            also: ["sk-interactive"],
            slot: "summary",
          },
          { element: "div", part: "content", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/details", name: "Details" },
    },
  },
} as const satisfies ComponentContract;
