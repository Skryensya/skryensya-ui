import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureHtml } from "./annotation-parts";

/*
 * THE ANATOMY, and the one thing it shows that the real control never does: the dropzone and a
 * chosen file at the same time. Live they coexist too, but only once somebody has picked something,
 * and a diagram cannot wait for that before it can point at a row. So the specimen is frozen with
 * both on screen. The list is runtime state (no usage tree produces it), which is why this stays
 * MARKUP like Menu's: part classes, and no mount attributes that would leave the enhancer fighting
 * static rows.
 *
 * FIFTEEN PARTS, AND THE MARGINS HOLD ONLY THEIR NUMBERS. This diagram is the one that used to
 * say its block name once in a key and abbreviate every label to `*__element`, because fifteen
 * names in the gutters squeezed the specimen to 292px. The names live in the legend now, where
 * they wrap instead of costing the drawing its width, so each one is spelled out whole.
 */
const fileUploadAnatomySpecimen = (t: Translate): string => `<div class="sk-file-upload">
  <label class="sk-file-upload__label">${t("demo.fileUpload.label")}</label>
  <div class="sk-file-upload__dropzone" role="button" tabindex="0">
    <span class="sk-file-upload__icon" aria-hidden="true">
      <span data-sk-icon="upload" data-sk-icon-size="lg"></span>
    </span>
    <span class="sk-file-upload__instruction">${t("demo.fileUpload.dropzone")}</span>
    <p class="sk-file-upload__hint">${t("demo.fileUpload.anatomyHint")}</p>
  </div>
  <button class="sk-file-upload__trigger sk-button sk-interactive" type="button">${t("demo.fileUpload.trigger")}</button>
  <p class="sk-file-upload__tally">1 archivo · 128 kB</p>
  <ul class="sk-file-upload__item-group">
    <li class="sk-file-upload__item">
      <span class="sk-file-upload__item-preview" aria-hidden="true">
        <span data-sk-icon="file" data-sk-icon-size="md"></span>
      </span>
      <span class="sk-file-upload__item-body">
        <span class="sk-file-upload__item-name">${t("demo.fileUpload.anatomyItem")}</span>
        <span class="sk-file-upload__item-size">
          <span class="sk-file-upload__item-kind">PDF</span> · 128 kB
        </span>
      </span>
      <button
        class="sk-file-upload__item-delete sk-button sk-interactive"
        data-variant="ghost"
        data-size="sm"
        data-icon-only
        type="button"
        tabindex="-1"
        aria-label="${t("demo.fileUpload.anatomyRemove")}"
      >
        <span data-sk-icon="close" data-sk-icon-size="sm" aria-hidden="true"></span>
      </button>
    </li>
  </ul>
</div>`;


export const fileUploadAnatomyHtml = (t: Translate): string => anatomyFigureHtml(t, {
  label: t("fileUploadPage.anatomyLabel"),
  specimen: fileUploadAnatomySpecimen(t),
  parts: [
    { for: ".sk-file-upload", side: "block-start", mark: "bracket" },
    { for: ".sk-file-upload__label", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-file-upload__icon", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-file-upload__trigger", side: "inline-start" },
    { for: ".sk-file-upload__tally", side: "inline-start" },
    { for: ".sk-file-upload__item-preview", side: "inline-start" },
    { for: ".sk-file-upload__item-name", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-file-upload__item-size", side: "inline-start", ringPlacement: "offset", ringDistance: 4 },
    { for: ".sk-file-upload__dropzone", side: "inline-end" },
    { for: ".sk-file-upload__instruction", side: "inline-end" },
    { for: ".sk-file-upload__hint", side: "inline-end", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-file-upload__item-body", side: "inline-end", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-file-upload__item-delete", side: "inline-end", ringPlacement: "offset", ringDistance: 4 },
    { for: ".sk-file-upload__item-group", side: "block-end" },
    { for: ".sk-file-upload__item", side: "block-end", ringPlacement: "offset", ringDistance: 2 },
  ],
});

export const fileUploadAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-file-upload {
  /*
   * A WIDTH OF ITS OWN, not a percentage. Annotated sizes its middle track TO the specimen
   * (grid-template-columns: auto minmax(0, auto) auto), so a percentage here resolves against the
   * room the gutters happen to leave and the subject can only ever get the remainder: measured at
   * 292px inside a 756px frame, and still 322px once the frame grew to 976. Asking for a real width
   * makes the track that wide and the gutters take what is left, which is the right way round for a
   * diagram whose subject is the point.
   */
  inline-size: 30rem;
  max-inline-size: 100%;
}`;

/** The authored upload shell: label, drop target, native input and its explicit trigger. */
/*
 * REAL LIMITS ON THE DEMO, and no `hintLabel`: the line under the instruction is built from these
 * four numbers, so what the page promises and what the control enforces are the same thing. Change
 * `maxFileSize` here and the sentence in the preview changes with it.
 */
export const fileUploadTree = (t: Translate): UsageTree => ({
  contract: "file-upload",
  signature: "FileUpload",
  options: {
    accept: "image/*,.pdf",
    maxFiles: 3,
    maxFileSize: 5_000_000,
    maxTotalSize: 10_000_000,
    multiple: true,
    name: "attachments",
  },
  slots: {
    dropzoneLabel: t("demo.fileUpload.dropzone"),
    label: t("demo.fileUpload.label"),
    triggerLabel: t("demo.fileUpload.trigger"),
  },
});

/*
 * DROPPING ANYWHERE, not only on the dashed box.
 *
 * Live rather than a code block, and the preview frame is not a simplification: the frame IS a
 * document, so `dropScope: "page"` reaches exactly as far as the preview's own edge. Drag a file
 * over it and the overlay appears over the demo, not over the documentation site around it.
 */
export const fileUploadPageDropTree = (t: Translate): UsageTree => ({
  contract: "file-upload",
  signature: "FileUpload",
  options: {
    accept: "image/*,.pdf",
    dropScope: "page",
    maxFileSize: 5_000_000,
    multiple: true,
    name: "attachments",
  },
  slots: {
    label: t("demo.fileUpload.label"),
    dropzoneLabel: t("demo.fileUpload.dropzone"),
    overlayLabel: t("demo.fileUpload.overlay"),
    triggerLabel: t("demo.fileUpload.trigger"),
  },
});
