import type { ComponentContract } from "./contract.js";

export type FileUploadChangeDetails = {
  acceptedFiles: File[];
  rejectedFiles: File[];
};

/**
 * The limits a control enforces, in one place, because three different things read them: the machine
 * (which rejects), the hint (which warns first) and the rejection message (which explains after).
 * Those three drifting apart is how a form ends up promising 10 MB, rejecting at 5 and saying only
 * "invalid file".
 */
export type FileUploadLimits = {
  /** `accept` syntax, exactly as the input attribute takes it: `image/*`, `.pdf,.docx`. */
  readonly accept?: string;
  readonly maxFiles?: number;
  readonly maxFileSize?: number;
  readonly minFileSize?: number;
  /** Across every chosen file together. The machine has no such rule; `maxTotalSizeValidator` adds it. */
  readonly maxTotalSize?: number;
  /** Only changes the wording: "hasta 5 MB" against "hasta 5 MB cada uno". */
  readonly multiple?: boolean;
};

/**
 * Bytes as a person reads them.
 *
 * DECIMAL UNITS (1 kB = 1000 B), not binary, because that is what a file manager shows and this
 * number exists to be compared with one. One decimal place at most, and none when it would read as
 * ".0": "4,2 MB" and "5 MB", never "5,0 MB".
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "kB", "MB", "GB"] as const;
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1).replace(".", ",")} ${units[unit]}`;
}

/**
 * `accept` as a reader would say it: "PNG, JPEG o PDF", "imágenes", "imágenes o PDF".
 *
 * The attribute's own syntax is three different things at once (a wildcard group, a MIME type, an
 * extension) and none of them is a word anybody says out loud. A group becomes its noun, a MIME type
 * becomes its subtype in caps, an extension drops its dot. Duplicates collapse: `image/jpeg,.jpg`
 * is one kind of file written twice.
 */
export function describeAccept(accept: string): string {
  const groups: Record<string, string> = {
    image: "imágenes",
    video: "videos",
    audio: "audios",
    text: "archivos de texto",
  };
  const names: string[] = [];
  for (const raw of accept.split(",")) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;
    const wildcard = /^([a-z]+)\/\*$/.exec(token);
    const name = wildcard
      ? (groups[wildcard[1]!] ?? `archivos ${wildcard[1]}`)
      : token.startsWith(".")
        ? token.slice(1).toUpperCase()
        : (token.split("/")[1] ?? token).toUpperCase();
    if (!names.includes(name)) names.push(name);
  }
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  return `${names.slice(0, -1).join(", ")} o ${names.at(-1)}`;
}

/**
 * What this control takes, as a sentence: "Imágenes o PDF, hasta 5 MB cada uno".
 *
 * TWO FACTS, NOT FOUR. This used to state every limit at once, dot-separated: "imágenes o PDF ·
 * hasta 5 MB · 10 MB en total · máximo 3 archivos". Read it as a person about to attach something
 * and the problems are plain. Nothing says which size is per file and which is the sum, so the two
 * numbers sit next to each other daring you to work it out. The dots make four facts equally
 * important, so none of them is. And half of it cannot be acted on yet: how many files fit and how
 * much weight is left are questions you have WHILE choosing, and a fixed number never answers the
 * one you actually ask, which is how much is left.
 *
 * So this says the two things that are true before you pick anything, and `fileUploadTallyLabel`
 * says the other two once there is something to count.
 */
export function fileUploadLimitsLabel(limits: FileUploadLimits): string {
  const kinds = limits.accept ? describeAccept(limits.accept) : "";
  const perFile =
    limits.maxFileSize && Number.isFinite(limits.maxFileSize)
      ? `hasta ${formatFileSize(limits.maxFileSize)}${limits.multiple ? " cada uno" : ""}`
      : "";
  const floor = limits.minFileSize ? `desde ${formatFileSize(limits.minFileSize)}` : "";
  const size = [floor, perFile].filter(Boolean).join(", ");
  if (!kinds) return size ? `${size.charAt(0).toUpperCase()}${size.slice(1)}` : "";
  return size ? `${kinds.charAt(0).toUpperCase()}${kinds.slice(1)}, ${size}` : `${kinds.charAt(0).toUpperCase()}${kinds.slice(1)}`;
}

/**
 * Where the choosing stands: "2 de 3 archivos · 3,4 de 10 MB".
 *
 * THE COUNT AND THE TOTAL BELONG HERE, not in the line above the picker, because they are state and
 * not rules. "Máximo 3 archivos" is a fact about the form; "2 de 3" is a fact about YOU, it moves as
 * you work, and it answers the question the static version could not: how much is left. Shown only
 * once something has been chosen, since "0 de 3" before you start is noise.
 *
 * Each half appears only when it says something. With no `maxFiles` the count is just a count, and
 * with no `maxTotalSize` the weight is just the weight, which is still worth seeing beside a list of
 * files you are about to send.
 */
export function fileUploadTallyLabel(
  files: readonly File[],
  limits: FileUploadLimits = {},
): string {
  if (files.length === 0) return "";
  const { maxFiles, maxTotalSize } = limits;
  const noun = files.length === 1 ? "archivo" : "archivos";
  const count =
    maxFiles && Number.isFinite(maxFiles) && maxFiles > 1
      ? `${files.length} de ${maxFiles} ${noun}`
      : `${files.length} ${noun}`;
  const bytes = files.reduce((sum, file) => sum + file.size, 0);
  /* "3,4 de 10 MB", not "3,4 MB de 10 MB": when both numbers land on the same unit, saying it twice
     is the kind of repetition that makes a short line read long. Different units keep both. */
  const weight = (() => {
    const used = formatFileSize(bytes);
    if (!maxTotalSize || !Number.isFinite(maxTotalSize)) return used;
    const cap = formatFileSize(maxTotalSize);
    const unit = cap.slice(cap.indexOf(" "));
    return `${used.endsWith(unit) ? used.slice(0, -unit.length) : used} de ${cap}`;
  })();
  return `${count} · ${weight}`;
}

/**
 * A rejected file's own reason, in prose, keyed by Zag's own error codes (`@zag-js/file-utils`'
 * `FileError`) plus the one this kit adds. Shared here so neither binding invents its own wording,
 * and so a vanilla consumer can turn `sk:fileuploadchange`'s `rejectedFiles` into a real sentence
 * without guessing Zag's vocabulary.
 *
 * WITH THE LIMIT IN IT when the caller knows the limit. "Pesa demasiado" tells someone their file
 * was refused; "pesa demasiado (máximo 5 MB)" tells them what to do about it, which is the entire
 * job of an error message. The bare sentence remains for the callers that have no limits to hand.
 */
export function fileUploadErrorMessage(error: string, limits: FileUploadLimits = {}): string {
  const suffix = (value: string | undefined) => (value ? ` (${value})` : "");
  switch (error) {
    case "FILE_TOO_LARGE":
      return `el archivo pesa demasiado${suffix(
        limits.maxFileSize && Number.isFinite(limits.maxFileSize)
          ? `máximo ${formatFileSize(limits.maxFileSize)}`
          : undefined,
      )}`;
    case "FILE_TOO_SMALL":
      return `el archivo pesa muy poco${suffix(
        limits.minFileSize ? `mínimo ${formatFileSize(limits.minFileSize)}` : undefined,
      )}`;
    case "FILE_INVALID_TYPE":
      return `el tipo de archivo no está permitido${suffix(
        limits.accept ? `se aceptan ${describeAccept(limits.accept)}` : undefined,
      )}`;
    case "TOO_MANY_FILES":
      return `hay más archivos de los permitidos${suffix(
        limits.maxFiles && Number.isFinite(limits.maxFiles) ? `máximo ${limits.maxFiles}` : undefined,
      )}`;
    case "FILE_EXISTS":
      return "ese archivo ya fue elegido";
    case "TOTAL_TOO_LARGE":
      return `no cabe: se pasa del peso total${suffix(
        limits.maxTotalSize && Number.isFinite(limits.maxTotalSize)
          ? `máximo ${formatFileSize(limits.maxTotalSize)}`
          : undefined,
      )}`;
    default:
      return "el archivo no es válido";
  }
}

/**
 * A `validate` for the machine: the total weight of everything chosen, which it does not check.
 *
 * `maxFileSize` caps one file; a form with a 25 MB mailbox behind it cares about the sum, and
 * without this the control happily accepts ten 5 MB files against a 20 MB limit and fails on submit,
 * where the person can do nothing about it.
 *
 * THE RUNNING TOTAL IS KEYED ON THE BATCH, and that is the whole subtlety. Zag builds one `details`
 * object per selection and calls this once per file in it, so `details.acceptedFiles` is the state
 * BEFORE the batch and never grows as the batch is walked: summing it alone would let six files that
 * are 4 MB each through a 20 MB cap, one at a time, each of them "fitting". The WeakMap adds what
 * this batch has already taken, and it is a WeakMap so a batch object that is gone takes its tally
 * with it.
 */
export function maxTotalSizeValidator(maxTotalSize: number) {
  const takenInBatch = new WeakMap<object, number>();
  return (file: File, details: { acceptedFiles: File[] }): string[] | null => {
    const held = details.acceptedFiles.reduce((sum, accepted) => sum + accepted.size, 0);
    const pending = takenInBatch.get(details) ?? 0;
    if (held + pending + file.size > maxTotalSize) return ["TOTAL_TOO_LARGE"];
    takenInBatch.set(details, pending + file.size);
    return null;
  };
}

/*
 * A DROP SURFACE THAT IS NOT THE DROPZONE.
 *
 * Zag's `getDropzoneProps()` makes one element accept files, and that element is inside this
 * component. Two things people actually ask for are outside it: "drop anywhere on this panel" and
 * "drop anywhere on the page". Both are the same behaviour pointed at a different node, so it is
 * written once, here, and both bindings call it. What lands is a `File[]`, which each binding hands
 * straight to `api.setFiles()`: the machine keeps deciding what is accepted and what is rejected,
 * so a file dropped on the page is validated exactly like a file chosen from the picker.
 *
 * FOUR THINGS THIS GETS RIGHT, and every one of them is a bug in the naive version:
 *
 *   1. A COUNTER, not a boolean. `dragleave` fires when the pointer crosses into a CHILD of the
 *      surface, so a boolean flickers the highlight off over every element it passes. Enter
 *      increments, leave decrements, and the surface is "dragging" while the count is above zero.
 *   2. FILES ONLY. A dragged selection of text, a link, an image from another tab: all of them fire
 *      the same events. `dataTransfer.types` carries "Files" only for a real file drag, and it is
 *      the only thing readable during `dragenter`/`dragover` (the items themselves are hidden until
 *      `drop` for security). Anything else is ignored, highlight included.
 *   3. `preventDefault()` ON `dragover`, or there is no drop at all: the browser's default is to
 *      NAVIGATE to the dropped file, which replaces the page the person was filling in. This is the
 *      single worst failure in this category and it is one line.
 *   4. RESET ON `dragend` AND ON `blur`. A drag that ends outside the window (back onto the
 *      desktop, onto another app) fires no `drop` and often no final `dragleave`, so the counter
 *      never returns to zero and the highlight sticks forever. `drop` resets it outright rather
 *      than decrementing, for the same reason.
 */
export type FileDropSurfaceHandlers = {
  /** The surface started being dragged over with files. Fires once, not once per child. */
  onDragEnter?: () => void;
  /**
   * The drag moved over the surface. Fires continuously, which is what it is for: an overlay pinned
   * to an element's box has to survive the page scrolling under a held file.
   */
  onDragOver?: () => void;
  /** The drag left the surface, ended outside the window, or dropped. Fires once. */
  onDragLeave?: () => void;
  /** Files were dropped on the surface. Never called with an empty list. */
  onDrop: (files: File[]) => void;
};

/** Does this drag carry files? The only question answerable before `drop`. */
const dragHasFiles = (event: DragEvent): boolean =>
  Array.from(event.dataTransfer?.types ?? []).includes("Files");

/**
 * Make `target` (an element, or the document for a whole-page surface) accept dropped files.
 *
 * Returns its own teardown. Every listener is added to `target` except the two resets, which are on
 * the window: a drag that leaves the page is not an event `target` will ever see.
 */
/*
 * `EventTarget`, not `Element | Document`, and that is the honest type rather than a loosened one:
 * the only thing this touches on the surface is `addEventListener`. Saying so is also what lets the
 * behaviour be tested in Core's node runner, where there is no DOM at all, over a bare
 * `EventTarget` that answers exactly the interface used here.
 */
export function observeFileDrop(target: EventTarget, handlers: FileDropSurfaceHandlers): () => void {
  /* A Document has `defaultView`, an Element reaches it through `ownerDocument`, and a bare target
   * has neither, in which case the two window-level resets are simply not installed. */
  const view =
    (target as Partial<Document>).defaultView ??
    (target as Partial<Element>).ownerDocument?.defaultView ??
    null;
  let depth = 0;

  const leave = () => {
    if (depth === 0) return;
    depth = 0;
    handlers.onDragLeave?.();
  };

  const onDragEnter = (event: Event) => {
    if (!dragHasFiles(event as DragEvent)) return;
    depth += 1;
    if (depth === 1) handlers.onDragEnter?.();
  };

  const onDragOver = (event: Event) => {
    if (!dragHasFiles(event as DragEvent)) return;
    /* Both are required: without `preventDefault` the browser navigates to the file instead of
     * dropping it, and the effect is what turns the cursor into a copy cursor rather than the
     * "no entry" one, which is the only feedback the drag itself can give. */
    event.preventDefault();
    const transfer = (event as DragEvent).dataTransfer;
    if (transfer) transfer.dropEffect = "copy";
    handlers.onDragOver?.();
  };

  const onDragLeave = (event: Event) => {
    if (!dragHasFiles(event as DragEvent)) return;
    depth -= 1;
    if (depth <= 0) {
      depth = 0;
      handlers.onDragLeave?.();
    }
  };

  const onDrop = (event: Event) => {
    if (!dragHasFiles(event as DragEvent)) return;
    event.preventDefault();
    depth = 0;
    handlers.onDragLeave?.();
    const files = Array.from((event as DragEvent).dataTransfer?.files ?? []);
    if (files.length > 0) handlers.onDrop(files);
  };

  target.addEventListener("dragenter", onDragEnter);
  target.addEventListener("dragover", onDragOver);
  target.addEventListener("dragleave", onDragLeave);
  target.addEventListener("drop", onDrop);
  view?.addEventListener("dragend", leave);
  view?.addEventListener("blur", leave);

  return () => {
    target.removeEventListener("dragenter", onDragEnter);
    target.removeEventListener("dragover", onDragOver);
    target.removeEventListener("dragleave", onDragLeave);
    target.removeEventListener("drop", onDrop);
    view?.removeEventListener("dragend", leave);
    view?.removeEventListener("blur", leave);
  };
}

/**
 * The node a `page`-scoped control listens on, or `null` when the machine's own dropzone covers it.
 *
 * TWO SCOPES, NOT THREE. A third one pointed the drop at any other element on the page by CSS
 * selector. No documented version of this pattern has it, and the reason shows up as soon as you try
 * to write the sentence a reader would need: a surface somewhere else on the page that silently
 * belongs to a control over here is not discoverable, and it fails exactly the way this pattern
 * warns about, by being a drop target nobody can see. The whole page is different: people already
 * drag files onto windows, and the overlay says so the moment they do.
 */
export function fileDropTarget(scope: string | undefined, root: Element): Document | null {
  return scope === "page" ? root.ownerDocument : null;
}

/**
 * Is the dropzone hidden? Only once no more files can be taken.
 *
 * THE DROPZONE STAYS, which is what every documented version of this pattern does and what the
 * previous revision of this component got wrong: it hid the box the moment one file landed, so
 * adding a second meant finding the trigger instead of dropping again where you just dropped. The
 * one case for hiding it is the one eBay's playbook names: the file limit is reached, so the box
 * would be inviting a drop that can only be rejected. It comes back as soon as a file is removed.
 */
export function dropzoneHiddenAt(acceptedCount: number, maxFiles: number | undefined): boolean {
  return typeof maxFiles === "number" && Number.isFinite(maxFiles) && acceptedCount >= maxFiles;
}

/**
 * The files a drop should leave the control holding: what it had, plus what was dropped.
 *
 * ADDING, NOT REPLACING, and the machine gives no method that does it. `api.setFiles` sends
 * `FILES.SET`, which overwrites the accepted list outright; the append path (`setEventFiles`) is
 * reachable only through `DROPZONE.DROP`, and the machine accepts that event in its `dragging` state
 * alone, so an outside surface cannot send it without first faking a drag. Building the union here
 * and handing it to `setFiles` keeps every rule in the machine's hands (it re-validates the whole
 * set against `accept`, `maxFiles` and the size bounds) while making a second drop add to the first
 * rather than erase it.
 */
export function filesAfterDrop(current: readonly File[], dropped: readonly File[]): File[] {
  return [...current, ...dropped];
}

/*
 * WHAT A CHOSEN FILE LOOKS LIKE BEFORE IT IS SENT.
 *
 * A row of file names is a receipt, not a confirmation: "informe.pdf" tells you a file was taken,
 * never that it was the RIGHT file. Someone picking three photos out of a folder of ninety is
 * checking they grabbed the right three, and only the picture answers that. So an image shows
 * itself, and everything else says its kind beside its size.
 *
 * Both bindings draw the same two cases from these two functions, so neither can decide on its own
 * that a `.heic` is previewable or that an extension should be shown lowercase.
 */

/**
 * The remove control's accessible name, per file: "Quitar informe.pdf".
 *
 * Shared rather than written twice, the same way Calendar publishes its own default labels: two
 * bindings spelling one control's name differently is two different controls to anyone listening to
 * the page instead of looking at it. The pattern's own guidance is this exact shape, "Remove
 * [filename]", rather than a bare "Remove" repeated down the list.
 */
export const removeFileLabel = (name: string): string => `Quitar ${name}`;

/**
 * The machine's own accessible names, which it will otherwise write in English over ours.
 *
 * FOUND BY A TEST ASKING FOR A BUTTON BY NAME AND NOT FINDING IT. `@zag-js/file-upload` ships
 * `defaultTranslations` and `getDropzoneProps`/`getItemDeleteTriggerProps` put them straight into
 * `aria-label`, which BEATS element content. So the dropzone announced itself as "dropzone" rather
 * than as the instruction written on it (a label-in-name failure on top of an English one), and the
 * remove control announced "delete file informe.pdf" while carrying a visually hidden "Quitar
 * informe.pdf" that nothing could ever read. Both bindings shipped that.
 *
 * `dropzone` takes the VISIBLE text, so what is heard is what is written, and every other name in
 * this component keeps the language the rest of its defaults already use.
 */
export const fileUploadTranslations = (dropzoneLabel: string) => ({
  dropzone: dropzoneLabel,
  deleteFile: (file: File) => removeFileLabel(file.name),
  itemPreview: (file: File) => `Vista previa de ${file.name}`,
});

/** Can this file be shown as itself? Only a raster the browser will paint from a blob URL. */
export function isPreviewableImage(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * The badge for a file that cannot show itself: its extension, upper case, at most four characters.
 *
 * FOUR, because that is where the real ones stop (`docx`, `webp`, `jpeg`) and a longer one is
 * either a double extension (`tar.gz`, whose tail is the informative half) or not an extension at
 * all. A name with no dot, or a dot at the end, has no extension to show and gets the generic mark
 * rather than a stray fragment of its own name.
 */
export function fileKindLabel(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "FILE";
  const extension = name.slice(dot + 1);
  if (!/^[a-z0-9]+$/i.test(extension)) return "FILE";
  return extension.slice(0, 4).toUpperCase();
}

/**
 * Where focus goes when the row it was on is removed.
 *
 * A remove button that deletes itself leaves focus on `<body>`, which drops a keyboard user out of
 * the control and back at the top of the page: they were removing the second of four files and now
 * have to tab back in. The next row's remove button takes it (same position, same job), the last
 * row's if there is no next, and the trigger when the list is empty, which is the one control that
 * is always there.
 *
 * `index` is the position the removed row HELD, so the element now at that index is the row that
 * moved up into it.
 */
export function focusAfterFileRemoved(root: ParentNode, index: number): void {
  const removers = root.querySelectorAll<HTMLElement>(`.${fileUploadParts.itemDelete}`);
  const next = removers[index] ?? removers[removers.length - 1];
  /* Two ways of naming the same button, because both exist in the wild: the emitter writes the part
     class, and hand-authored markup written before that class reached the template has only the
     mount attribute the enhancer itself looks for. */
  const fallback = root.querySelector<HTMLElement>(
    `.${fileUploadParts.trigger}, [${fileUploadAttrs.trigger}]`,
  );
  (next ?? fallback)?.focus();
}

export const fileUploadParts = {
  root: "sk-file-upload",
  label: "sk-file-upload__label",
  dropzone: "sk-file-upload__dropzone",
  /**
   * The instruction written in the dropzone. It had no class at all: the glyph above it and the
   * hint below it were both parts, and the sentence between them, which is the one thing every
   * reader of this control actually reads, was a bare `<span>`. Nothing could style it and the
   * anatomy could not name it.
   */
  instruction: "sk-file-upload__instruction",
  input: "sk-file-upload__input",
  trigger: "sk-file-upload__trigger",
  hint: "sk-file-upload__hint",
  icon: "sk-file-upload__icon",
  overlay: "sk-file-upload__overlay",
  overlayBody: "sk-file-upload__overlay-body",
  itemGroup: "sk-file-upload__item-group",
  item: "sk-file-upload__item",
  itemPreview: "sk-file-upload__item-preview",
  /**
   * The name and the facts about it, stacked. It exists because they belong on two lines: a filename
   * is the one thing worth reading in a row and it is also the one thing that can be 80 characters
   * long, so it gets the full width and everything else goes under it. Side by side, the name lost
   * room to a size that never needed it.
   */
  itemBody: "sk-file-upload__item-body",
  /** Where the choosing stands, over the list it counts. See `fileUploadTallyLabel`. */
  tally: "sk-file-upload__tally",
  itemKind: "sk-file-upload__item-kind",
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
  clear: "data-sk-file-upload-clear",
  itemGroup: "data-sk-file-upload-item-group",
  item: "data-sk-file-upload-item",
  itemDelete: "data-sk-file-upload-item-delete",
  overlay: "data-sk-file-upload-overlay",
} as const;

/**
 * Choosing files: a real `<input type="file">` behind a dropzone you can also click.
 *
 * The input is visually hidden and never replaced; it is what makes the control keyboard-reachable,
 * form-associated and readable by the platform's own file picker. The dropzone is the affordance;
 * the input is the control.
 *
 * THE LIST OF CHOSEN FILES IS NOT IN THIS TEMPLATE, and that is not the gap it used to be.
 *
 * It is runtime state: it exists because somebody picked files, so there is nothing for an author to
 * write. Both bindings now RENDER it, from these part classes, the same way Calendar's two bindings
 * render a month grid that no one authors either. The vanilla enhancer patching attributes rather
 * than rendering (decision 8) was always about AUTHORED structure; a list of files is generated,
 * like a calendar's cells, and the alternative was the shape this component actually shipped for a
 * while: React showed you what you had chosen and vanilla showed you nothing at all.
 *
 * What is published below is the shell, which is what an author writes. What both bindings draw
 * into it is the chosen files, each one showing what it is (`isPreviewableImage`, `fileKindLabel`)
 * with its own delete control, so the choice can be checked and corrected before it is sent.
 */
/** The DOM events this family dispatches on its root, `sk:<family><event>` like every other. */
export const fileUploadEvents = {
  /** Detail: `{ acceptedFiles, rejectedFiles }`. */
  change: "sk:fileuploadchange",
} as const;

export const fileUploadContract = {
  id: "file-upload",
  category: "forms",
  css: "@skryensya/core/components/file-upload.css",
  parts: fileUploadParts,
  events: fileUploadEvents,
  eventDetails: {
    change: { detail: { acceptedFiles: "File[]", rejectedFiles: "FileRejection[]" }, reactProp: "onFileChange", source: "root", trigger: "input" },
  },
  hooks: [
    "--sk-file-upload-dropzone-accent",
    "--sk-file-upload-dropzone-bg",
    "--sk-file-upload-dropzone-border-color",
    "--sk-file-upload-dropzone-padding",
    "--sk-file-upload-dropzone-radius",
    "--sk-file-upload-gap",
    "--sk-file-upload-item-bg",
    "--sk-file-upload-item-border-color",
    "--sk-file-upload-item-gap",
    "--sk-file-upload-item-padding",
    "--sk-file-upload-item-preview-size",
    "--sk-file-upload-item-radius",
    "--sk-file-upload-dropzone-title-size",
    "--sk-file-upload-icon-bg",
    "--sk-file-upload-icon-color",
    "--sk-file-upload-icon-size",
    "--sk-file-upload-label-color",
    "--sk-file-upload-overlay-bg",
    "--sk-file-upload-overlay-border-color",
    "--sk-file-upload-overlay-radius",
  ],

  options: {
    name: { type: "string", attr: "name", machineInput: true },
    /** More than one file at a time. The machine reads it off the input. */
    multiple: { type: "boolean", default: false, attr: "multiple", trueValue: "", machineInput: true },
    /** A filter for the picker, in the `accept` syntax: `image/*`, `.pdf,.docx`. */
    accept: { type: "string", attr: "accept", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "required", trueValue: "", machineInput: true },
    /** Maximum accepted file count. The enhancer reads the shell; React receives the same value. */
    maxFiles: { type: "number", min: 1, integer: true, attr: "data-max-files", machineInput: true },
    /** Maximum accepted file size in bytes. */
    maxFileSize: { type: "number", min: 1, integer: true, attr: "data-max-file-size", machineInput: true },
    /**
     * Minimum accepted file size in bytes. The React binding has taken this since the first version
     * and the contract never published it, so authored markup had no way to say it and the two
     * bindings enforced different rules from the same tree.
     */
    minFileSize: { type: "number", min: 1, integer: true, attr: "data-min-file-size", machineInput: true },
    /**
     * Maximum weight of every chosen file TOGETHER, in bytes.
     *
     * The machine has no such rule (`maxFileSize` caps one file at a time), and a form with a mailbox
     * or a request limit behind it cares about the sum: without this the control takes ten 5 MB files
     * against a 20 MB budget and fails at submit, where the person can no longer do anything about
     * it. Enforced through the machine's own `validate` hook (`maxTotalSizeValidator`), so a file
     * that does not fit is rejected exactly like one of the wrong type.
     */
    maxTotalSize: { type: "number", min: 1, integer: true, attr: "data-max-total-size", machineInput: true },
    /*
     * WHERE A FILE MAY BE DROPPED.
     *
     *   zone  the dashed box, and nothing else. The default, and the one that explains itself: the
     *         target is drawn on screen.
     *   page  the whole document, the convenience every mail client has taught. It needs the overlay
     *         (`overlayLabel`) to exist at all, because otherwise it is a drop target nobody can see.
     *
     * The dashed box stays in both: this option ADDS a surface, it never removes the one that the
     * keyboard and the file picker still need to be attached to.
     */
    dropScope: {
      type: "enum",
      values: ["zone", "page"],
      default: "zone",
      attr: "data-drop-scope",
    },
  },

  signatures: {
    FileUpload: {
      intent: ["file-upload", "attach-a-file", "dropzone", "choose-files", "browse"],
      host: { element: "div" },
      options: [
        "name",
        "multiple",
        "accept",
        "disabled",
        "required",
        "maxFiles",
        "maxFileSize",
        "minFileSize",
        "maxTotalSize",
        "dropScope",
      ],
      /** Host id / a11y names beyond owned labels. */
      forward: ["id", "aria-*"],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
      ],
      slots: {
        label: { accepts: "text", required: true },
        /** What the dropzone says. It is an instruction, so it is content, not a placeholder. */
        dropzoneLabel: { accepts: "text", required: true },
        /**
         * A mark of your own over the instruction, INSTEAD OF the `upload` role this control draws
         * by default. An Icon rather than free content: a dropzone reads as a target at a glance
         * because of the mark in it, and a box that can hold anything is a box people put a logo in.
         */
        dropzoneIcon: { accepts: "signature", of: ["Icon"] },
        /**
         * The constraints in the author's own words, INSTEAD OF the line both bindings derive from
         * the limits themselves (`fileUploadLimitsLabel`). Opt-in, and rarely needed: a hand-written
         * limit is a promise nothing checks, and the derived one cannot contradict the validator.
         *
         * The part and its stylesheet rule existed from the first version of this component and the
         * template never had a node for it, so the only place it was ever rendered was the docs
         * page's own anatomy specimen. Publishing it is what makes `accept` and `maxFileSize`
         * sayable BEFORE the file is rejected, which is the whole point of stating a limit.
         */
        hintLabel: { accepts: "text" },
        /**
         * What the drop overlay says while a file is dragged anywhere over the page. Required in
         * practice for `dropScope: "page"`, opt-in here for the same reason `clearLabel` is: a tree
         * written before this emits byte-identical markup.
         */
        overlayLabel: { accepts: "text" },
        triggerLabel: { accepts: "text", required: true },
        /**
         * The "remove everything" button's own label. OPT-IN: absent means no clear button in the
         * emitted tree (and React only renders one when this prop is passed).
         */
        clearLabel: { accepts: "text" },
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
          /*
           * THE DROPZONE IS THIS CONTROL'S EMPTY STATE, which is why the hint lives inside it rather
           * than beside it: the glyph, the instruction and the constraints are one piece of content
           * that answers "there is nothing here yet, and here is how to change that".
           *
           * IT DOES NOT LEAVE WHEN THE FIRST FILE ARRIVES. A previous revision hid it then and put
           * the list in its place, which broke the thing people do most with this control: dropping
           * a second file where they just dropped the first. Every documented version of this
           * pattern keeps the box and puts the list under it. It hides for one reason only, the file
           * limit being reached (`dropzoneHiddenAt`), and comes back when a file is removed.
           *
           * NOT A COMPOSED `EmptyState`, deliberately. Zag makes this node `role="button"`, and
           * EmptyState's template is a `section` with an `h2`: a heading inside a button is not read
           * as a heading by anything, and its `actions` slot would put a focusable control inside a
           * button, which is the nested-interactive trap this file already documents twice. So the
           * SHAPE is an empty state (see file-upload.css) and the semantics stay a button.
           */
          {
            element: "div",
            part: "dropzone",
            mount: "data-sk-file-upload-dropzone",
            children: [
              /*
               * THE MARK, AND IT IS NOT OPT-IN ANY MORE.
               *
               * The system has published an `upload` role since the icon sets were written, all
               * three of them draw it, and the one component named after uploading never asked for
               * it: the glyph was a slot nobody filled, so this control's empty state shipped
               * without a mark while the stylesheet kept drawing the circle meant to hold one. An
               * empty state without a mark is a paragraph in a dashed box.
               *
               * TWO NODES FOR ONE PART because the emitter renders a node's `slot` OR its
               * `children`, never one falling back to the other. `whenGiven` carries the author's
               * own mark, `whenMissing` carries the role this component would have asked for anyway.
               */
              {
                element: "span",
                part: "icon",
                whenGiven: "dropzoneIcon",
                attrs: { "aria-hidden": "true" },
                slot: "dropzoneIcon",
              },
              {
                element: "span",
                part: "icon",
                whenMissing: "dropzoneIcon",
                attrs: { "aria-hidden": "true" },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "upload", "data-sk-icon-size": "lg" } },
                ],
              },
              { element: "span", part: "instruction", slot: "dropzoneLabel" },
              { element: "p", part: "hint", whenGiven: "hintLabel", slot: "hintLabel" },
            ],
          },
          {
            element: "input",
            part: "input",
            mount: "data-sk-file-upload-input",
            options: ["name", "multiple", "accept", "disabled", "required"],
            attrs: { type: "file" },
          },
          {
            /* `part` at last: `fileUploadParts.trigger` has existed since the first version and no
               template node ever carried it, so the one class that could find this button from
               outside either binding was not on it. `focusAfterFileRemoved` needs exactly that. */
            element: "button",
            part: "trigger",
            also: ["sk-button", "sk-interactive"],
            mount: "data-sk-file-upload-trigger",
            /* `solid` is the default, so no `data-variant` at all. This said "secondary", a value
             * the Button contract has never published: it matched no rule in button.css and fell
             * back to looking like the default anyway. Authored markup is where that hides, since
             * nothing validates a hand-written attribute the way a usage tree gets validated. */
            attrs: { type: "button" },
            slot: "triggerLabel",
          },
          /*
           * REMOVE EVERYTHING, and `hidden` in the authored markup on purpose: with no files chosen
           * there is nothing to clear, so a page with no enhancer running shows no button rather
           * than a dead one. Both bindings drive it from the same Zag trigger and both toggle that
           * same `hidden` off once a file lands, so the static markup is the honest initial state
           * rather than a thing the binding has to undo.
           *
           * Declared here because both bindings already shipped it and neither could say so: React
           * renders `api.getClearTriggerProps()` with a `clearLabel` prop, the Vanilla enhancer
           * patches `[data-sk-file-upload-clear]`, and the contract named neither.
           */
          {
            element: "button",
            also: ["sk-button", "sk-interactive"],
            mount: "data-sk-file-upload-clear",
            /* OPT-IN: no `clearLabel`, no button. The Vanilla enhancer already treats it that way
             * (`if (clear)`), so emitting one unasked would give an author a control they never
             * requested, and an empty one at that. Every tree written before this keeps emitting
             * byte-identical markup. */
            whenGiven: "clearLabel",
            attrs: { type: "button", "data-variant": "ghost", hidden: "" },
            slot: "clearLabel",
          },
          /*
           * THE DROP OVERLAY, `hidden` in the authored markup for the same reason the clear button
           * is: with no file being dragged there is nothing to announce, so a page with no enhancer
           * running shows nothing rather than a permanent sheet over its own content. Both bindings
           * toggle that one attribute, and the CSS does the rest.
           *
           * LAST IN THE ROOT, because for `page` it is `position: fixed` and for `element` it is
           * pinned to the target: in both cases it paints over what it covers, and painting order
           * follows source order among positioned siblings. It is also `aria-hidden`: the overlay
           * is feedback for a pointer gesture that a screen reader user is not performing, and the
           * accessible path to the same files (the input, the trigger) is untouched.
           */
          {
            element: "div",
            part: "overlay",
            mount: "data-sk-file-upload-overlay",
            whenGiven: "overlayLabel",
            attrs: { hidden: "", "aria-hidden": "true" },
            children: [{ element: "div", part: "overlayBody", slot: "overlayLabel" }],
          },
        ],
      },
      react: { from: "@skryensya/react/file-upload", name: "FileUpload" },
    },
  },
} as const satisfies ComponentContract;
