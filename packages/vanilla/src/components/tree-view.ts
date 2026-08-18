import TreeView from "./TreeView.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TreeView roots; it never scans or imports another enhancer. */
export const mountTreeView = createSvelteMount({
  key: "tree-view",
  rootSelector: "[data-sk-tree-view]",
  Component: TreeView,
});
