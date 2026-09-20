import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE ANATOMY, and the one thing it shows that the real control never does: the dropzone and a
 * chosen file at the same time. Live they coexist too, but only once somebody has picked something,
 * and a diagram cannot wait for that before it can point at a row. So the specimen is frozen with
 * both on screen. The list is runtime state (no usage tree produces it), which is why this stays
 * MARKUP like Menu's: part classes, and no mount attributes that would leave the enhancer fighting
 * static rows.
 *
 * TEN LABELS, AND THE ROOM FOR THEM CAME FROM THE PANEL, not from dropping any of them.
 *
 * Each inline-start/inline-end label takes its gutter out of the subject's own width, and the gutter
 * is set by the LONGEST name on that side. The first attempt here moved some below and cut the rest:
 * the specimen went from 292px to 322px and the diagram lost four parts, which is a bad trade for a
 * drawing whose whole job is naming parts. The width was being left on the floor one level up: every
 * preview in a tab panel is already PLACED on the grid's `breakout` track and then centred, so it
 * shrinks to its content and abandons the track. `width="breakout"` plus the `justify-self` rule in
 * `site.css` hands this diagram the whole track instead.
 *
 * AND THE BLOCK NAME IS SAID ONCE. Every gutter is as wide as the longest label in it, the labels
 * are already at the smallest type this system has, and nine of the ten were repeating the same
 * fourteen characters before their own half: `sk-file-upload__item-preview` reserved 28 characters
 * of margin to add 14 of information. The root pill carries the block and the rest carry
 * `*__element`, where the star stands in for the block named above them: the `__` stays because it
 * is what says "element of", and the star is what says "of the one up there". The width that buys
 * goes to the subject, which is what the drawing is of. `data-for` keeps the full selector, so what
 * each label POINTS AT is unchanged.
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
  ${label(".sk-file-upload__label", "inline-start", "*__label", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__icon", "inline-start", "*__icon", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__trigger", "inline-start", "*__trigger")}
  ${label(".sk-file-upload__tally", "inline-start", "*__tally")}
  ${label(".sk-file-upload__item-preview", "inline-start", "*__item-preview")}
  ${label(".sk-file-upload__item-name", "inline-start", "*__item-name", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__item-size", "inline-start", "*__item-size", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-file-upload__dropzone", "inline-end", "*__dropzone")}
  ${label(".sk-file-upload__instruction", "inline-end", "*__instruction")}
  ${label(".sk-file-upload__hint", "inline-end", "*__hint", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__item-body", "inline-end", "*__item-body", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-file-upload__item-delete", "inline-end", "*__item-delete", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-file-upload__item-group", "block-end", "*__item-group")}
  ${label(".sk-file-upload__item", "block-end", "*__item", ' data-ring-placement="offset" data-ring-distance="2"')}
  <p class="sk-annotated__key">* = sk-file-upload</p>
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const fileUploadAnatomyCss = `.sk-annotated {
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
