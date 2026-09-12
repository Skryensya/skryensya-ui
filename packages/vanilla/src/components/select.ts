import Select from "./Select.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { selectAttrs } from "@skryensya/core/select";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Select roots; it never scans or imports another enhancer. */
export const mountSelect = createSvelteMount({
  key: "select",
  rootSelector: rootSelectorFor(selectAttrs),
  Component: Select,
});
