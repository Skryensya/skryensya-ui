import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * AN ADDRESS FOR ONE EXAMPLE, derived from the example itself.
 *
 * A preview's own id is `slugify(label)`, and the label is prose written beside the tree, so nothing
 * outside the page can predict it. The playground holds the same TREE the page renders (both call the
 * same factory in `src/demos/` with the same `t`), so the tree is the one thing both sides can hash
 * to the same answer without either knowing the other's names.
 *
 * FNV-1a, not `node:crypto`: this runs in a build-time Astro component and in the playground's
 * catalogue endpoint alike, and needs no runtime of its own. 32 bits is plenty for "which of this
 * page's twenty demos"; the id is an anchor, not an integrity check.
 *
 * Keys sorted at every depth so a reordered literal is still the same example. A tree whose factory
 * got DIFFERENT arguments on each side (real hrefs on the page, `#` in the playground) hashes
 * differently, and that link lands on the page instead of the demo: less precise, never broken.
 */
export function treeAnchorId(tree: UsageTree): string {
  const json = JSON.stringify(tree, (_key, value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : value,
  );
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `tree-${(hash >>> 0).toString(36)}`;
}
