import { fadeEdgeAttrs, fadeEdgeHasMore, type FadeEdgeDirection } from "./fade-edge.js";

/*
 * FADE EDGE, the DOM half both bindings run. Kept out of `fade-edge.ts` because that file is a
 * contract the compiler imports, and the compiler has no DOM. Same split as `feed-dom.ts`.
 */

function sync(root: HTMLElement): void {
  const direction = (root.getAttribute(fadeEdgeAttrs.direction) ?? "to-bottom") as FadeEdgeDirection;
  const more = fadeEdgeHasMore(
    {
      scrollTop: root.scrollTop,
      scrollLeft: root.scrollLeft,
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      clientWidth: root.clientWidth,
      clientHeight: root.clientHeight,
      rtl: getComputedStyle(root).direction === "rtl",
    },
    direction,
  );
  root.toggleAttribute(fadeEdgeAttrs.atEdge, !more);
}

/**
 * Keep `data-at-edge` true to the scroll position of `root`, which must be the scroll container.
 * Returns the cleanup, and removes the attribute on the way out so an unwatched fade paints again.
 *
 * Three things move the answer: scrolling, the box resizing, and the content growing or shrinking.
 * The last one is why the children are observed too: a feed that loads more rows does not resize
 * a scroller of fixed height, it only makes the scroll longer.
 */
export function watchFadeEdge(root: HTMLElement): () => void {
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      sync(root);
    });
  };

  sync(root);
  root.addEventListener("scroll", schedule, { passive: true });

  const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
  const observeChildren = () => {
    if (!resize) return;
    resize.disconnect();
    resize.observe(root);
    for (const child of Array.from(root.children)) resize.observe(child);
  };
  observeChildren();

  /* A direction flipped at runtime changes which edge counts; new children need observing. */
  const mutations =
    typeof MutationObserver === "undefined"
      ? undefined
      : new MutationObserver(() => {
          observeChildren();
          schedule();
        });
  mutations?.observe(root, { childList: true, attributes: true, attributeFilter: [fadeEdgeAttrs.direction] });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    root.removeEventListener("scroll", schedule);
    resize?.disconnect();
    mutations?.disconnect();
    root.removeAttribute(fadeEdgeAttrs.atEdge);
  };
}
