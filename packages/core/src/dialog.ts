/*
 * DIALOG, the centred modal box. Behaviour is the platform's (`<dialog>` + showModal());
 * these parts are the authored anatomy the CSS contracts against.
 */
export const dialogParts = {
  root: "ds-dialog",
  header: "ds-dialog__header",
  title: "ds-dialog__title",
  close: "ds-dialog__close",
  body: "ds-dialog__body",
  footer: "ds-dialog__footer",
} as const;

export type DialogPart = keyof typeof dialogParts;
export type DialogPartClass = (typeof dialogParts)[DialogPart];
