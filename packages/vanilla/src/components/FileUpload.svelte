<script lang="ts">
  import { fileUpload } from "@skryensya/core/machines";
  import { fileUploadEvents } from "@skryensya/core/file-upload";
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
</script>
