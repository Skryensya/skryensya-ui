import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE ANATOMY: hint and the chosen-file list are not in the contract template (they are runtime
 * state React draws / a vanilla consumer authors). A usage tree of FileUpload alone cannot show
 * them, so this specimen is MARKUP like Menu's: part classes, no mount attributes that would leave
 * the enhancer fighting static rows, and every labelled part already on screen.
 */
const fileUploadAnatomySpecimen = (t: Translate): string => `<div class="sk-file-upload">
  <label class="sk-file-upload__label">${t("demo.fileUpload.label")}</label>
  <div class="sk-file-upload__dropzone" role="button" tabindex="0">
    <span>${t("demo.fileUpload.dropzone")}</span>
  </div>
  <p class="sk-file-upload__hint">${t("demo.fileUpload.anatomyHint")}</p>
  <button class="sk-button sk-interactive" type="button">${t("demo.fileUpload.trigger")}</button>
  <ul class="sk-file-upload__item-group">
    <li class="sk-file-upload__item">
      <span class="sk-file-upload__item-name">${t("demo.fileUpload.anatomyItem")}</span>
      <span class="sk-file-upload__item-size">128 KB</span>
    </li>
  </ul>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const fileUploadAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("fileUploadPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${fileUploadAnatomySpecimen(t)}
  </div>
  ${label(".sk-file-upload", "block-start", "sk-file-upload")}
  ${label(".sk-file-upload__label", "inline-start", "sk-file-upload__label", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__dropzone", "inline-end", "sk-file-upload__dropzone")}
  ${label(".sk-file-upload__hint", "inline-end", "sk-file-upload__hint", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__item-group", "block-end", "sk-file-upload__item-group")}
  ${label(".sk-file-upload__item", "block-end", "sk-file-upload__item", ' data-ring-placement="offset" data-ring-distance="2"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const fileUploadAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-file-upload {
  inline-size: min(100%, 22rem);
}`;

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
