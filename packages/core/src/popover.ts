import type { ComponentContract } from "./contract.js";
import { anchorPlacements, type AnchorPlacement } from "./anchored.js";

/** El vocabulario de colocación es el del pattern Anclaje (ADR-25); estos son sus alias acá. */
export type PopoverPlacement = AnchorPlacement;

export const popoverPlacements = anchorPlacements;

export const popoverParts = {
  root: "sk-popover",
  trigger: "sk-popover__trigger",
  positioner: "sk-popover__positioner",
  content: "sk-popover__content",
  title: "sk-popover__title",
  description: "sk-popover__description",
  close: "sk-popover__close",
} as const;

export const popoverAttrs = {
  root: "data-sk-popover",
  trigger: "data-sk-popover-trigger",
  positioner: "data-sk-popover-positioner",
  content: "data-sk-popover-content",
  placement: "data-sk-placement",
} as const;

/*
 * POPOVER, the contract — the third whose behaviour belongs entirely to the browser.
 *
 * No enhancer and no machine: the native Popover API owns light-dismiss, Escape and the top layer,
 * so both bindings are the same markup twice, as with `Select.native` and `Dialog`.
 *
 * ONE ID, TWO SPELLINGS. The trigger's `popovertarget` and the panel's `id` are the same fact,
 * which is what `optionAttrs` exists for: two options for one fact would let an author set them to
 * different values and the popover would simply not open.
 *
 * The anchor NAME is not here, and that took a while to see. Every other anchored component has a
 * binding that writes a unique name inline; this one has no binding to write it and a template
 * cannot, since the name must be unique per instance and a template is the same text every time.
 * The answer was to stop generating names: `popover.css` sets one static name and scopes it with
 * `anchor-scope`, so any number of popovers can share it. Structure instead of generation — the
 * same move that let a split button reach a composed Menu's trigger.
 */
export const popoverContract = {
  id: "popover",
  css: "@skryensya/core/components/popover.css",
  parts: popoverParts,

  options: {
    /** The id that ties the trigger to the panel. Authored, because the platform needs a real id. */
    panelId: {
      type: "string",
      attr: "id",
      /* React spells it `id` and derives the panel's own id and the trigger's target from it. */
      prop: "id",
    },
    /** Which side it opens on. The same four logical sides as every other anchored box. */
    placement: {
      type: "enum",
      values: ["block-start", "block-end", "inline-start", "inline-end"],
      default: "block-end",
      attr: "data-sk-placement",
    },
    /** Draw the small arrow pointing at the trigger. Decorative, never announced. */
    arrow: { type: "boolean", default: false, attr: "data-arrow", trueValue: "", machineInput: true },
    /** What the closing control says. */
    closeLabel: { type: "string", default: "Cerrar", attr: "data-close-label", machineInput: true },
  },

  signatures: {
    Popover: {
      intent: ["popover", "rich-panel-on-a-trigger", "light-dismiss-panel"],
      host: { element: "div" },
      options: ["panelId", "placement", "arrow", "closeLabel"],
      slots: {
        /** What opens it. Carries its own accessible name. */
        trigger: { accepts: "node", required: true },
        /** The panel's body. */
        children: { accepts: "node", required: true },
        /** An optional heading for the panel. */
        title: { accepts: "text" },
        /** A line under the heading. */
        description: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "button",
            part: "trigger",
            also: ["sk-button", "sk-interactive", "sk-anchor"],
            attrs: { type: "button" },
            options: ["panelId"],
            optionAttrs: { panelId: "popovertarget" },
            slot: "trigger",
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-popover__content", "sk-anchored"],
            attrs: { popover: "auto" },
            options: ["panelId", "placement"],
            children: [
              {
                element: "span",
                also: ["sk-anchored-arrow"],
                attrs: { "aria-hidden": "true" },
                whenGiven: "arrow",
              },
              { element: "h2", part: "title", slot: "title", whenGiven: "title" },
              { element: "p", part: "description", slot: "description", whenGiven: "description" },
              { slot: "children" },
              {
                element: "button",
                part: "close",
                also: ["sk-button", "sk-interactive"],
                attrs: { type: "button", popovertargetaction: "hide" },
                options: ["panelId", "closeLabel"],
                optionAttrs: { panelId: "popovertarget", closeLabel: "data-close-label" },
                textFromOption: "closeLabel",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/popover", name: "Popover" },
    },
  },
} as const satisfies ComponentContract;
