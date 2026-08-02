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
 * DIALOG, the contract — behaviour that belongs entirely to the browser.
 *
 * No enhancer and no machine, and here that costs nothing: a modal dialog is centred by the platform,
 * so there is no anchor to name and no positioning for the two bindings to disagree about. The
 * consumer calls `showModal()`; the browser owns the top layer, the backdrop, focus trapping and
 * Escape. The system contributes the anatomy, so both bindings are the same markup twice — exactly
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
     * Rendered already open, NON-modally — the platform's own attribute.
     *
     * `showModal()` is a call, not markup, so a composition could never express it; `open` is the
     * part of "is it showing" that authored markup CAN say, and both bindings spell it the same way.
     */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
  },

  signatures: {
    Dialog: {
      intent: ["modal-dialog", "blocking-confirmation", "focused-task"],
      host: { element: "dialog" },
      options: ["closeLabel", "open"],
      slots: {
        /** Names the dialog. Required: a modal with no title is a box with no reason. */
        title: { accepts: "text", required: true },
        children: { accepts: "node", required: true },
        /** The actions row, when there is one. */
        footer: { accepts: "node" },
      },
      template: {
        element: "dialog",
        part: "root",
        host: true,
        children: [
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
          { element: "div", part: "body", slot: "children" },
          {
            /*
             * A FORM, not a <footer>, and `method="dialog"` is the reason. A modal's footer is
             * where the closing actions live, and that method is how the platform closes the dialog
             * and reports WHICH button did it — `returnValue` — with no script at all. A plain
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
