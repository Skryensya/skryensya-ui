import {
  folderAttrs,
  folderClipPath,
  folderGeometryFrom,
  folderGroundFrom,
  folderTailFrom,
  folderParts,
  folderPath,
  folderTabEndFrom,
} from "@skryensya/core/folder";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * FOLDER, the Vanilla enhancer: measure the box, measure the tab, draw the silhouette.
 *
 * No machine and no Svelte component. There is no state here for runes to own - a folder holds no
 * value, opens nothing, and its two visual states (`:hover`, `:focus-within`) are the stylesheet's
 * to answer. What is left is one measurement that authored markup cannot express, which is exactly
 * what an ordinary imperative enhancer is for, the same shape `toolbar.ts` takes.
 *
 * The geometry itself is NOT here: `folderPath` lives in `@skryensya/core/folder` and the React
 * binding calls the identical function with the identical numbers. That is what makes the two
 * bindings one component rather than two drawings that resemble each other, and it is checked -
 * `packages/ai-gates` renders both and compares the DOM attribute by attribute, `d` included.
 */

function connect(root: HTMLElement): () => void {
  const shape = root.querySelector<SVGSVGElement>(`[${folderAttrs.shape}]`);
  const path = root.querySelector<SVGPathElement>(`[${folderAttrs.path}]`);
  const tab = root.querySelector<HTMLElement>(`[${folderAttrs.tab}]`);
  if (!shape || !path || !tab) {
    throw new Error(
      `[${folderAttrs.root}] necesita un [${folderAttrs.shape}] con su [${folderAttrs.path}] y un [${folderAttrs.tab}].`,
    );
  }

  const draw = () => {
    /*
     * `offsetWidth`/`offsetHeight`, never `getBoundingClientRect()`: the rect is the TRANSFORMED
     * box, so a folder inside any scaled ancestor (the docs' own preview frame scales to fit)
     * measures smaller than it lays out and the silhouette is drawn to the wrong number. Measured
     * live: a 108px-tall folder in a 0.9 preview drew a 97px path, corners visibly squashed.
     */
    const width = root.offsetWidth;
    const height = root.offsetHeight;
    const styles = getComputedStyle(root);
    const geometry = folderGeometryFrom(styles);
    const d = folderPath({
      ...geometry,
      // The tab is as tall as its label plus its own padding, so the FOLD is measured too, not
      // read off the stylesheet: a title a size larger than the hook expected would otherwise
      // hang over its own crease. The hook stays the tab's minimum.
      tabHeight: tab.offsetHeight || geometry.tabHeight,
      width,
      height,
      tabEnd: folderTabEndFrom(root, tab, styles.direction === "rtl"),
      // A folder's tab sits at the INLINE-START edge, which is the right-hand side in an RTL
      // document. Read off the computed direction rather than taken as an option: the document
      // already says this, and an author restating it is an author who can contradict it.
      mirror: styles.direction === "rtl",
    });
    // An unmeasurable folder (a `display: none` ancestor, a zero-height box mid-transition) keeps
    // whatever it last drew rather than being blanked: the shape it had is a better answer than no
    // shape at all, and the next real measurement replaces it.
    if (!d) return;
    shape.setAttribute("viewBox", `0 0 ${width} ${height}`);
    path.setAttribute("d", d);
    root.style.setProperty("--sk-folder-clip", folderClipPath(d));
    // The ground the folder is invisible against at rest. Read here rather than named in the
    // stylesheet because no rule can ask what colour is behind an element; `null` leaves the
    // property unset so `folder.css`'s own default stands.
    const ground = folderGroundFrom(root, (element) => {
      const style = getComputedStyle(element);
      return { color: style.backgroundColor, image: style.backgroundImage };
    });
    if (ground) root.style.setProperty("--sk-folder-ground", ground);
    else root.style.removeProperty("--sk-folder-ground");
    /*
     * How much of this folder's empty tail the next one may hide. Measured, because the height of
     * the copy is what decides whether a stack reads as stacked or as clipped, and a single tuned
     * number cannot know it. `folder.css` reads it as a negative bottom margin.
     */
    const content = root.querySelector<HTMLElement>(`.${folderParts.content}`);
    const contentBottom = content ? content.offsetTop + content.offsetHeight : height;
    const breathing = Number.parseFloat(styles.getPropertyValue("--sk-folder-inset-y")) || 0;
    // The tilt turns about the BOTTOM edge, so the top rises and the painted box comes out
    // TALLER than the layout one. That difference is exactly how much sooner the next folder arrives.
    const foreshortening = Math.max(0, root.getBoundingClientRect().height - height);
    root.style.setProperty(
      "--sk-folder-tail",
      `${folderTailFrom(height, contentBottom, breathing, foreshortening)}px`,
    );
    root.setAttribute(folderAttrs.ready, "");
  };

  draw();

  if (typeof ResizeObserver === "undefined") return () => {};
  /*
   * BOTH boxes, because they change for different reasons and neither implies the other: the root's
   * height follows its content and its width follows the page, while the tab's width follows the
   * label's text and the font it is finally rendered in. A folder measured before its webfont loads
   * has its tab drawn around the fallback's metrics, and nothing about the root's box changes when
   * that swap lands - the bug a root-only observer would ship.
   */
  const observer = new ResizeObserver(draw);
  observer.observe(root);
  observer.observe(tab);
  return () => observer.disconnect();
}

export const mountFolder = createConnectMount({
  key: "folder",
  rootSelector: `[${folderAttrs.root}]`,
  connect,
});

export { folderParts };
