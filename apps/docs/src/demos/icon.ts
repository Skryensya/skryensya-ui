import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * Role names and sizes are the same in every language, so these are constants — a `t` argument
 * would only be a parameter nobody uses.
 */

/** Five roles at large size: the vocabulary, not the drawings. */
export const iconTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "icon", signature: "Icon", options: { name: "search", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "warning", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "close", size: "lg" } },
  ],
};

/** The three named sizes of one hook. */
export const iconSizeTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
    { contract: "icon", signature: "Icon", options: { name: "check" } },
    { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
  ],
};
