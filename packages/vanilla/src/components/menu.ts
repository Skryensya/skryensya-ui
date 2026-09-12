import Menu from "./Menu.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { menuAttrs } from "@skryensya/core/menu";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Menu roots; it never scans or imports another enhancer. */
export const mountMenu = createSvelteMount({
  key: "menu",
  rootSelector: rootSelectorFor(menuAttrs),
  Component: Menu,
});
