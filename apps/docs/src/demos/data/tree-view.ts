import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * THE NODE MODELS EVERY TREEVIEW DEMO BROWSES.
 *
 * Five demos, three shapes: the tree is the data and the compositions differ only in what they
 * declare ABOUT it, which nodes start expanded, whether selection is multiple, which icons stand
 * beside a branch. Keeping the nodes here is what lets `tree-view.ts` say that in three lines each.
 */

/** Bare file names, so the demo is about the shape of a tree and nothing else. */
export const treeViewMinimalNodes: readonly ItemInput[] = [
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
];

/** The project shared by the expansion, multiple-selection and events demos. */
export const treeViewProjectNodes = (t: Translate): readonly ItemInput[] => [
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

/** One unavailable folder: `disabled` belongs to the NODE, which is why it lives in the data. */
export const treeViewDisabledNodes = (t: Translate): readonly ItemInput[] => [
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
];
