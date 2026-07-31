import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** The authored upload shell: label, drop target, native input and its explicit trigger. */
export const fileUploadTree = (t: Translate): UsageTree => ({
  contract: "file-upload",
  signature: "FileUpload",
  options: {
    maxFiles: 3,
    multiple: true,
    name: "attachments",
  },
  slots: {
    dropzoneLabel: t("demo.fileUpload.dropzone"),
    label: t("demo.fileUpload.label"),
    triggerLabel: t("demo.fileUpload.trigger"),
  },
});
