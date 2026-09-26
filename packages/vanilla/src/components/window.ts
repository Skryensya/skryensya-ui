import Window from "./Window.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { windowAttrs } from "@skryensya/core/window";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Window roots; it never scans or imports another enhancer. */
export const mountWindow = createSvelteMount({
  key: "window",
  rootSelector: rootSelectorFor(windowAttrs),
  Component: Window,
});
