/*
 * WHAT TO CALL THE COMPONENT IN AN EMITTED REACT SNIPPET.
 *
 * Every snippet is a component now, so every snippet needs a name, and the emitter's own fallback is
 * the tree's ROOT signature, which is right for `menuTree` (a Menu) and wrong for half the
 * catalogue: the Placeholder demos are composed inside a Box, the Tabs one inside a Stack, and
 * naming them `BoxExample` and `StackExample` points at the wrapper instead of at the subject.
 *
 * The page knows the subject and the URL already spells it. Not the preview's `label`, which is a
 * translated phrase ("Un ítem a la vez"): a name built from that would be a different identifier on
 * each locale's page, for no reason a reader could see.
 */

/** `/components/tree-view` and `/en/components/tree-view` → `TreeViewExample`. */
export function exampleComponentName(url: URL): string | undefined {
  const slug = url.pathname.replace(/\/+$/, "").split("/").pop();
  if (!slug) return undefined;

  const name = slug
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join("");

  // A name has to start with a letter to be an identifier at all; a route that cannot give one
  // (a numeric segment, an empty index) falls back to whatever the emitter derives from the tree.
  return /^[A-Za-z]/.test(name) ? `${name}Example` : undefined;
}
