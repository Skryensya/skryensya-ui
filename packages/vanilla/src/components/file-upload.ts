import FileUpload from "./FileUpload.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored FileUpload roots; it never scans or imports another enhancer. */
export const mountFileUpload = createSvelteMount({
  key: "file-upload",
  rootSelector: "[data-sk-file-upload]",
  Component: FileUpload,
});
