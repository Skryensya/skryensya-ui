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
