export type FileUploadChangeDetails = {
  acceptedFiles: File[];
  rejectedFiles: File[];
};

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
