import type { ComponentContract } from "./contract.js";
/*
 * DIALOG, the centred modal box. Behaviour is the platform's (`<dialog>` + showModal());
 * these parts are the authored anatomy the CSS contracts against.
 */
export const dialogParts = {
  root: "sk-dialog",
  header: "sk-dialog__header",
  title: "sk-dialog__title",
  close: "sk-dialog__close",
  body: "sk-dialog__body",
  footer: "sk-dialog__footer",
} as const;

export type DialogPart = keyof typeof dialogParts;
export type DialogPartClass = (typeof dialogParts)[DialogPart];

/*
 * DIALOG: the contract; behaviour that belongs entirely to the browser.
 *
 * No enhancer and no machine, and here that costs nothing: a modal dialog is centred by the platform,
 * so there is no anchor to name and no positioning for the two bindings to disagree about. The
 * consumer calls `showModal()`; the browser owns the top layer, the backdrop, focus trapping and
 * Escape. The system contributes the anatomy, so both bindings are the same markup twice; exactly
 * the reason `Select.native` can be a contract with no enhancer behind it.
 */
export const dialogContract = {
  id: "dialog",
  css: "@skryensya/core/components/dialog.css",
  parts: dialogParts,

  options: {
    /** What the closing control announces. */
    closeLabel: { type: "string", default: "Cerrar", attr: "data-close-label", machineInput: true },
    /**
     * Rendered already open, NON-modally; the platform's own attribute.
     *
     * `showModal()` is a call, not markup, so a composition could never express it; `open` is the
     * part of "is it showing" that authored markup CAN say, and both bindings spell it the same way.
     */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
    /**
     * Opts the SAME `<dialog>` into Dialog Vaul: a block-end sheet below the desktop breakpoint,
     * via `patterns/dialog-vaul.css`. Boolean, not an edge; the pattern only ever slides from
     * `block-end`, so there is nothing else to choose. The attribute is also the Vanilla enhancer's
     * own mount point (`mountVaul`'s `rootSelector` already answers to `[data-sk-dialog-vaul]`), so
     * writing it is what recruits drag-to-dismiss and light-dismiss; a plain Dialog keeps neither.
     */
    vaul: { type: "boolean", default: false, attr: "data-sk-dialog-vaul", trueValue: "" },
    /**
     * Renders as an Alert Dialog: `role="alertdialog"`, `aria-modal` authored explicitly rather
     * than left to the platform's implicit mapping (an explicit `role` overriding `<dialog>`'s own
     * is not guaranteed to keep the implicit value that role would have carried on its own. The
     * same reasoning `aria-atomic` got on Toast), and `aria-describedby` pointing at the body, so
     * the prompt is read together with the name instead of requiring a second Tab press to reach
     * it. For a message needing the user's IMMEDIATE attention (a destructive confirmation, a
     * blocking error) rather than a dialog that merely contains one.
     *
     * Focus is not this option's to give: the platform focuses the dialog's first autofocusable
     * descendant on its own, so putting `autofocus` on the least destructive action (see the
     * confirm demo) is what the pattern actually asks for, and it already works with no option
     * here. An alert dialog only ever differs from a plain one in how it is ANNOUNCED.
     */
    alert: { type: "boolean", default: false, attr: "role", trueValue: "alertdialog" },
  },

  signatures: {
    Dialog: {
      intent: ["modal-dialog", "blocking-confirmation", "focused-task"],
      host: { element: "dialog" },
      options: ["closeLabel", "open", "vaul", "alert"],
      slots: {
        /** Names the dialog. Required: a modal with no title is a box with no reason. */
        title: { accepts: "text", required: true },
        children: { accepts: "node", required: true },
        /** The actions row, when there is one. */
        footer: { accepts: "node" },
      },
      // `body` is the target `alert` describes the root by; both need a name for `wiring` to
      // point one at the other, the same relationship `FormField` fixes between its own nodes.
      wiring: [{ on: "root", attr: "aria-describedby", references: ["body"], whenGiven: "alert" }],
      template: {
        element: "dialog",
        part: "root",
        host: true,
        name: "root",
        // Every other root/label pairing in this codebase does this (Calendar, DatePicker, NavList,
        // CheckboxGroup): without it, an AT with no visible-text fallback announces "dialog", not
        // the title, because `<dialog>` gets no accessible name from a nested heading on its own.
        labelledBySlot: "title",
        /*
         * `data-edge="block-end"` is not a choice here; `dialog-vaul.css` only ever slides from
         * the bottom, which is why `vaul` carries no `edge` option of its own. But the Vanilla
         * enhancer's drag axis is generic (`connectVaul` reads `root.dataset.edge` on ANY panel
         * with a handle, `sk-vaul` or not), and defaults to `inline-start` when it finds nothing.
         * Leaving the attribute off would silently hand a bottom sheet a horizontal drag.
         */
        attrsWhen: [
          { option: "vaul", given: true, attrs: { "data-edge": "block-end" } },
          { option: "alert", given: true, attrs: { "aria-modal": "true" } },
        ],
        children: [
          {
            /*
             * Always drawn when `vaul` is on, never otherwise; the affordance for a gesture that
             * only exists where the enhancer runs. It carries no class of its own: Dialog Vaul is a
             * composition over `sk-dialog` (`patterns/dialog-vaul.css` selects a bare
             * `[data-part="handle"]`), not a second skin with its own parts to keep in step.
             */
            element: "div",
            attrs: { "data-part": "handle", "aria-hidden": "true" },
            whenGiven: "vaul",
          },
          {
            element: "header",
            part: "header",
            children: [
              { element: "h2", part: "title", slot: "title" },
              {
                /* The platform's own close: works with no script, and returns a value. */
                element: "form",
                attrs: { method: "dialog" },
                children: [
                  {
                    element: "button",
                    part: "close",
                    also: ["sk-button", "sk-interactive"],
                    options: ["closeLabel"],
                    optionAttrs: { closeLabel: "aria-label" },
                    attrs: {
                      type: "submit",
                      value: "cancel",
                      "data-icon-only": "",
                      "data-size": "sm",
                      "data-variant": "ghost",
                    },
                    children: [
                      { element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "sm" } },
                    ],
                  },
                ],
              },
            ],
          },
          { element: "div", part: "body", name: "body", slot: "children" },
          {
            /*
             * A FORM, not a <footer>, and `method="dialog"` is the reason. A modal's footer is
             * where the closing actions live, and that method is how the platform closes the dialog
             * and reports WHICH button did it (`returnValue`); no script at all. A plain
             * <footer> would need a click handler per button to do the same thing worse.
             */
            element: "form",
            part: "footer",
            attrs: { method: "dialog" },
            slot: "footer",
            whenGiven: "footer",
          },
        ],
      },
      react: { from: "@skryensya/react/dialog", name: "Dialog" },
    },
  },
} as const satisfies ComponentContract;
