import type { UsageTree } from "@skryensya/core/usage-tree";
import { stableIconNames } from "@skryensya/core/icon";

/*
 * The whole stable icon vocabulary, one cell per role, with the role's own name under it.
 *
 * A PLAIN CONSTANT and not a factory, per this directory's README: there is nothing to translate.
 * Every string in it is an icon ROLE (`chevron-down`, `search`), which is the same token in every
 * language and is exactly what the page is teaching you to type. A `demo.*` key for each would be
 * 40-odd identity entries that can only rot.
 */
export const iconVocabTree: UsageTree = {
  contract: "layout",
  signature: "Grid",
  options: { gap: "md" },
  children: stableIconNames.map((name) => ({
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs", align: "center" },
    children: [
      { contract: "icon", signature: "Icon", options: { name, size: "lg" } },
      { contract: "typography", signature: "Code", children: name },
    ],
  })),
};
