/*
 * The /acento showcase, moved into a srcdoc iframe so the mock app is a DOCUMENT of its own.
 *
 * WHY AN IFRAME AND NOT A SUBTREE. `data-accent` composes at any depth, so the level itself was
 * already isolated by re-declaring it on the frame. What a subtree cannot escape is the page around
 * it: the docs' own prose CSS reaches in (measured: `p { margin }` was landing on the mock's
 * paragraphs), and every rule the documentation adds later is one more thing that can quietly
 * restyle a mock whose entire job is to look like somebody else's app. A separate document ends that
 * class of bug instead of playing whack-a-mole with selectors.
 *
 * WHAT THE FRAME DOES INHERIT, on purpose: the reader's colour mode, contrast, palette ramps,
 * density, radius and icon set. Those are the person's own settings and the mock should honour them,
 * the same as every other preview on this site. `data-accent` is the one attribute deliberately NOT
 * mirrored, because the whole point of the showcase is that its level is its own.
 *
 * PROGRESSIVE ENHANCEMENT. The mock is authored inline in the page and MOVED here, rather than
 * living in a `<template>`: with no JS the reader still gets the whole app rendered in the document,
 * slightly leakier and perfectly readable. Nothing is duplicated, so there is no second copy of the
 * markup to drift.
 */

import { siteIcons } from "../icons";
import { mountIcons } from "@skryensya/vanilla/icon";

/**
 * What the frame copies from the page root. `data-accent` is deliberately absent: see above.
 * `style` comes along separately because the palette presets and the density live there.
 */
const MIRRORED = ["lang", "dir", "data-scheme", "data-contrast", "data-radius", "data-icon-set"] as const;

/*
 * The frame's own chrome: the mock fills the frame's viewport, and the document itself never
 * scrolls — the panel inside it does, exactly like a real app window.
 *
 * NOTHING HERE MEASURES ANYTHING, and that is the simplification the fixed height bought. While the
 * frame grew to its content, this script had to read the mock's height and write it back onto the
 * iframe, and every version of that read was circular: the screen stretches to the frame, so its
 * `scrollHeight` reported max(content, frame), which is the number being written. The loop converged
 * only over several frames, so the window visibly settled after paint (caught mid-slide at
 * 2183 → 2129 → 2083 → 2035px). A window with a height in CSS has nothing to measure.
 *
 * THE `scrollbar-gutter` LINE UNDOES ONE OF THE CLONED SHEETS. `patterns/scroll-lock.css` puts
 * `scrollbar-gutter: stable` on `html` unconditionally, which is right for a page — reserving the
 * rail before a dialog freezes the body is what stops the layout jumping — and wrong in here, where
 * the document never scrolls at all. All the reservation did was open a scrollbar-shaped strip of
 * dead canvas down the inside of the window's right edge, beside a scrollbar that can never appear.
 * The panel that DOES scroll keeps its own rail; this only stops the frame reserving a second one.
 * (`component-preview-frame.ts` neutralises the same inheritance for the same reason.)
 */
const FRAME_CSS = `
  html, body { block-size: 100%; margin: 0; overflow: hidden; background: var(--color-bg-canvas); }
  html { scrollbar-gutter: auto; }
`;

/** Astro's per-file scope marker, without which none of the page's own `<style>` rules match. */
function copyAstroScope(from: Element, to: Element): void {
  for (const name of from.getAttributeNames()) {
    if (name.startsWith("data-astro-cid-")) to.setAttribute(name, "");
  }
}

function mirrorRoot(from: HTMLElement, to: HTMLElement): void {
  for (const name of MIRRORED) {
    const value = from.getAttribute(name);
    if (value === null) to.removeAttribute(name);
    else to.setAttribute(name, value);
  }
  /* Inline custom properties: the palette preset's ramps and `--sk-density`. Copied wholesale
   * because the pre-paint script writes them as inline style on the root and their names are the
   * brand's, not this file's to enumerate. */
  to.style.cssText = from.style.cssText;
}

export function initAccentShowcase(): void {
  const source = document.querySelector<HTMLElement>("[data-docs-accent-frame]");
  if (!source) return;

  const parentRoot = document.documentElement;
  const level = source.getAttribute("data-accent") ?? "3";

  const frame = document.createElement("iframe");
  frame.className = source.className;
  frame.id = source.id;
  frame.title = source.dataset.frameTitle ?? "";
  /*
   * The Astro scope id, carried over by hand. Astro compiles a page's `<style>` to
   * `.reach-app__frame[data-astro-cid-…]`, and an element built with `createElement` carries no such
   * attribute, so a frame with the right CLASS still matched none of the page's rules: it rendered
   * at the iframe's user-agent default of 300×150 instead of taking the box and its height. Copied
   * rather than hard-coded because the id is generated per file.
   */
  copyAstroScope(source, frame);
  /* No script inside: the frame is markup and CSS only, so it needs no sandbox escape hatch and
   * cannot navigate. `allow-same-origin` is what lets this script reach in to move the nodes. */
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.srcdoc = "<!doctype html><html><head></head><body></body></html>";

  frame.addEventListener("load", () => {
    const doc = frame.contentDocument;
    if (!doc) return;

    for (const sheet of document.head.querySelectorAll('link[rel="stylesheet"], style')) {
      doc.head.append(doc.importNode(sheet, true));
    }
    const own = doc.createElement("style");
    own.textContent = FRAME_CSS;
    doc.head.append(own);

    mirrorRoot(parentRoot, doc.documentElement);
    doc.documentElement.setAttribute("data-accent", level);

    /* The mock's own grid (navbar row + body row) lived on the element that just became the iframe,
     * so it moves inside onto a screen wrapper. The frame element keeps only the box: its border,
     * its radius and its height, which has to stay in the PARENT because `cqw` resolves against
     * `.reach-app`, a container that does not exist in here. */
    const screen = doc.createElement("div");
    screen.className = "reach-app__screen";
    copyAstroScope(source, screen);
    screen.append(...Array.from(source.childNodes));
    doc.body.append(screen);

    /* Icons are geometry this realm has never seen: the checkbox's tick is a `data-sk-icon` span
     * that the page's own mount pass cannot reach across the document boundary. */
    mountIcons(doc, siteIcons);

    /* Mode, contrast, palette and density keep following the reader after boot. */
    const observer = new MutationObserver(() => mirrorRoot(parentRoot, doc.documentElement));
    observer.observe(parentRoot, { attributes: true, attributeFilter: [...MIRRORED, "style"] });
  });

  source.replaceWith(frame);
}
