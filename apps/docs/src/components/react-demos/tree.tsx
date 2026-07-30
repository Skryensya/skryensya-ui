/*
 * The React demo for a usage tree — one module for every tree-driven preview on the site.
 *
 * There is no per-page demo file because there is nothing per-page to write: the tree IS the demo.
 * It crosses into the frame's realm as JSON, which is what a usage tree already is, and the frame
 * renders it with the same `renderTree` the gates measure. So the demo a reader watches and the
 * evidence G2 collects are the same call, not two implementations that happen to agree.
 */
import { renderTree } from "@skryensya/react/render-tree";
import type { UsageTree } from "@skryensya/ai-compiler/usage-tree";
import { framedIn } from "./framed";

/*
 * The module key, written out instead of taken from `import.meta.url`.
 *
 * Every other demo is imported by a PAGE, so Vite keeps it as its own chunk and `import.meta.url`
 * reports a stem the frame's glob knows. This one is imported by `ComponentPreview.astro`, which inlines it
 * — in a build `import.meta.url` reported `Showcase_CBJVDNqQ` (the chunk was still named that at
 * the time; it is `ComponentPreview` now), the frame could not resolve it, and
 * the React stage came up empty with the error inside the frame where nobody was looking.
 *
 * The glob is keyed by SOURCE basename, so this is that key, and it cannot drift: rename the file
 * and the frame stops finding it, exactly as it should.
 */
const framed = framedIn("tree.tsx");

export interface TreeDemoProps {
  tree: UsageTree;
  /** Cap the stage width — read by `framed()`, never by this component. See `framed.tsx`. */
  measure?: string;
}

/*
 * The wrapper's export name has to BE the inner function's name: the frame is told which export to
 * import, and `framed()` reads that name off the component it wraps. A differently named inner
 * function makes the frame ask for an export the module does not have, and the stage comes up empty
 * with no error — which is exactly what it did.
 */
export const TreeDemo = framed(function TreeDemo({ tree }: TreeDemoProps) {
  return <>{renderTree(tree)}</>;
});
