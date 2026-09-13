import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * THE TREES THE ARCHIVED BUTTON PAGE SHOWED, as they read at the cut.
 *
 * They are here as the INPUT to `scripts/freeze-archive-code.ts`, which emits both bindings once and
 * writes the strings to `button.emitted.json`. The page renders that JSON, never these trees: a tree
 * emitted at render time would be emitted by TODAY's compiler against TODAY's contract, which is
 * exactly the thing an archive must not do. The output is the frozen artefact; the input is kept so
 * a regeneration is possible and reviewable rather than a retype.
 *
 * They are deliberately the version-1 shape: three sizes and no `pre`/`post` slots, because neither
 * `xs` nor the slots existed when this cut was taken.
 */

/** The four emphases, one row, in the neutral tone. */
export const variantsTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", align: "center" },
  children: (["solid", "soft", "ghost", "translucent"] as const).map((variant) => ({
    contract: "button",
    signature: "Button.action",
    options: variant === "solid" ? {} : { variant },
    children: "Save",
  })),
};

/** The three sizes this version had. */
export const sizesTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", align: "center" },
  children: (["sm", "md", "lg"] as const).map((size) => ({
    contract: "button",
    signature: "Button.action",
    options: size === "md" ? {} : { size },
    children: "Save",
  })),
};

/** The same component as a link: an `href` is what changes the host element. */
export const linkTree: UsageTree = {
  contract: "button",
  signature: "Button.navigation",
  options: { href: "/first-component", variant: "outline" },
  children: "Read the guide",
};

/** Every tree this page shows, keyed the way the emitted JSON is keyed. */
export const archivedButtonTrees = {
  variants: variantsTree,
  sizes: sizesTree,
  link: linkTree,
} satisfies Record<string, UsageTree>;
