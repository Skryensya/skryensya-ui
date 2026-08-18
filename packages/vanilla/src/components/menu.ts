import Menu from "./Menu.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Menu roots; it never scans or imports another enhancer. */
export const mountMenu = createSvelteMount({
  key: "menu",
  rootSelector: "[data-sk-menu]",
  Component: Menu,
});
