import type { ComponentContract } from "./contract.js";

/** Stable anatomy for the declarative CopyButton enhancer. */
export const copyButtonParts = {
  root: "sk-copy-button",
  icon: "sk-copy-button__icon",
  label: "sk-copy-button__label",
} as const;

export type CopyButtonPart = keyof typeof copyButtonParts;
export type CopyButtonPartClass = (typeof copyButtonParts)[CopyButtonPart];

export const copyButtonAttrs = {
  root: "data-sk-copy-button",
  target: "data-sk-copy-button-target",
  state: "data-sk-copy-button-state",
  icon: "data-sk-copy-button-icon",
  label: "data-sk-copy-button-label",
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
 * Both icons are always emitted and the stylesheet shows one, off `data-sk-copy-button-state`.
 * Authored markup has no runtime to swap an icon with, so neither binding does.
 */
export const copyButtonContract = {
  id: "copy-button",
  css: "@skryensya/core/components/copy-button.css",
  parts: copyButtonParts,

  options: {
    /*
     * THE BUTTON'S OWN THREE, repeated here rather than inherited, because this root IS a
     * `.sk-button`: the paint comes from that stylesheet and reads these exact attributes. Without
     * them a copy button emitted from a tree could only ever be the default neutral md, and every
     * real use of it in these docs is a ghost icon-only one.
     */
    variant: {
      type: "enum",
      values: ["neutral", "primary", "danger", "ghost"],
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
        also: ["sk-button", "sk-interactive"],
        host: true,
        attrs: { type: "button" },
        children: [
          {
            element: "span",
            part: "icon",
            attrs: { "aria-hidden": "true", [copyButtonAttrs.icon]: "idle" },
            children: [{ element: "span", attrs: { "data-sk-icon": "copy", "data-sk-icon-size": "md" } }],
          },
          {
            element: "span",
            part: "icon",
            attrs: { "aria-hidden": "true", [copyButtonAttrs.icon]: "copied" },
            children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "md" } }],
          },
          {
            element: "span",
            part: "label",
            mount: copyButtonAttrs.label,
            attrs: { "aria-live": "polite" },
            slot: "children",
          },
        ],
      },
      react: { from: "@skryensya/react/copy-button", name: "CopyButton" },
    },
  },
} as const satisfies ComponentContract;
