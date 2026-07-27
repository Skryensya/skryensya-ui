import { fileUpload } from "@skryensya/core/machines";
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla";
import {
  applyZagProps,
  bindZagEvents,
  type DomProps,
} from "../runtime/apply.js";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-file-upload]",
  label: "[data-sk-file-upload-label]",
  dropzone: "[data-sk-file-upload-dropzone]",
  input: "[data-sk-file-upload-input]",
  trigger: "[data-sk-file-upload-trigger]",
  clear: "[data-sk-file-upload-clear]",
} as const;
function connect(root: HTMLElement): () => void {
  const label = root.querySelector<HTMLElement>(selector.label);
  const dropzone = root.querySelector<HTMLElement>(selector.dropzone);
  const input = root.querySelector<HTMLInputElement>(selector.input);
  const trigger = root.querySelector<HTMLButtonElement>(selector.trigger);
  const clear = root.querySelector<HTMLButtonElement>(selector.clear);
  if (!label || !dropzone || !input || !trigger) return () => {};
  const accept = input.accept
    ? input.accept
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;
  const machine = new VanillaMachine(fileUpload.machine, {
    id: root.id || uniqueId("sk-file-upload"),
    name: input.name || undefined,
    accept,
    disabled: input.disabled,
    required: input.required,
    maxFiles: Number(root.dataset.maxFiles || (input.multiple ? Infinity : 1)),
    maxFileSize: Number(root.dataset.maxFileSize || Infinity),
    allowDrop: !root.hasAttribute("data-disable-drop"),
    directory: input.hasAttribute("webkitdirectory"),
    onFileChange(details) {
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
  });
  machine.start();
  const getApi = () => fileUpload.connect(machine.service, normalizeProps);
  const sync = () => {
    const api = getApi();
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(dropzone, api.getDropzoneProps() as DomProps);
    applyZagProps(input, api.getHiddenInputProps() as DomProps);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (clear) {
      applyZagProps(clear, api.getClearTriggerProps() as DomProps);
      clear.hidden = api.acceptedFiles.length === 0;
    }
  };
  const cleanups = [
    bindZagEvents(dropzone, () => getApi().getDropzoneProps() as DomProps),
    bindZagEvents(trigger, () => getApi().getTriggerProps() as DomProps),
    ...(clear
      ? [
          bindZagEvents(
            clear,
            () => getApi().getClearTriggerProps() as DomProps,
          ),
        ]
      : []),
  ];
  const selectFiles = () => getApi().setFiles(Array.from(input.files ?? []));
  input.addEventListener("input", selectFiles);
  cleanups.push(() => input.removeEventListener("input", selectFiles));
  const unsubscribe = machine.subscribe(sync);
  sync();
  return () => {
    unsubscribe();
    for (const cleanup of cleanups) cleanup();
    machine.stop();
  };
}
export const mountFileUpload = createConnectMount({
  key: "file-upload",
  rootSelector: selector.root,
  connect,
});
