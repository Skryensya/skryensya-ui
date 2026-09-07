import type { ComponentContract } from "./contract.js";
import { anchorPlacements, type AnchorPlacement } from "./anchored.js";

/** El vocabulario de colocación es el del pattern Anclaje (ADR-11); estos son sus alias acá. */
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
 * POPOVER, the contract: the third whose behaviour belongs entirely to the browser.
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
 * `anchor-scope`, so any number of popovers can share it. Structure instead of generation, the
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
    /** The bare surface: no title, no description, no close control. */
    bare: { type: "boolean", default: false, attr: "data-bare", trueValue: "", machineInput: true },
    /** What the closing control says. */
    closeLabel: { type: "string", default: "Cerrar", attr: "data-close-label", machineInput: true },
    /**
     * Passed straight to the trigger's own `data-variant`/`data-size`, the SAME three options
     * `Menu` already publishes for its own trigger (`triggerVariant`/`triggerSize`/
     * `triggerIconOnly`, menu.ts) and the SAME attributes `Button`'s own `variant`/`size`/
     * `iconOnly` write. `button.css`'s existing `[data-variant="…"]`/`[data-size="…"]`/
     * `[data-icon-only]` rules apply to the trigger directly; nothing here repeats their CSS.
     *
     * Untyped (plain string) for the same reason Menu's are: Popover does not own that
     * vocabulary, `Button` does. Without them a Popover composed INTO another control's row
     * (the Editor toolbar's link button being the motivating case) drew a default-variant,
     * default-size trigger next to a row of small ghost icon buttons and read as a stray box.
     */
    triggerVariant: { type: "string", attr: "data-variant" },
    triggerSize: { type: "string", attr: "data-size" },
    /** The icon-only SHAPE: a control-sized square holding one glyph, zero inline padding. Pair it
     *  with a `triggerLabel`, since a trigger with no visible content announces nothing. */
    triggerIconOnly: { type: "boolean", default: false, attr: "data-icon-only", trueValue: "" },
  },

  signatures: {
    Popover: {
      intent: ["popover", "rich-panel-on-a-trigger", "light-dismiss-panel"],
      host: { element: "div" },
      options: ["panelId", "placement", "arrow", "closeLabel", "triggerVariant", "triggerSize", "triggerIconOnly"],
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
      /*
       * The panel's own name and description, the same relationship `Dialog` fixes between its
       * `<dialog>` and its title/body (`dialog.ts`'s own comment): without it, a screen reader
       * focusing or announcing the popover gets nothing from its OWN heading: `popover="auto"`
       * grants no implicit accessible name the way `<dialog>` at least tries to. `labelledBySlot`
       * covers the title half (the emitter finds whichever node renders `title` and points this one
       * at it); `wiring` covers the description half, because that is a plain id reference rather
       * than the slot-to-id primitive `labelledBySlot` already is.
       */
      wiring: [
        { on: "positioner", attr: "aria-describedby", references: ["description"], whenGiven: "description" },
      ],
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
            // Claims the `trigger*` options for ITSELF (each one's own `attr` already says where,
            // so only `panelId` needs the rename below), the same "one option, one element" split
            // `Menu`'s own trigger keeps.
            options: ["panelId", "triggerVariant", "triggerSize", "triggerIconOnly"],
            optionAttrs: { panelId: "popovertarget" },
            slot: "trigger",
          },
          {
            element: "div",
            part: "positioner",
            name: "positioner",
            also: ["sk-popover__content", "sk-anchored"],
            attrs: { popover: "auto" },
            options: ["panelId", "placement"],
            labelledBySlot: "title",
            children: [
              {
                element: "span",
                also: ["sk-anchored-arrow"],
                attrs: { "aria-hidden": "true" },
                whenGiven: "arrow",
              },
              { element: "h2", part: "title", slot: "title", whenGiven: "title" },
              { element: "p", part: "description", name: "description", slot: "description", whenGiven: "description" },
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

    /*
     * THE BARE SURFACE: an anchor and a panel, and nothing the panel does not need.
     *
     * The docs call this one `popup` and its own page says what it is: "superficie flotante mínima
     * para composiciones que no necesitan chrome de Popover". It has no core file and no stylesheet
     * of its own (it imports `popover.css`) because it is not another component, it is this one
     * with less anatomy. A contract of its own would duplicate every part and leave a reader
     * choosing between two names for one thing, which is exactly what a catalogue must not do.
     *
     * Escape and light-dismiss still work: they belong to the platform, not to the chrome.
     */
    "Popover.bare": {
      intent: ["bare-floating-surface", "anchored-panel-without-chrome", "popup"],
      host: { element: "div" },
      options: ["panelId", "placement", "bare", "arrow", "triggerVariant", "triggerSize", "triggerIconOnly"],
      slots: {
        /** What opens it. Carries its own accessible name. */
        trigger: { accepts: "node", required: true },
        /** Whatever the surface holds. Its own semantics are the composition's business. */
        children: { accepts: "node", required: true },
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
            // Claims the `trigger*` options for ITSELF (each one's own `attr` already says where,
            // so only `panelId` needs the rename below), the same "one option, one element" split
            // `Menu`'s own trigger keeps.
            options: ["panelId", "triggerVariant", "triggerSize", "triggerIconOnly"],
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
              { slot: "children" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/popover", name: "Popover" },
    },
  },
} as const satisfies ComponentContract;
