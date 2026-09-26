import Clipboard from "./Clipboard.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts `CopyButton` and `Clipboard` roots alike: one machine, two authored shapes. */
export const mountClipboard = createSvelteMount({
  key: "clipboard",
  rootSelector: "[data-sk-clipboard]",
  Component: Clipboard,
});
