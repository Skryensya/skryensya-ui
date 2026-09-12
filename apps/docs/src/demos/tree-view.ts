import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  treeViewDisabledNodes,
  treeViewMinimalNodes,
  treeViewProjectNodes,
} from "./data/tree-view";
import { namePart } from "./annotation-parts";

/* TreeView state, hierarchy, disabled nodes and event feedback share one node model, which is data:
 * see `data/tree-view.ts`. */

/*
 * A branch open and a leaf selected, with icons: enough of the tree's own parts to name the control,
 * the branch and the item without drowning the frame in a deep project tree.
 */
export const treeViewAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("treeViewPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "tree-view",
      signature: "TreeView",
      options: {
        label: t("demo.treeView.label"),
        defaultExpandedValue: "src",
        defaultSelectedValue: "index.ts",
      },
      slots: {
        branchIndicator: {
          contract: "icon",
          signature: "Icon",
          options: { name: "chevron-right", size: "sm" },
        },
        branchIcon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "folder", size: "sm" },
        },
        leafIcon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "file", size: "sm" },
        },
        items: treeViewMinimalNodes,
      },
    },
    items: [
      namePart(".sk-tree-view", "block-start"),
      namePart(".sk-tree-view__tree", "inline-start"),
      namePart(".sk-tree-view__branch-control", "inline-start"),
      namePart(".sk-tree-view__branch-indicator", "inline-start"),
      namePart(".sk-tree-view__branch-text", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-tree-view__branch-content", "block-end"),
      namePart(".sk-tree-view__item", "inline-end"),
      namePart(".sk-tree-view__item-text", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

export const treeViewMinimalTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: { label: t("demo.treeView.label") },
  slots: { items: treeViewMinimalNodes },
});

export const treeViewInitialTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: {
    label: t("demo.tree.initialLabel"),
    defaultExpandedValue: "src,src/components",
    defaultSelectedValue: "src/components/button.tsx",
  },
  slots: { items: treeViewProjectNodes(t) },
});

export const treeViewMultipleTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: {
    label: t("demo.tree.multipleLabel"),
    selectionMode: "multiple",
    defaultExpandedValue: "src,src/components",
    defaultSelectedValue: "src/components/button.tsx,README.md",
  },
  slots: { items: treeViewProjectNodes(t) },
});

export const treeViewDisabledTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: {
    label: t("demo.tree.disabledLabel"),
    defaultExpandedValue: "src",
  },
  slots: { items: treeViewDisabledNodes(t) },
});

export const treeViewEventsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: { "data-tree-events": "" },
  children: [
    {
      contract: "tree-view",
      signature: "TreeView",
      options: {
        label: t("demo.tree.filesLabel"),
        defaultExpandedValue: "src",
      },
      slots: {
        branchIndicator: {
          contract: "icon",
          signature: "Icon",
          options: { name: "chevron-right", size: "sm" },
        },
        branchIcon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "folder", size: "sm" },
        },
        leafIcon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "file", size: "sm" },
        },
        items: treeViewProjectNodes(t),
      },
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          attrs: { role: "status", "data-tree-selection": "" },
          children: `${t("demo.tree.selection")}: ·`,
        },
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          attrs: { role: "status", "data-tree-expansion": "" },
          children: `${t("demo.tree.expansion")}: ·`,
        },
      ],
    },
  ],
});

export { default as treeViewEventsScript } from "./scripts/tree-view-events.ts?raw";
