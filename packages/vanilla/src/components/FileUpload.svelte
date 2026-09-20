<script lang="ts">
  import { fileUpload } from "@skryensya/core/machines";
  import {
    dropzoneHiddenAt,
    fileDropTarget,
    fileKindLabel,
    filesAfterDrop,
    fileUploadErrorMessage,
    fileUploadEvents,
    fileUploadParts,
    fileUploadLimitsLabel,
    fileUploadTallyLabel,
    fileUploadTranslations,
    focusAfterFileRemoved,
    formatFileSize,
    maxTotalSizeValidator,
    isPreviewableImage,
    observeFileDrop,
  } from "@skryensya/core/file-upload";
  import { remountIcons } from "../icon.js";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onMount } from "svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * FILE UPLOAD, a machine-backed enhancer over `@zag-js/file-upload` (the SAME machine React uses, via
   * `@skryensya/core/machines`). It renders no structure: it scans its authored markup and patches the
   * attributes `connect` returns onto those nodes.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>("[data-sk-file-upload-label]");
  const dropzone = root.querySelector<HTMLElement>("[data-sk-file-upload-dropzone]");
  const input = root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]");
  const trigger = root.querySelector<HTMLButtonElement>("[data-sk-file-upload-trigger]");
  const clear = root.querySelector<HTMLButtonElement>("[data-sk-file-upload-clear]");
  const overlay = root.querySelector<HTMLElement>("[data-sk-file-upload-overlay]");

  /* Something was refused: the control says so as a whole, not only in the message under it. */
  $effect(() => {
    root.toggleAttribute("data-invalid", api.rejectedFiles.length > 0);
  });

  // Captured ONCE, never re-read from the DOM: `getRootProps().id` returns a namespaced id that
  // `applyZagProps` writes back onto `root.id`. Reading it live from `useMachine`'s reactive factory
  // would feed that prefix back on every recomputation.
  const machineId = root.id || uniqueId("sk-file-upload");

  /*
   * THE LIMITS, read once off the authored markup, and shared by the three things that need them:
   * the machine that rejects, the hint that warns first and the message that explains after.
   */
  const limits = {
    accept: input?.accept || undefined,
    maxFiles: Number(root.dataset.maxFiles) || undefined,
    maxFileSize: Number(root.dataset.maxFileSize) || undefined,
    minFileSize: Number(root.dataset.minFileSize) || undefined,
    maxTotalSize: Number(root.dataset.maxTotalSize) || undefined,
    multiple: input?.multiple,
  };
  const totalSizeValidate = limits.maxTotalSize ? maxTotalSizeValidator(limits.maxTotalSize) : undefined;

  const accept = input?.accept
    ? input.accept
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  const service = useMachine(fileUpload.machine, () => ({
    id: machineId,
    name: input?.name || undefined,
    accept,
    disabled: input?.disabled,
    required: input?.required,
    maxFiles: Number(root.dataset.maxFiles || (input?.multiple ? Infinity : 1)),
    maxFileSize: Number(root.dataset.maxFileSize || Infinity),
    minFileSize: Number(root.dataset.minFileSize || 0),
    /* The machine's own escape hatch, holding the one rule it has no field for: the weight of
     * everything together. */
    validate: totalSizeValidate,
    allowDrop: !root.hasAttribute("data-disable-drop"),
    /* The instruction the author wrote IS the dropzone's accessible name. Left to itself the machine
     * writes "dropzone" there, in English, over it. See `fileUploadTranslations`. */
    translations: fileUploadTranslations(dropzone?.textContent?.trim() || ""),
    directory: input?.hasAttribute("webkitdirectory"),
    onFileChange(details: { acceptedFiles: File[]; rejectedFiles: unknown[] }) {
      root.dispatchEvent(
        new CustomEvent(fileUploadEvents.change, {
          bubbles: true,
          detail: {
            acceptedFiles: details.acceptedFiles,
            rejectedFiles: details.rejectedFiles,
          },
        }),
      );
    },
  }));

  const api = $derived(fileUpload.connect(service, normalizeProps));

  /*
   * THE THUMBNAILS, and their cleanup.
   *
   * DERIVED, NOT WRITTEN FROM AN EFFECT. The first version built the map inside an `$effect` that
   * also read it, to reuse the URL of a file that survived the last change: an effect that reads and
   * writes one piece of state is the loop Svelte stops with `effect_update_depth_exceeded`, and it
   * did. Rebuilding the map from the accepted list is a `$derived` by nature, and the saving it was
   * chasing does not exist anyway, since the cleanup below has to run before each recomputation.
   *
   * The revoke is the point of the effect. Without it, picking the same folder twice strands a full
   * copy of every image in memory for as long as the document lives.
   */
  const urls = $derived.by(() => {
    const map = new Map<File, string>();
    for (const file of api.acceptedFiles) {
      if (isPreviewableImage(file)) map.set(file, URL.createObjectURL(file));
    }
    return map;
  });

  $effect(() => {
    const current = urls;
    return () => {
      for (const url of current.values()) URL.revokeObjectURL(url);
    };
  });

  /*
   * Incomplete markup: the enhancer stays silent, like the imperative connector it replaces. Every
   * `node()` reads the same `complete`, which is the all-or-nothing rule the two hooks used to state
   * separately - and could therefore state differently.
   */
  const complete = label && dropzone && input && trigger ? { label, dropzone, input, trigger } : null;

  const bindings: PartBinding[] = [
    { part: "root", node: () => (complete ? root : null), props: () => api.getRootProps() },
    { part: "label", node: () => complete?.label, props: () => api.getLabelProps() },
    {
      part: "dropzone",
      node: () => complete?.dropzone,
      props: () => api.getDropzoneProps(),
      events: true,
    },
    { part: "input", node: () => complete?.input, props: () => api.getHiddenInputProps() },
    {
      part: "trigger",
      node: () => complete?.trigger,
      props: () => api.getTriggerProps(),
      events: true,
    },
    {
      part: "clear",
      node: () => (complete ? clear : null),
      props: () => api.getClearTriggerProps(),
      events: true,
      after: (node) => {
        node.hidden = api.acceptedFiles.length === 0;
      },
    },
  ];

  bindParts(bindings);

  /*
   * THE ONE LISTENER `bindParts` DOES NOT COVER, and it keeps its own teardown rather than being bent
   * to fit. `input`'s native `input` event is not in Zag's props: the hidden input is the browser's
   * file picker, and this is how its selection reaches the machine. `bindParts` binds what `connect()`
   * returns; a listener the machine never declared is the enhancer's own, and saying so is cheaper
   * than widening the interface for one case.
   */
  onMount(() => {
    if (!complete) return;
    const selectFiles = () => api.setFiles(Array.from(complete.input.files ?? []));
    complete.input.addEventListener("input", selectFiles);
    return () => complete.input.removeEventListener("input", selectFiles);
  });

  /*
   * THE DROP SURFACE OUTSIDE THIS ROOT, when the author asked for one.
   *
   * `observeFileDrop` and `fileDropTarget` are Core's, the same two functions the React binding
   * calls: the counter, the "Files" filter, the `preventDefault` that stops the browser navigating
   * to the dropped file and the resets for a drag that ends off-window are written once, and what
   * differs between the bindings is only how each one shows the overlay.
   *
   * WHAT THIS ENHANCER TOUCHES IS ONE ATTRIBUTE, `hidden`, on markup the author already wrote. It
   * renders nothing (decision 8), so a page whose tree has no overlay node simply has no overlay,
   * and everything else about the control keeps working.
   */
  /*
   * THE DROPZONE STAYS, AND HIDES ONLY WHEN IT IS FULL. One attribute on the author's own node,
   * which is all this enhancer ever writes into their markup. An earlier revision hid the box on the
   * first file and put the list in its place; that broke dropping a second file where the first one
   * went, which is the thing people do most with this control.
   */
  const maxFiles = Number(root.dataset.maxFiles || (input?.multiple ? Infinity : 1));
  $effect(() => {
    if (complete) complete.dropzone.hidden = dropzoneHiddenAt(api.acceptedFiles.length, maxFiles);
  });

  /*
   * THE LIMITS SAY THEMSELVES, when the author did not say them.
   *
   * The hint is an authored slot, and a hand-typed "hasta 5 MB" is a promise nothing checks: the day
   * `maxFileSize` changes, the sentence lies. So an EMPTY or ABSENT hint gets the line derived from
   * the same numbers the machine rejects with, which is the one sentence that cannot contradict the
   * validator. An author who wrote their own keeps it, untouched.
   *
   * This is the one node this enhancer creates rather than patches, and only when there is something
   * to state: the alternative is the same drift in every page that uses the component.
   */
  onMount(() => {
    if (!complete) return;
    const derived = fileUploadLimitsLabel(limits);
    if (!derived) return;
    let hint = complete.dropzone.querySelector<HTMLElement>(`.${fileUploadParts.hint}`);
    if (hint && hint.textContent?.trim()) return;
    if (!hint) {
      hint = complete.dropzone.ownerDocument.createElement("p");
      hint.className = fileUploadParts.hint;
      complete.dropzone.append(hint);
    }
    hint.textContent = derived;
  });

  /* The rows below carry `data-sk-icon` placeholders; the page's own icon set upgrades them. Same
     hand-off `Calendar.svelte` makes for its own rendered view. */
  $effect(() => {
    void api.acceptedFiles.length;
    remountIcons(root);
  });

  /* `page` scope listens on the document; `zone` leaves the dropzone to the machine that owns it. */
  $effect(() => {
    if (!complete) return;
    const target = fileDropTarget(root.dataset.dropScope, root);
    if (!target) {
      root.removeAttribute("data-dragging");
      return;
    }
    const show = (visible: boolean) => {
      if (overlay) overlay.hidden = !visible;
      root.toggleAttribute("data-dragging", visible);
    };
    const stop = observeFileDrop(target, {
      onDragEnter: () => show(true),
      onDragLeave: () => show(false),
      /* Through the machine, so a dropped file meets the same accept/maxFiles/maxFileSize rules as
       * one chosen from the picker, and added to what is already held rather than replacing it. */
      onDrop: (files) => api.setFiles(filesAfterDrop(api.acceptedFiles, files)),
    });
    return () => {
      stop();
      show(false);
    };
  });
</script>

<!--
  THE CHOSEN FILES, rendered rather than patched, and that is a deliberate exception to "the enhancer
  renders nothing" (decision 8).

  That rule is about AUTHORED structure: markup a person wrote, which the enhancer has no business
  replacing. A list of files is not authored, it exists because somebody just picked files, exactly
  like the month grid `CalendarView.svelte` renders from a date nobody wrote either. The alternative
  is the shape this component actually shipped with: React showed you what you had chosen and the
  vanilla binding showed you nothing, so the one thing a person needs before sending, a look at what
  they are about to send, depended on which binding the page happened to use.

  Part classes come from the contract, so the two bindings paint the same row from the same names.
  The clear button an author wrote stays where they put it: `file-upload.css` gives it `order: 1` so
  it lands after this list in both bindings instead of either one moving somebody else's node.
-->
{#if api.rejectedFiles.length}
  <!-- `role="alert"`: new, unexpected feedback about the choice just made, not a state to revisit.
       The same reasoning, and the same wording source, as the React binding. -->
  <div class={fileUploadParts.rejection} role="alert">
    {#each api.rejectedFiles as rejection (rejection.file.name + rejection.file.lastModified)}
      <p>
        {rejection.file.name}: {rejection.errors
          .map((error: string) => fileUploadErrorMessage(error, limits))
          .join(", ")}
      </p>
    {/each}
  </div>
{/if}

{#if api.acceptedFiles.length}
  <!-- State, over the list it counts. Outside the live region below on purpose: the names are what
       is worth announcing, and a running total after each one is noise. -->
  <p class={fileUploadParts.tally}>{fileUploadTallyLabel(api.acceptedFiles, limits)}</p>
  <!-- `aria-live="polite"`: files arriving and leaving is the one change here that no page load
       announces, and the pattern's own guidance is to say it, politely. -->
  <ul {...api.getItemGroupProps()} class={fileUploadParts.itemGroup} aria-live="polite">
    {#each api.acceptedFiles as file, index (file.name + file.lastModified)}
      <li {...api.getItemProps({ file })} class={fileUploadParts.item}>
        <!-- The frame is the box, the picture or the glyph is what sits in it: a 20px glyph wearing
             the frame's own class shrank the column and pushed that row's text out of line. -->
        <span class={fileUploadParts.itemPreview} aria-hidden="true">
          {#if urls.get(file)}
            <img src={urls.get(file)} alt="" />
          {:else}
            <span data-sk-icon="file" data-sk-icon-size="md"></span>
          {/if}
        </span>
        <span class={fileUploadParts.itemBody}>
          <!-- `title`: a long name is cut with an ellipsis, and this keeps the whole of it reachable. -->
          <span {...api.getItemNameProps({ file })} class={fileUploadParts.itemName} title={file.name}>
            {file.name}
          </span>
          <!-- Under the name, not beside it: two quiet facts about the same file. -->
          <span {...api.getItemSizeTextProps({ file })} class={fileUploadParts.itemSize}>
            <span class={fileUploadParts.itemKind}>{fileKindLabel(file.name)}</span>
            <!-- This kit's own formatter, not the machine's: `api.getFileSize` renders "70 byte" in
                 this locale while the hint above says "5 MB". -->
            {` · ${formatFileSize(file.size)}`}
          </span>
        </span>
        <!-- The kit's own ghost icon button: a default bordered one beside a filename outweighs the
             file it removes. The name is the machine's `aria-label`, so the glyph is decorative. -->
        <button
          {...api.getItemDeleteTriggerProps({ file })}
          onclick={() => {
            /* `deleteFile` rather than the spread's own handler, so both bindings call one public
               method. The row vanishes under the caret, so focus is placed deliberately once the
               shorter list has been drawn. */
            api.deleteFile(file);
            requestAnimationFrame(() => focusAfterFileRemoved(root, index));
          }}
          class="{fileUploadParts.itemDelete} sk-button sk-interactive"
          data-variant="ghost"
          data-size="sm"
          data-icon-only=""
          type="button"
        >
          <span data-sk-icon="close" data-sk-icon-size="sm" aria-hidden="true"></span>
        </button>
      </li>
    {/each}
  </ul>
{/if}
