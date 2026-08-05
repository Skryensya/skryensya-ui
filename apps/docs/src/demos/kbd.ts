import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * Four keys. A constant, not a factory: there is nothing here to translate; a glyph and the words
 * printed on a physical keyboard are the same in both languages, so a `t` argument would only be a
 * parameter nobody uses.
 */
export const kbdTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    { contract: "kbd", signature: "Kbd", children: "K" },
    { contract: "kbd", signature: "Kbd", children: "Esc" },
    { contract: "kbd", signature: "Kbd", children: "↵" },
  ],
};
