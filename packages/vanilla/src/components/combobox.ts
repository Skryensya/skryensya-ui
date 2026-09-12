import Combobox from "./Combobox.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { comboboxAttrs } from "@skryensya/core/combobox";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Combobox roots; it never scans or imports another enhancer. */
export const mountCombobox = createSvelteMount({
  key: "combobox",
  rootSelector: rootSelectorFor(comboboxAttrs),
  Component: Combobox,
});
