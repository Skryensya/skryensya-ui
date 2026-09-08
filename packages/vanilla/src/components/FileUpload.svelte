<script lang="ts">
  import { fileUpload } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
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

  // Captured ONCE, never re-read from the DOM: `getRootProps().id` returns a namespaced id that
  // `applyZagProps` writes back onto `root.id`. Reading it live from `useMachine`'s reactive factory
  // would feed that prefix back on every recomputation.
  const machineId = root.id || uniqueId("sk-file-upload");

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
    allowDrop: !root.hasAttribute("data-disable-drop"),
    directory: input?.hasAttribute("webkitdirectory"),
    onFileChange(details: { acceptedFiles: File[]; rejectedFiles: unknown[] }) {
      root.dispatchEvent(
        new CustomEvent("sk-file-change", {
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

  // Incomplete markup: the enhancer stays silent, like the imperative connector it replaces.
  $effect(() => {
    if (!label || !dropzone || !input || !trigger) return;
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(dropzone, api.getDropzoneProps() as DomProps);
    applyZagProps(input, api.getHiddenInputProps() as DomProps);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (clear) {
      applyZagProps(clear, api.getClearTriggerProps() as DomProps);
      clear.hidden = api.acceptedFiles.length === 0;
    }
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (!dropzone || !input || !trigger) return;
    cleanups.push(bindZagEvents(dropzone, () => api.getDropzoneProps() as DomProps));
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
    if (clear) cleanups.push(bindZagEvents(clear, () => api.getClearTriggerProps() as DomProps));

    const selectFiles = () => api.setFiles(Array.from(input.files ?? []));
    input.addEventListener("input", selectFiles);
    cleanups.push(() => input.removeEventListener("input", selectFiles));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
