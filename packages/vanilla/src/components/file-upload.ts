import FileUpload from "./FileUpload.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { fileUploadAttrs } from "@skryensya/core/file-upload";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored FileUpload roots; it never scans or imports another enhancer. */
export const mountFileUpload = createSvelteMount({
  key: "file-upload",
  rootSelector: rootSelectorFor(fileUploadAttrs),
  Component: FileUpload,
});
