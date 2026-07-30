import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Only the minimum tree is expressible today. The remaining demos intentionally stay authored:
 * initial state needs expandedValue/selectedValue, the disabled example needs expandedValue to
 * reveal its disabled child, and the events example also needs per-node icons plus an output sibling.
 */
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
