/*
 * The React demo for a usage tree: one module for every tree-driven preview on the site.
 *
 * There is no per-page demo file because there is nothing per-page to write: the tree IS the demo.
 * It crosses into the frame's realm as JSON, which is what a usage tree already is, and the frame
 * renders it with the same `renderTree` the gates measure. So the demo a reader watches and the
 * evidence G2 collects are the same call, not two implementations that happen to agree.
 *
 * `renderTree` is imported LAZILY, not at the top of this file. `ComponentPreview.astro` imports
 * `TreeDemo` (the thin `Framed` iframe wrapper) into the PARENT document for every tree-driven
 * preview on a page; the inner function below only ever runs inside the isolated frame, which loads
 * this same module a second time through its own glob. A static import here made both loads pay for
 * `render-tree.tsx`'s full component graph (every published family, ~60 modules) even though the
 * parent copy never calls it, measured at several hundred KB of JS on the FIRST preview of any
 * page. `render-tree.tsx` itself stays static inside: the closed, catalogue-verified module map that
 * comment argues for is unchanged, this only defers WHEN the one low-value call site loads it.
 *
 * The lazy load is a plain `preload()` export, not `React.lazy` + `Suspense`. `Suspense` committed
 * an EMPTY fallback the instant the frame's React root first flushed, which is exactly the render
 * `fitFrame()` measures for its first two passes (see `component-preview-frame.ts`); the real
 * content then arrived later via a DOM mutation, after the stage had already left its
 * loading/hidden state, so the CSS transition that only exists for legitimate resizes animated a
 * visible jump instead: the flicker between the two bindings. `mountReactDemo()` awaits `preload()`
 * before it ever calls `flushSync`, so the tree is already loaded the one time this renders.
 */
import { menuAttrs } from "@skryensya/core/menu";
import type { UsageTree } from "@skryensya/ai-compiler/usage-tree";
import { framedIn, type FramedOverrides } from "./framed";

/*
 * `component-preview-frame.ts` mirrors the devtools "Safety triangle" toggle onto THIS frame's own
 * `<html>` as `data-sk-menu-debug-intent` (see that file's `rootAttributes` list), the same attribute
 * `Menu.svelte` reads with `root.closest(...)` at mount to decide its Vanilla debug flag. React's
 * `debugSafetyTriangle` has no such DOM fallback. It is a controlled prop, by design (see
 * `menu.tsx`'s doc comment), so a tree-driven Menu demo never saw the toggle at all. This is the one
 * place a tree crosses from data into a live render, so it is the one place to fold the mirrored
 * attribute back in, the same way the tree's own `debugSafetyTriangle: true` (the dedicated safety
 * demo) already does.
 */
function withLiveSafetyTriangle(tree: UsageTree): UsageTree {
  if (tree.contract !== "menu") return tree;
  if (!document.documentElement.hasAttribute(menuAttrs.debugSafetyTriangle)) return tree;
  return { ...tree, options: { ...tree.options, debugSafetyTriangle: true } };
}

let renderTreeModule: typeof import("@skryensya/react/render-tree") | undefined;

/** Awaited by `mountReactDemo()` before it renders. See the note above for why. */
export async function preload(): Promise<void> {
  renderTreeModule ??= await import("@skryensya/react/render-tree");
}

/*
 * The module key, written out instead of taken from `import.meta.url`.
 *
 * Every other demo is imported by a PAGE, so Vite keeps it as its own chunk and `import.meta.url`
 * reports a stem the frame's glob knows. This one is imported by `ComponentPreview.astro`, which inlines it:
 * in a build `import.meta.url` reported `Showcase_CBJVDNqQ` (the chunk was still named that at
 * the time; it is `ComponentPreview` now), the frame could not resolve it, and
 * the React stage came up empty with the error inside the frame where nobody was looking.
 *
 * The glob is keyed by SOURCE basename, so this is that key, and it cannot drift: rename the file
 * and the frame stops finding it, exactly as it should.
 */
const framed = framedIn("tree.tsx");

export interface TreeDemoProps {
  tree: UsageTree;
  /** Cap the stage width. Read by `framed()`, never by this component. See `framed.tsx`. */
  measure?: string;
  /** Stage settings supplied by the ComponentPreview call site and consumed by `framed()`. */
  frameOptions?: FramedOverrides;
}

/*
 * The wrapper's export name has to BE the inner function's name: the frame is told which export to
 * import, and `framed()` reads that name off the component it wraps. A differently named inner
 * function makes the frame ask for an export the module does not have, and the stage comes up empty
 * with no error, which is exactly what it did.
 */
export const TreeDemo = framed(function TreeDemo({ tree }: TreeDemoProps) {
  if (!renderTreeModule) {
    // mountReactDemo() always awaits preload() first; this only fires if TreeDemo is rendered
    // some other way, and a loud failure beats a silently empty stage.
    throw new Error("TreeDemo rendered before preload() resolved.");
  }
  return <>{renderTreeModule.renderTree(withLiveSafetyTriangle(tree))}</>;
});
