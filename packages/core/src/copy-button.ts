import { anchoredAttrs, anchoredParts } from "./anchored.js";
import type { ComponentContract } from "./contract.js";
import { iconToggleParts } from "./icon-toggle.js";

/** Stable anatomy for the declarative CopyButton enhancer. */
export const copyButtonParts = {
  root: "sk-copy-button",
  icon: "sk-copy-button__icon",
  label: "sk-copy-button__label",
  feedback: "sk-copy-button__feedback",
} as const;

export type CopyButtonPart = keyof typeof copyButtonParts;
export type CopyButtonPartClass = (typeof copyButtonParts)[CopyButtonPart];

export const copyButtonAttrs = {
  root: "data-sk-copy-button",
  target: "data-sk-copy-button-target",
  state: "data-sk-copy-button-state",
  icon: "data-sk-copy-button-icon",
  label: "data-sk-copy-button-label",
  /** The enhancer's handle on the flag: where it writes the anchor name and `data-state`. */
  feedback: "data-sk-copy-button-feedback",
  /** Which of the flag's two sentences a node holds, so the stylesheet can reveal one. */
  feedbackText: "data-sk-copy-button-feedback-text",
  successLabel: "data-sk-copy-button-success-label",
  errorLabel: "data-sk-copy-button-error-label",
  successAriaLabel: "data-sk-copy-button-success-aria-label",
  errorAriaLabel: "data-sk-copy-button-error-aria-label",
} as const;

export type CopyButtonAttr = keyof typeof copyButtonAttrs;
export type CopyButtonAttrName = (typeof copyButtonAttrs)[CopyButtonAttr];

/*
 * COPY BUTTON, the contract — published only now, and the delay is the interesting part.
 *
 * The Vanilla enhancer has shipped for a while and there was no React binding at all, so this could
 * not be a contract: a contract names a React export, G1 checks it exists, and G2 compares the two
 * bindings. One binding is not a contract, it is a script. Writing the missing half is what made the
 * contract possible, not the other way round.
 *
 * The TARGET is an id rather than the text itself, in both bindings, and that is the whole design:
 * what gets copied is whatever is on screen at click time. Passing the string would let the button
 * copy something the reader is not looking at.
 *
 * Both icons are always emitted and Icon Toggle shows one, off `data-sk-copy-button-state`.
 * Authored markup has no runtime to swap an icon with, so neither binding does.
 *
 * THE FEEDBACK FLAG IS NOT A TOOLTIP, and the difference is not cosmetic. A tooltip is opened by the
 * pointer or by focus and has to stay reachable by the pointer (WCAG 1.4.13 hoverable, which is why
 * `tooltip.css` makes its content `pointer-events: auto`). This says what a click just did: it opens
 * off the copy state the button already carries, it must never take the pointer back from the button
 * beside it, and there is nothing in it to read a second time. It is also not announced: `__label`
 * above is already the live region that says this, so the flag is `aria-hidden` and purely visual.
 *
 * WHAT IT DOES BORROW IS THE PLACEMENT, all of it, from the Anclaje pattern (decision 25): the root
 * is also `sk-anchor`, the flag is also `sk-anchored` and asks for `inline-start`, and the arrow is
 * the pattern's own `sk-anchored-arrow`. The browser places both, flips both when the block's edge
 * is close, and hides both when the button scrolls away. A ninth hand-rolled `position: absolute`
 * beside a pattern that nine components already share would be a tenth set of edge cases.
 *
 * Like Popover, this is an anchored box with NO MACHINE: nothing here has to be positioned in JS, so
 * the enhancer's whole job is to write the per-instance anchor name and to say `data-state="open"`.
 * And like Popover, the degraded state is chosen rather than inherited: where the browser has no
 * anchor positioning there is no machine to fall back to, so the flag does not render at all. The
 * icon still swaps and the live region still announces; a flag in the wrong place would say less
 * than no flag.
 *
 * BOTH SENTENCES ARE EMITTED, one per state, and the stylesheet reveals whichever matches: the same
 * trick as the two icons, for the same reason.
 */
export const copyButtonContract = {
  id: "copy-button",
  css: "@skryensya/core/components/copy-button.css",
  parts: copyButtonParts,

  options: {
    /*
     * THE BUTTON'S OWN SET, repeated here rather than inherited, because this root IS a
     * `.sk-button`: the paint comes from that stylesheet and reads these exact attributes. Without
     * them a copy button emitted from a tree could only ever be the default neutral md. Real use in
     * these docs is a `subtle` icon-only one — a fill so the button reads on top of highlighted
     * code, without the base variant's harder border.
     */
    variant: {
      type: "enum",
      values: ["neutral", "subtle", "primary", "danger", "ghost"],
      default: "neutral",
      attr: "data-variant",
    },
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    iconOnly: { type: "boolean", default: false, attr: "data-icon-only", trueValue: "" },
    /** The id of the element whose text is copied, read at click time. */
    target: { type: "string", attr: copyButtonAttrs.target },
    /** What the label says once the text is on the clipboard. */
    successLabel: {
      type: "string",
      default: "Copiado",
      attr: copyButtonAttrs.successLabel,
      /* Read off the DOM by the enhancer, passed as a prop by React, never written back. */
      machineInput: true,
    },
    /** And when it could not be. A silent failure here is a reader pasting nothing. */
    errorLabel: {
      type: "string",
      default: "No se pudo copiar",
      attr: copyButtonAttrs.errorLabel,
      machineInput: true,
    },
  },

  signatures: {
    CopyButton: {
      intent: ["copy-to-clipboard", "copy-a-code-block", "copy-a-token"],
      host: { element: "button" },
      mount: copyButtonAttrs.root,
      options: ["target", "variant", "size", "iconOnly", "successLabel", "errorLabel"],
      slots: {
        /** The resting label. Replaced by the success or error one while the feedback shows. */
        children: { accepts: "text", required: true },
      },
      template: {
        element: "button",
        part: "root",
        /* `sk-anchor` is what the flag measures itself against. It costs nothing until a name is
           written on it: `anchor-name: var(--sk-anchored-name)` with no name is `none`. */
        also: ["sk-button", "sk-interactive", iconToggleParts.root, anchoredParts.anchor],
        host: true,
        attrs: { type: "button" },
        children: [
          {
            element: "span",
            part: "icon",
            attrs: { "aria-hidden": "true", [copyButtonAttrs.icon]: "idle", "data-face": "idle" },
            children: [{ element: "span", attrs: { "data-sk-icon": "copy", "data-sk-icon-size": "md" } }],
          },
          {
            element: "span",
            part: "icon",
            attrs: { "aria-hidden": "true", [copyButtonAttrs.icon]: "copied", "data-face": "copied" },
            children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "md" } }],
          },
          {
            element: "span",
            part: "label",
            mount: copyButtonAttrs.label,
            attrs: { "aria-live": "polite" },
            slot: "children",
          },
          {
            element: "span",
            part: "feedback",
            /* Positioner and painted box are the SAME element, as in Popover: there is one word in
               here, and a wrapper whose only job is to hold a wrapper would be the deeper anatomy. */
            also: [anchoredParts.positioner],
            mount: copyButtonAttrs.feedback,
            attrs: {
              "aria-hidden": "true",
              /* Beside the button, never above it: this one lives at the top-inline-end of a code
                 block, where above is the label bar or nothing at all. `flip-inline` covers the
                 case where the block's own edge is what runs out of room. */
              [anchoredAttrs.placement]: "inline-start",
            },
            children: [
              {
                element: "span",
                attrs: { [copyButtonAttrs.feedbackText]: "copied" },
                textFromOption: "successLabel",
              },
              {
                element: "span",
                attrs: { [copyButtonAttrs.feedbackText]: "error" },
                textFromOption: "errorLabel",
              },
              { element: "span", also: [anchoredParts.arrow], attrs: { "aria-hidden": "true" } },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/copy-button", name: "CopyButton" },
    },
  },
} as const satisfies ComponentContract;
