import {
  dropzoneHiddenAt,
  fileDropTarget,
  fileKindLabel,
  filesAfterDrop,
  fileUploadErrorMessage,
  fileUploadEvents,
  fileUploadParts,
  fileUploadContract,
  fileUploadLimitsLabel,
  fileUploadTallyLabel,
  fileUploadTranslations,
  focusAfterFileRemoved,
  formatFileSize,
  maxTotalSizeValidator,
  isPreviewableImage,
  observeFileDrop,
} from "@skryensya/core/file-upload";
import { Icon } from "./icon.js";
import { fileUpload } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

/* Derived, never restated: the defaults live in the contract. */
const { multiple: multipleOption, dropScope: dropScopeOption } = fileUploadContract.options;

/** The union is the contract's `values`, not a second list that could disagree with it. */
export type FileUploadDropScope = (typeof dropScopeOption.values)[number];

export type FileUploadProps = {
  id?: string;
  name?: string;
  label: string;
  dropzoneLabel?: string;
  triggerLabel?: string;
  /**
   * Accepted types. The contract's own spelling is the `accept` attribute's (`"image/*,.pdf"`), and
   * the machine takes that string as readily as the map: both are here so a tree written for either
   * binding says the same thing.
   */
  accept?: string | string[] | Record<string, string[]>;
  maxFiles?: number;
  maxFileSize?: number;
  minFileSize?: number;
  /** Maximum weight of every chosen file together, in bytes. */
  maxTotalSize?: number;
  disabled?: boolean;
  required?: boolean;
  allowDrop?: boolean;
  /**
   * Where a file may be dropped: the dashed box (`"zone"`, the default) or anywhere in the document
   * (`"page"`, which needs `overlayLabel` to be visible at all).
   */
  dropScope?: FileUploadDropScope;
  /** What the overlay says while a file is dragged over an `element` or `page` surface. */
  overlayLabel?: string;
  /** The constraints in the reader's own words ("PNG or JPG, up to 5 MB"). Opt-in. */
  hintLabel?: string;
  /** A glyph over the dropzone instruction. Opt-in. */
  dropzoneIcon?: ReactNode;
  directory?: boolean;
  multiple?: boolean;
  acceptedFiles?: File[];
  defaultAcceptedFiles?: File[];
  deleteIcon?: ReactNode;
  /** Opt-in: absent means no clear-all control (matches contract `whenGiven: "clearLabel"`). */
  clearLabel?: string;
  onFileChange?: (details: {
    acceptedFiles: File[];
    rejectedFiles: Array<{ file: File; errors: string[] }>;
  }) => void;
};

/*
 * WHAT ONE CHOSEN FILE LOOKS LIKE. An image shows itself; everything else shows its kind.
 *
 * The blob URL is created once per file and revoked when the row goes away. Skipping the revoke is
 * the leak this pattern is famous for: every re-pick of the same folder would strand another copy of
 * every image in memory for the life of the document. `useMemo` keyed on the file, and a cleanup
 * that runs when it changes or unmounts, is the whole lifecycle.
 *
 * `aria-hidden` on the frame and an empty `alt`: the row already says the file's name out loud, and
 * a thumbnail of it is the same fact drawn for the eye.
 */
function FilePreview({ file }: { file: File }) {
  const previewable = isPreviewableImage(file);
  const url = useMemo(() => (previewable ? URL.createObjectURL(file) : null), [file, previewable]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  /* The frame is the box, the picture or the glyph is what sits in it: a 20px glyph wearing the
     frame's own class shrank the column and pushed that row's text left of every other row's. */
  return (
    <span className={fileUploadParts.itemPreview} aria-hidden="true">
      {url ? <img src={url} alt="" /> : <Icon name="file" size="md" />}
    </span>
  );
}

export function FileUpload({
  accept,
  acceptedFiles,
  allowDrop,
  clearLabel,
  defaultAcceptedFiles,
  deleteIcon,
  directory,
  disabled,
  dropScope = dropScopeOption.default,
  dropzoneIcon,
  dropzoneLabel = "Arrastra archivos aquí",
  hintLabel,
  id,
  overlayLabel,
  label,
  maxFileSize,
  maxFiles,
  maxTotalSize,
  minFileSize,
  multiple = multipleOption.default,
  name,
  onFileChange,
  required,
  triggerLabel = "Elegir archivos",
}: FileUploadProps) {
  /*
   * ONE PLACE FOR THE LIMITS, read by the three things that need them: the machine that rejects, the
   * hint that warns first and the message that explains after. `accept` only enters it as a string,
   * which is what a sentence can be built from.
   */
  const limits = {
    accept: typeof accept === "string" ? accept : undefined,
    maxFiles,
    maxFileSize,
    minFileSize,
    maxTotalSize,
    multiple,
  };
  const generatedId = useId();
  const totalSizeValidate = useMemo(
    () => (maxTotalSize ? maxTotalSizeValidator(maxTotalSize) : undefined),
    [maxTotalSize],
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<Array<{ file: File; errors: string[] }>>([]);
  const service = useMachine(fileUpload.machine, {
    id: id ?? generatedId,
    name,
    accept,
    acceptedFiles,
    defaultAcceptedFiles,
    allowDrop,
    directory,
    disabled,
    required,
    maxFileSize,
    maxFiles: maxFiles ?? (multiple ? Number.POSITIVE_INFINITY : 1),
    minFileSize,
    /* The machine's own escape hatch, holding the one rule it has no field for. Rebuilt only when
     * the cap changes: the validator carries a per-batch tally, so a new one each render would
     * throw that away mid-selection. */
    validate: totalSizeValidate,
    /* Or the machine labels the dropzone "dropzone" and the remove buttons "delete file x", in
     * English, over whatever this page wrote. See `fileUploadTranslations`. */
    translations: fileUploadTranslations(dropzoneLabel),
    onFileChange(details) {
      const rejectedFiles = details.rejectedFiles.map(({ file, errors }) => ({
        file,
        errors,
      }));
      // Selecting a valid batch after a rejected one clears the old message: it is feedback about
      // the LAST selection, never a running log of every attempt this session.
      setRejected(rejectedFiles);
      const next = { acceptedFiles: details.acceptedFiles, rejectedFiles };
      onFileChange?.(next);
      rootRef.current?.dispatchEvent(
        new CustomEvent(fileUploadEvents.change, { bubbles: true, detail: next }),
      );
    },
  });
  const api = fileUpload.connect(service, normalizeProps);

  /*
   * THE SURFACE OUTSIDE THIS COMPONENT. Zag owns the dropzone; everything past its edge is ours,
   * and it is the same `observeFileDrop` the vanilla enhancer calls, over the same `fileDropTarget`
   * resolution, so "page" cannot come to mean two things.
   *
   * WHAT A DROP DOES IS `api.setFiles`, not a second validation path: a file dropped on the window
   * goes through the machine's accept/maxFiles/maxFileSize exactly like one picked from the dialog,
   * and lands in the same `onFileChange` that already dispatches `sk:fileuploadchange`.
   *
   * `apiRef` EXISTS BECAUSE `api` IS A NEW OBJECT EVERY RENDER. Depending on it would tear the
   * listeners down and rebuild them on each keystroke elsewhere in the form, and a drag in flight
   * when that happens is a drag whose `dragenter` was counted by a listener that no longer exists.
   * The effect depends on the two values that actually change what it listens to.
   */
  const apiRef = useRef(api);
  apiRef.current = api;
  useEffect(() => {
    const root = rootRef.current;
    if (!root || disabled) return;
    const target = fileDropTarget(dropScope, root);
    if (!target) return;
    return observeFileDrop(target, {
      onDragEnter: () => setDragging(true),
      onDragLeave: () => setDragging(false),
      /* Added to what is already there, never in place of it: see `filesAfterDrop`. */
      onDrop: (files) =>
        apiRef.current.setFiles(filesAfterDrop(apiRef.current.acceptedFiles, files)),
    });
  }, [disabled, dropScope]);

  /*
   * THE LIMIT IS THE ONLY REASON THE BOX GOES. With no room left it would be inviting a drop that
   * can only be rejected; with room left it is where people drop the next file, which is the single
   * most common thing done with this control.
   */
  const limit = maxFiles ?? (multiple ? Number.POSITIVE_INFINITY : 1);
  const dropzoneHidden = dropzoneHiddenAt(api.acceptedFiles.length, limit);
  const hint = hintLabel ?? fileUploadLimitsLabel(limits);
  const tally = fileUploadTallyLabel(api.acceptedFiles, limits);

  return (
    <div
      {...api.getRootProps()}
      className={fileUploadParts.root}
      data-sk-file-upload=""
      /* `zone` is the default, so it writes no attribute at all: the same rule every other contract
         option follows, and what keeps the two bindings' markup diffable. */
      data-drop-scope={dropScope === dropScopeOption.default ? undefined : dropScope}
      /* Page scope drags happen away from the dashed box, so the control says so too. */
      data-dragging={dragging ? "" : undefined}
      /* Something was refused: the control says so as a whole, not only in the message below it. */
      data-invalid={rejected.length ? "" : undefined}
      ref={rootRef}
    >
      <label {...api.getLabelProps()} className={fileUploadParts.label}>
        {label}
      </label>
      {/* The dropzone holds the instruction and nothing interactive: it is role="button" with its
          own tab stop, and a button containing a focusable descendant is unreachable past its first
          child. The input and the trigger are siblings; Zag wires them by props, not by nesting. */}
      {/*
        * THE EMPTY STATE, and the drop target, and it stays while either job is still live. The list
        * of chosen files goes UNDER it, never in place of it, so the second file is dropped where
        * the first one was. The hint belongs to it (the limits, stated before a file is rejected for
        * breaking them); the trigger below does not, because the picker is the keyboard's way in.
        */}
      <div {...api.getDropzoneProps()} className={fileUploadParts.dropzone} hidden={dropzoneHidden}>
        {/* The `upload` role by default: the system has drawn it in all three icon sets since they
            were written, and this is the component it was named for. `dropzoneIcon` replaces it. */}
        <span className={fileUploadParts.icon} aria-hidden="true">
          {dropzoneIcon ?? <Icon name="upload" size="lg" />}
        </span>
        <span className={fileUploadParts.instruction}>{dropzoneLabel}</span>
        {/* The author's words, or the limits saying themselves. Never a hand-typed limit. */}
        {hint ? <p className={fileUploadParts.hint}>{hint}</p> : null}
      </div>
      {/* The part class is what hides it (`clip-path: inset(50%)`); without it the raw file input
          paints on top of everything it is supposed to be behind. */}
      <input {...api.getHiddenInputProps()} className={fileUploadParts.input} />
      <button
        {...api.getTriggerProps()}
        className={`${fileUploadParts.trigger} sk-button sk-interactive`}
        /* No `data-variant`: `solid` is the default. This said "secondary", which the contract has
           never published, so it matched no rule and looked like the default regardless. */
        type="button"
      >
        {triggerLabel}
      </button>
      {rejected.length ? (
        // `role="alert"`: unlike the accepted list below, this is new, unexpected feedback about
        // the choice the reader just made, not a persistent state a screen reader can visit at
        // will. The same reasoning `Callout`'s own `danger` tone already carries.
        <div className={fileUploadParts.rejection} role="alert">
          {rejected.map(({ file, errors }) => (
            <p key={`${file.name}-${file.lastModified}`}>
              {file.name}: {errors.map((error) => fileUploadErrorMessage(error, limits)).join(", ")}
            </p>
          ))}
        </div>
      ) : null}
      {api.acceptedFiles.length ? (
        <>
          {/*
            * `aria-live="polite"`: adding and removing files is the one thing that happens here
            * without a page change, and the pattern's own guidance is to announce it. Polite, not
            * assertive: it is confirmation of something the person just did.
            */}
          {/* State, over the list it counts: how many of how many, how much of how much. Outside the
              live region below on purpose: the names are what is worth announcing, and repeating a
              running total after each one is noise. */}
          {tally ? <p className={fileUploadParts.tally}>{tally}</p> : null}
          <ul
            {...api.getItemGroupProps()}
            className={fileUploadParts.itemGroup}
            aria-live="polite"
          >
            {api.acceptedFiles.map((file, index) => (
              <li
                {...api.getItemProps({ file })}
                className={fileUploadParts.item}
                key={`${file.name}-${file.lastModified}`}
              >
                <FilePreview file={file} />
                <span className={fileUploadParts.itemBody}>
                  {/* `title`: the name is cut with an ellipsis when it is long, and this is where the
                      whole of it stays reachable. */}
                  <span
                    {...api.getItemNameProps({ file })}
                    className={fileUploadParts.itemName}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  {/* Under the name, not beside it: kind and size are two quiet facts about the same
                      file, and neither of them is what anyone reads a row for. */}
                  <span {...api.getItemSizeTextProps({ file })} className={fileUploadParts.itemSize}>
                    <span className={fileUploadParts.itemKind}>{fileKindLabel(file.name)}</span>
                    {/* This kit's own formatter, not the machine's: `api.getFileSize` renders "70
                        byte" in this locale while the hint above the list says "5 MB". One control
                        should not measure files two ways. */}
                    {` · ${formatFileSize(file.size)}`}
                  </span>
                </span>
                {/*
                  * A GHOST ICON BUTTON, the kit's own: a bordered default button next to a filename
                  * reads as heavier than the file it removes. Its name is the machine's aria-label
                  * ("Quitar informe.pdf"), so the glyph stays decorative.
                  */}
                <button
                  {...api.getItemDeleteTriggerProps({ file })}
                  className={`${fileUploadParts.itemDelete} sk-button sk-interactive`}
                  data-variant="ghost"
                  data-size="sm"
                  data-icon-only=""
                  onClick={() => {
                    /* `deleteFile` rather than the spread's own handler, so both bindings call one
                       public method. The row is about to vanish under the pointer or the caret, so
                       focus is placed deliberately once React has drawn the shorter list. */
                    api.deleteFile(file);
                    requestAnimationFrame(() => {
                      if (rootRef.current) focusAfterFileRemoved(rootRef.current, index);
                    });
                  }}
                  type="button"
                >
                  {deleteIcon ?? <Icon name="close" size="sm" />}
                </button>
              </li>
            ))}
          </ul>
          {clearLabel ? (
            <button
              {...api.getClearTriggerProps()}
              className="sk-button sk-interactive"
              data-variant="ghost"
              type="button"
            >
              {clearLabel}
            </button>
          ) : null}
        </>
      ) : null}
      {/*
        * `aria-hidden`: this is feedback for a pointer gesture a screen reader user is not making,
        * and the accessible way to the same files (the label, the input, the trigger) is untouched.
        * `hidden` rather than unmounting, so the node the effect pins exists before the drag starts.
        */}
      {overlayLabel ? (
        <div
          className={fileUploadParts.overlay}
          data-sk-file-upload-overlay=""
          hidden={!dragging}
          aria-hidden="true"
          ref={overlayRef}
        >
          <div className={fileUploadParts.overlayBody}>{overlayLabel}</div>
        </div>
      ) : null}
    </div>
  );
}
