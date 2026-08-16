import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/**
 * The file tree the resizable Sidebar demo browses.
 *
 * File names are file names: only the deliberately long one is a translation, because its whole job
 * is to be long enough to be truncated by the rail, and how long that takes depends on the language.
 */
export const sidebarFileNodes = (t: Translate): readonly ItemInput[] => [
  {
    options: { id: "src" },
    slots: {
      label: "src",
      children: [
        {
          options: { id: "src/components" },
          slots: {
            label: "components",
            children: [
              { options: { id: "src/components/button.tsx" }, slots: { label: "button.tsx" } },
              {
                options: { id: "src/components/long" },
                slots: { label: t("demo.sidebar.longFile") },
              },
            ],
          },
        },
        { options: { id: "src/index.ts" }, slots: { label: "index.ts" } },
      ],
    },
  },
  { options: { id: "README.md" }, slots: { label: "README.md" } },
];
