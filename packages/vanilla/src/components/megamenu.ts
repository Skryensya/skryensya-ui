import { anchorNameFor, bindAnchor } from "@skryensya/core/anchored";
import { imageFrameParts } from "@skryensya/core/image-frame";
import { megamenuAttrs, megamenuParts } from "@skryensya/core/megamenu";
import { resolveMegamenuEvent, type MegamenuEvent, type MegamenuState } from "@skryensya/core/megamenu";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

/*
 * MEGAMENU — no `@zag-js/*` machine, by design (`megamenu.ts`'s own header comment): activation is
 * native `<button>` semantics, and there is no arrow-key vocabulary to own. What this enhancer DOES
 * own is `resolveMegamenuEvent`'s five inputs — click, hover-intent open/close (with their own
 * timers, cancelled on re-entry), Escape, blur-of-the-whole-bar — and syncing whichever trigger index
 * comes out of it onto the DOM: `aria-expanded` on every trigger, `data-state` on the ONE shared
 * panel (see below for why it is one and not N).
 *
 * ONE PHYSICAL PANEL, of CONSTANT height. The markup a page authors, and what a no-JS/SSR render
 * shows, is still N complete positioner/content pairs — one per `MegamenuTrigger`, each with its own
 * real content, so the page is fully meaningful before this ever runs. On connect, this enhancer:
 *
 *  1. Snapshots every trigger's columns (`columnsByIndex`) before touching the DOM at all.
 *  2. Repurposes the FIRST pair's positioner as the single shared panel, moved to be a direct child
 *     of the bar (out of any one trigger's own `<li>`), and removes the rest.
 *  3. Builds a `ruler` inside the shared content: one clone of EVERY trigger's columns, stacked in
 *     the same grid cell (`megamenu.css`'s own comment has the full reasoning), `visibility: hidden`
 *     so it is never painted or reachable, existing only to make that cell's track always as tall as
 *     the tallest trigger has ever needed.
 *  4. Builds the one VISIBLE panel — occupying that SAME cell — whose children `apply()` swaps.
 *
 * Because the ruler already accounts for every trigger, the visible panel's own height is always
 * ≤ the track's, so switching which trigger is shown never changes the box's size: nothing to
 * animate, nothing to measure, nothing to break on exit.
 *
 * Every panel anchors to the BAR ROOT, not its own trigger (`bindAnchor(root, positioner, name)` —
 * see `anchored.ts`'s own doc: the anchor argument was always a plain `HTMLElement`, never assumed to
 * be a trigger). Unlike Menu this binding never gates the bind behind `supportsAnchorPositioning()`:
 * there is no Zag/`@zag-js/popper` fallback machine to hand off to when the browser lacks CSS anchor
 * positioning, the same accepted gap Popover's own contract documents (ADR-25's "Costos" section) —
 * a deliberate degrade, not an oversight repeated by accident.
 *
 * LINK-TO-IMAGE PREVIEW. A `NavListLink` inside a trigger's columns can carry
 * `megamenuAttrs.preview` (a plain `data-*` attribute — `nav-list.ts`'s own contract needs no change
 * for this, its `NavListLink` already forwards unrecognized `attrs` straight to the `<a>`): hovering
 * or focusing it swaps that trigger's `ImageFrame` column to the given image, reverting to the
 * trigger's own authored default the instant neither a preview link nor the image has hover or
 * focus. Delegated on `visiblePanel` itself, not per-link: that element is stable across every
 * content swap (`apply()` only ever replaces ITS children), so one pair of listeners set up once at
 * connect covers every trigger for the panel's whole lifetime.
 */

const OPEN_DELAY_MS = 150;
const CLOSE_DELAY_MS = 150;

const selector = {
  root: "[data-sk-megamenu]",
  trigger: "[data-sk-megamenu-trigger]",
  item: `.${"sk-megamenu__item"}`,
  positioner: "[data-sk-megamenu-positioner]",
  content: "[data-sk-megamenu-content]",
} as const;

type ParsedEntry = {
  readonly trigger: HTMLElement;
  readonly positioner: HTMLElement;
  readonly content: HTMLElement;
};

function readEntries(root: HTMLElement): ParsedEntry[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector.trigger))
    .filter((trigger) => trigger.closest(selector.root) === root)
    .map((trigger) => {
      const item = trigger.closest<HTMLElement>(selector.item) ?? trigger.parentElement!;
      const positioner = item.querySelector<HTMLElement>(selector.positioner)!;
      const content = positioner.querySelector<HTMLElement>(selector.content)!;
      return { trigger, positioner, content };
    });
}

function buildPanel(columns: readonly Node[], modifier?: string): HTMLElement {
  const panel = document.createElement("div");
  panel.className = modifier ? `${megamenuParts.panel} ${modifier}` : megamenuParts.panel;
  panel.append(...columns.map((node) => node.cloneNode(true)));
  return panel;
}

type PreviewImage = { readonly src: string; readonly alt: string };

/** The trigger's own `ImageFrame` column, read as its authored default — `undefined` when this
 *  trigger has no image column, in which case the preview swap below has nothing to touch. */
function findDefaultImage(columns: readonly Node[]): PreviewImage | undefined {
  for (const node of columns) {
    if (!(node instanceof Element)) continue;
    const img = node.querySelector<HTMLImageElement>(`.${imageFrameParts.media}`);
    if (img) return { src: img.getAttribute("src") ?? "", alt: img.getAttribute("alt") ?? "" };
  }
  return undefined;
}

function connect(root: HTMLElement): () => void {
  const parsed = readEntries(root);
  if (!parsed.length) return () => {};

  // Snapshotted BEFORE any DOM surgery: every trigger's own columns, so nothing below ever has to
  // reason about which entry's `content` element happens to alias the shared one.
  const columnsByIndex: readonly Node[][] = parsed.map(({ content }) => Array.from(content.children));
  const defaultImageByIndex: readonly (PreviewImage | undefined)[] = columnsByIndex.map(findDefaultImage);

  const id = root.id || uniqueId("sk-megamenu");
  root.id = id;
  const anchorName = anchorNameFor(id);

  const sharedPositioner = parsed[0]!.positioner;
  const sharedContent = parsed[0]!.content;
  root.appendChild(sharedPositioner);
  for (let i = 1; i < parsed.length; i++) parsed[i]!.positioner.remove();

  const ruler = document.createElement("div");
  ruler.className = megamenuParts.ruler;
  ruler.setAttribute("aria-hidden", "true");
  ruler.append(...columnsByIndex.map((columns) => buildPanel(columns)));

  const visiblePanel = buildPanel(columnsByIndex[0]!, megamenuParts.panelVisible);
  sharedContent.replaceChildren(ruler, visiblePanel);

  const unbindAnchor = bindAnchor(root, sharedPositioner, anchorName);

  const triggers = parsed.map(({ trigger }) => trigger);

  let state: MegamenuState = { openIndex: null };
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let currentDefaultImage: PreviewImage | undefined = defaultImageByIndex[0];

  const clearTimers = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    openTimer = undefined;
    closeTimer = undefined;
  };

  const apply = (next: MegamenuState) => {
    if (next.openIndex === state.openIndex) return;
    const openingDifferent = next.openIndex !== null && next.openIndex !== state.openIndex;
    state = next;
    triggers.forEach((trigger, index) => trigger.setAttribute("aria-expanded", String(state.openIndex === index)));

    if (state.openIndex === null) {
      // Content stays exactly as it was: the exit transition fades OUT what is already there,
      // never an empty box shrinking to nothing.
      sharedContent.dataset.state = "closed";
      return;
    }
    if (openingDifferent) {
      // A preview crossfade mid-flight is about to lose the real `<img>` its clone sits beside to
      // the replace below; the clone itself would become a harmless orphan either way, but nothing
      // is left for its own fade to finish doing, so it goes immediately instead of outliving the
      // content it was laid over.
      outgoingPreviewImage?.remove();
      outgoingPreviewImage = undefined;
      visiblePanel.replaceChildren(...columnsByIndex[state.openIndex]!.map((node) => node.cloneNode(true)));
      // The clone already carries its own trigger's default `src`/`alt`, so the image is already
      // showing the right thing — this only updates what a LATER hover/leave should revert to.
      currentDefaultImage = defaultImageByIndex[state.openIndex];
    }
    sharedContent.dataset.state = "open";
  };

  const dispatch = (event: MegamenuEvent) => apply(resolveMegamenuEvent(state, event));

  // Preview swap: delegated on `visiblePanel` itself (stable across every content swap above) so one
  // pair of listeners, set up once, covers every trigger's own preview links for the panel's whole
  // lifetime — see this file's header comment for the full reasoning.
  const previewImage = () => visiblePanel.querySelector<HTMLImageElement>(`.${imageFrameParts.media}`);

  let outgoingPreviewImage: HTMLImageElement | undefined;

  /*
   * A hard `src` cut reads as broken, and a single image fading through its OWN transparency
   * exposes the frame's background for a beat instead of crossfading photo to photo (`megamenu.css`'s
   * own doc on `.sk-megamenu__preview-outgoing` has the full reasoning). So this clones the OUTGOING
   * image as an absolutely-positioned copy, updates the REAL `<img>` underneath immediately (already
   * the new picture, just covered by the clone), and lets `@starting-style` carry the clone from
   * fully opaque to gone — nothing here times or toggles that fade itself. At most one clone at a
   * time: a fast pointer sweep across several links removes the PREVIOUS one outright rather than
   * stacking several fades on top of each other.
   */
  const setPreviewImage = (src: string, alt: string) => {
    const img = previewImage();
    if (!img) return;
    if (img.src === new URL(src, document.baseURI).href) return;

    outgoingPreviewImage?.remove();
    const outgoing = img.cloneNode(true) as HTMLImageElement;
    outgoing.className = `${imageFrameParts.media} ${megamenuParts.previewOutgoing}`;
    outgoing.removeAttribute("style");
    outgoing.setAttribute("aria-hidden", "true");
    img.insertAdjacentElement("afterend", outgoing);
    outgoingPreviewImage = outgoing;

    img.src = src;
    img.alt = alt;

    const cleanup = () => {
      outgoing.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(safety);
      outgoing.remove();
      if (outgoingPreviewImage === outgoing) outgoingPreviewImage = undefined;
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === outgoing && event.propertyName === "opacity") cleanup();
    };
    outgoing.addEventListener("transitionend", onTransitionEnd);
    // A dropped `transitionend` (reduced motion, or a second swap already having removed this
    // clone) must not leave it in the DOM forever.
    const safety = setTimeout(cleanup, 500);
  };

  const applyPreview = (link: HTMLElement) => {
    setPreviewImage(link.getAttribute(megamenuAttrs.preview) ?? "", link.getAttribute(megamenuAttrs.previewAlt) ?? "");
  };

  const resetPreview = () => {
    if (!currentDefaultImage) return;
    setPreviewImage(currentDefaultImage.src, currentDefaultImage.alt);
  };

  // A pointer/focus LEAVING one preview link often lands on another (adjacent links in the same
  // list) or on the image itself (hovering down into the swapped picture) — neither should revert
  // to the default only to immediately swap again; only truly leaving every preview link does.
  const stillOnAPreviewLink = (next: EventTarget | null): boolean =>
    next instanceof Element && next.closest(`[${megamenuAttrs.preview}]`) !== null;

  const onPreviewPointerOver = (event: PointerEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link) applyPreview(link);
  };
  const onPreviewPointerOut = (event: PointerEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link && !stillOnAPreviewLink(event.relatedTarget)) resetPreview();
  };
  const onPreviewFocusIn = (event: FocusEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link) applyPreview(link);
  };
  const onPreviewFocusOut = (event: FocusEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link && !stillOnAPreviewLink(event.relatedTarget)) resetPreview();
  };

  visiblePanel.addEventListener("pointerover", onPreviewPointerOver);
  visiblePanel.addEventListener("pointerout", onPreviewPointerOut);
  visiblePanel.addEventListener("focusin", onPreviewFocusIn);
  visiblePanel.addEventListener("focusout", onPreviewFocusOut);

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      clearTimers();
      dispatch({ kind: "activate", index });
    });

    const scheduleOpen = () => {
      clearTimeout(closeTimer);
      closeTimer = undefined;
      if (state.openIndex === index) return;
      clearTimeout(openTimer);
      openTimer = setTimeout(() => dispatch({ kind: "hoverIntentOpen", index }), OPEN_DELAY_MS);
    };

    const scheduleClose = () => {
      clearTimeout(openTimer);
      openTimer = undefined;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => dispatch({ kind: "hoverIntentClose", index }), CLOSE_DELAY_MS);
    };

    trigger.addEventListener("pointerenter", scheduleOpen);
    trigger.addEventListener("pointerleave", scheduleClose);
  });

  // The one shared panel's own hover-intent: there is only one, so "the pointer left it" always
  // means "reconsider whichever trigger is currently open" — read at the moment the timer FIRES,
  // never a fixed index captured at schedule time, so a stale timer can't close a different trigger
  // the user has since switched to.
  const cancelPanelClose = () => {
    clearTimeout(closeTimer);
    closeTimer = undefined;
  };
  const schedulePanelClose = () => {
    clearTimeout(openTimer);
    openTimer = undefined;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (state.openIndex === null) return;
      dispatch({ kind: "hoverIntentClose", index: state.openIndex });
    }, CLOSE_DELAY_MS);
  };
  sharedPositioner.addEventListener("pointerenter", cancelPanelClose);
  sharedPositioner.addEventListener("pointerleave", schedulePanelClose);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || state.openIndex === null) return;
    const openTrigger = triggers[state.openIndex];
    clearTimers();
    dispatch({ kind: "escape" });
    openTrigger?.focus();
  };

  /*
   * A click on something INSIDE the panel that is not itself focusable — the image, a column
   * heading, the padding around them — blurs whatever WAS focused (a trigger, a link) with no new
   * focus target at all: the browser's own behavior for a pointer press on a non-focusable element,
   * not a bug in anything here. `relatedTarget` is then `null`, which `onFocusOut` below cannot tell
   * apart from "focus actually left the bar" — so it closed the menu on a click that never left it.
   * This tracks whether the pointerdown that is ABOUT to cause that blur landed inside the bar, on
   * the capture phase (fires before the resulting focus change), so `onFocusOut` can tell the two
   * apart.
   */
  let lastPointerDownWasInside = false;
  const onDocumentPointerDownCapture = (event: PointerEvent) => {
    const target = event.target as Node | null;
    lastPointerDownWasInside = !!target && root.contains(target);
  };

  // No focus trap, no wraparound (`megamenu.ts`'s own doc): this only notices when focus has left
  // the WHOLE bar, never redirects it.
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && root.contains(next)) return;
    if (lastPointerDownWasInside) return;
    clearTimers();
    dispatch({ kind: "blur" });
  };

  document.addEventListener("pointerdown", onDocumentPointerDownCapture, true);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("focusout", onFocusOut);

  return () => {
    clearTimers();
    outgoingPreviewImage?.remove();
    document.removeEventListener("pointerdown", onDocumentPointerDownCapture, true);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("focusout", onFocusOut);
    sharedPositioner.removeEventListener("pointerenter", cancelPanelClose);
    sharedPositioner.removeEventListener("pointerleave", schedulePanelClose);
    visiblePanel.removeEventListener("pointerover", onPreviewPointerOver);
    visiblePanel.removeEventListener("pointerout", onPreviewPointerOut);
    visiblePanel.removeEventListener("focusin", onPreviewFocusIn);
    visiblePanel.removeEventListener("focusout", onPreviewFocusOut);
    unbindAnchor();
  };
}

export const mountMegamenu = createConnectMount({
  key: "megamenu",
  rootSelector: selector.root,
  connect,
});
