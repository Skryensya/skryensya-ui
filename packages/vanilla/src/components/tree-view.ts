import TreeView from "./TreeView.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { treeViewAttrs } from "@skryensya/core/tree-view";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TreeView roots; it never scans or imports another enhancer. */
export const mountTreeView = createSvelteMount({
  key: "tree-view",
  rootSelector: rootSelectorFor(treeViewAttrs),
  Component: TreeView,
});
