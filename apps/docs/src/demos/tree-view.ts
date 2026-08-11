import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* TreeView state, hierarchy, disabled nodes and event feedback share one node model. */
export const treeViewMinimalTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: { label: t("demo.treeView.label") },
  slots: {
    items: [
      {
        options: { id: "src" },
        slots: {
          label: "src",
          children: [
            { options: { id: "index.ts" }, slots: { label: "index.ts" } },
            { options: { id: "app.ts" }, slots: { label: "app.ts" } },
          ],
        },
      },
      { options: { id: "README.md" }, slots: { label: "README.md" } },
    ],
  },
});

const projectItems = (t: Translate) => [
  {
    options: { id: "src" },
    slots: {
      label: t("demo.tree.source"),
      children: [
        {
          options: { id: "src/components" },
          slots: {
            label: t("demo.tree.components"),
            children: [
              {
                options: { id: "src/components/button.tsx" },
                slots: { label: t("demo.tree.buttonFile") },
              },
            ],
          },
        },
        { options: { id: "src/index.ts" }, slots: { label: t("demo.tree.indexFile") } },
      ],
    },
  },
  { options: { id: "README.md" }, slots: { label: "README.md" } },
];

export const treeViewInitialTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: {
    label: t("demo.tree.initialLabel"),
    defaultExpandedValue: "src,src/components",
    defaultSelectedValue: "src/components/button.tsx",
  },
  slots: { items: projectItems(t) },
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
  slots: { items: projectItems(t) },
});

export const treeViewDisabledTree = (t: Translate): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: {
    label: t("demo.tree.disabledLabel"),
    defaultExpandedValue: "src",
  },
  slots: {
    items: [
      {
        options: { id: "src" },
        slots: {
          label: t("demo.tree.source"),
          children: [
            {
              options: { id: "src/legacy", disabled: true },
              slots: { label: t("demo.tree.disabledFolder") },
            },
            { options: { id: "src/index.ts" }, slots: { label: t("demo.tree.indexFile") } },
          ],
        },
      },
    ],
  },
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
        items: projectItems(t),
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

export const treeViewEventsScript = `
const demo = document.querySelector("[data-tree-events]");
demo?.addEventListener("click", (event) => {
  const branch = event.target.closest("[data-sk-tree-view-branch]");
  const item = event.target.closest("[data-sk-tree-view-item]");
  if (branch) {
    const output = demo.querySelector("[data-tree-expansion]");
    output.textContent = output.textContent.split(":")[0] + ": " + branch.dataset.value;
  } else if (item) {
    const output = demo.querySelector("[data-tree-selection]");
    output.textContent = output.textContent.split(":")[0] + ": " + item.dataset.value;
  }
});
`;
