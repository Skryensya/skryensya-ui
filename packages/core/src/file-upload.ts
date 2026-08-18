import type { ComponentContract } from "./contract.js";

export type FileUploadChangeDetails = {
  acceptedFiles: File[];
  rejectedFiles: File[];
};

/**
 * A rejected file's own reason, in prose, keyed by Zag's own error codes (`@zag-js/file-utils`'
 * `FileError`). Shared here so neither binding invents its own wording, and so a vanilla consumer
 * — the one binding that never renders this contract's markup itself (see the KNOWN GAP note above)
 * — can still turn `sk-file-change`'s `rejectedFiles` into a real sentence without guessing Zag's
 * vocabulary.
 */
export function fileUploadErrorMessage(error: string): string {
  switch (error) {
    case "FILE_TOO_LARGE":
      return "el archivo pesa demasiado";
    case "FILE_TOO_SMALL":
      return "el archivo pesa muy poco";
    case "FILE_INVALID_TYPE":
      return "el tipo de archivo no está permitido";
    case "TOO_MANY_FILES":
      return "hay más archivos de los permitidos";
    case "FILE_EXISTS":
      return "ese archivo ya fue elegido";
    default:
      return "el archivo no es válido";
  }
}

export const fileUploadParts = {
  root: "sk-file-upload",
  label: "sk-file-upload__label",
  dropzone: "sk-file-upload__dropzone",
  input: "sk-file-upload__input",
  trigger: "sk-file-upload__trigger",
  hint: "sk-file-upload__hint",
  itemGroup: "sk-file-upload__item-group",
  item: "sk-file-upload__item",
  itemName: "sk-file-upload__item-name",
  itemSize: "sk-file-upload__item-size",
  itemDelete: "sk-file-upload__item-delete",
  rejection: "sk-file-upload__rejection",
} as const;

export const fileUploadAttrs = {
  root: "data-sk-file-upload",
  label: "data-sk-file-upload-label",
  dropzone: "data-sk-file-upload-dropzone",
  input: "data-sk-file-upload-input",
  trigger: "data-sk-file-upload-trigger",
  itemGroup: "data-sk-file-upload-item-group",
  item: "data-sk-file-upload-item",
  itemDelete: "data-sk-file-upload-item-delete",
} as const;

/**
 * Choosing files: a real `<input type="file">` behind a dropzone you can also click.
 *
 * The input is visually hidden and never replaced; it is what makes the control keyboard-reachable,
 * form-associated and readable by the platform's own file picker. The dropzone is the affordance;
 * the input is the control.
 *
 * KNOWN GAP, and worth naming rather than hiding: the list of CHOSEN files is not in this contract.
 * It is runtime state, and the two bindings meet it differently: React renders the list itself,
 * while the vanilla enhancer patches attributes and never renders markup (decision 8), so a vanilla
 * consumer draws that list. What is published here is the shell, which is what both bindings agree
 * on and all an author writes.
 */
export const fileUploadContract = {
  id: "file-upload",
  css: "@skryensya/core/components/file-upload.css",
  parts: fileUploadParts,

  options: {
    name: { type: "string", attr: "name", machineInput: true },
    /** More than one file at a time. The machine reads it off the input. */
    multiple: { type: "boolean", default: false, attr: "multiple", trueValue: "", machineInput: true },
    /** A filter for the picker, in the `accept` syntax: `image/*`, `.pdf,.docx`. */
    accept: { type: "string", attr: "accept", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "required", trueValue: "", machineInput: true },
    /** Maximum accepted file count. The enhancer reads the shell; React receives the same value. */
    maxFiles: { type: "number", attr: "data-max-files", machineInput: true },
    /** Maximum accepted file size in bytes. */
    maxFileSize: { type: "number", attr: "data-max-file-size", machineInput: true },
  },

  signatures: {
    FileUpload: {
      intent: ["file-upload", "attach-a-file", "dropzone", "choose-files", "browse"],
      host: { element: "div" },
      options: ["name", "multiple", "accept", "disabled", "required", "maxFiles", "maxFileSize"],
      slots: {
        label: { accepts: "text", required: true },
        /** What the dropzone says. It is an instruction, so it is content, not a placeholder. */
        dropzoneLabel: { accepts: "text" },
        triggerLabel: { accepts: "text" },
      },
      mount: "data-sk-file-upload",
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", mount: "data-sk-file-upload-label", slot: "label" },
          /*
           * The dropzone holds the instruction and NOTHING interactive. It is `role="button"` with
           * its own tab stop, and a button containing a focusable descendant is a control nobody can
           * reach past (axe calls it nested-interactive); it was true of both bindings.
           *
           * So the real input and the real trigger are siblings of it. Zag wires them by props, not
           * by nesting, and the input is visually hidden anyway: where it sits in the DOM was never
           * doing any work.
           */
          {
            element: "div",
            part: "dropzone",
            mount: "data-sk-file-upload-dropzone",
            children: [{ element: "span", slot: "dropzoneLabel" }],
          },
          {
            element: "input",
            part: "input",
            mount: "data-sk-file-upload-input",
            options: ["name", "multiple", "accept", "disabled", "required"],
            attrs: { type: "file" },
          },
          {
            element: "button",
            also: ["sk-button", "sk-interactive"],
            mount: "data-sk-file-upload-trigger",
            attrs: { type: "button", "data-variant": "secondary" },
            slot: "triggerLabel",
          },
        ],
      },
      react: { from: "@skryensya/react/file-upload", name: "FileUpload" },
    },
  },
} as const satisfies ComponentContract;
