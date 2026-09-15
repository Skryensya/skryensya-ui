import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * One tooltip per placement, so the four logical sides can be compared at once.
 *
 * A PLAIN CONSTANT, per this directory's README: every string in it is a proper noun. The labels ARE
 * the placement values (`block-start`, `inline-end`), which is the vocabulary the page teaches and is
 * identical in every language, and the content reads "Tooltip", the component's own name.
 */
export const anchorPlacementsTree: UsageTree = {
  /*
   * A PADDED REGION AROUND THE ROW, and it is the demo's own, not the page's.
   *
   * A tooltip asking for `block-start` needs somewhere above the trigger to go, or the browser flips
   * it to `block-end` and the demo shows the fallback rather than the placement it names. That air is
   * part of what this composition IS, so it is a `Box` in the tree and travels with the snippet
   * anyone copies, instead of living only in a rule in this site's stylesheet under a class only this
   * page has.
   */
  contract: "box",
  signature: "Box",
  options: { padding: "xl" },
  /* What is left for the page is the stage's own business: see `anchoring.astro`. */
  attrs: { class: "sk-anchoring-demo" },
  children: {
    contract: "layout",
    signature: "Inline",
    /*
     * THE ROW SAYS WHAT IT IS, in the snippet the reader copies. This used to be four bare tooltips
     * in a default Inline, centred only by a rule in the page's own stylesheet: a reader pasting the
     * emitted HTML got a left-aligned row and no way to tell why the page's looked different.
     * Centring and the gap are Inline options, so they belong in the tree.
     */
    options: { gap: "xl", inlineAlign: "center", justify: "center" },
    children: ["block-start", "block-end", "inline-start", "inline-end"].map((placement) => ({
      contract: "tooltip",
      signature: "Tooltip",
      options: { placement, arrow: true },
      slots: {
        /*
         * A PLAIN BUTTON. It used to carry `class="sk-tooltip__trigger"`, which Tooltip's own
         * template already writes on the `<span>` it wraps this in: the emitted markup came out with
         * the part claimed twice, once by the wrapper that is the trigger and once by a button
         * inside it that is not, and that is what a reader saw when they opened the code.
         */
        children: {
          contract: "button",
          signature: "Button.action",
          children: placement,
        },
        content: "Tooltip",
      },
    })),
  },
};
