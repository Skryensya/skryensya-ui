import { createRoot } from "react-dom/client";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import { phosphorIcons } from "@skryensya/icons-phosphor";
import { renderTree, setPortalContainer } from "@skryensya/react/render-tree";
import type { UsageTree } from "@skryensya/core/usage-tree";
/*
 * Reached around `@skryensya/devtools`'s own public entry (`.` only exports `mountDebugPanel`), the
 * SAME move `apps/docs`'s `Base.astro` already makes for this exact package, for this exact reason  - 
 * see that file's own `FOCUS_ORDER_CSS` import. These three are the underlying CSS-injection
 * primitives the panel's checks are built on, usable without the panel's own UI attached.
 */
import { HIT_AREA_ATTR, ensureHitAreaStyleTag } from "../../../../packages/devtools/src/overlay.js";
import { FOCUS_ORDER_ATTR, ensureFocusOrderStyleTag } from "../../../../packages/devtools/src/focus-order.js";
import { SLOW_MO_ATTR, ensureSlowMoStyleTag } from "../../../../packages/devtools/src/motion.js";

/*
 * Loaded via `<script type="module">` inside the preview iframe's OWN document (see `document.ts`),
 * bundled through Vite's worker pipeline (`?worker&url`) so it's a self-contained module with no tie
 * to this app's own page  -  the same trick `apps/docs`'s preview frame runtime uses, for the same
 * reason: `srcdoc` has no relationship to the parent's module graph.
 *
 * Reads its instructions from a `<script type="application/json">` the srcdoc embeds (`document.ts`),
 * rather than a global or a query string: the payload is an entire usage tree, too large and too
 * easily broken by escaping rules to trust to a URL.
 */

interface FrameData {
  binding: "vanilla" | "react";
  vanillaHtml?: string;
  tree?: UsageTree;
}

function readFrameData(): FrameData {
  const script = document.getElementById("frame-data");
  if (!script?.textContent) throw new Error("eval-viewer frame: #frame-data script missing");
  return JSON.parse(script.textContent) as FrameData;
}

/*
 * MIRRORED FROM THE PARENT, not owned here  -  same shape as `apps/docs`'s `component-preview-frame.ts`
 * `syncRootState()`, cut down to what this app actually has: `data-scheme` (the app's own light/dark
 * toggle, `AppNavbar.tsx`/`useColorMode.ts`) plus the three devtools attributes that are pure CSS,
 * live-toggleable, no mount-time constraint (`overlay.ts`'s own header comment on why `sk-interactive`
 * and `Hit areas` behave this way; `focus-order.ts`'s on why this "works inside a component-preview
 * srcdoc iframe for free").
 *
 * No panel mounted in here, on purpose  -  reversed from mounting a second `mountDebugPanel()` instance
 * per iframe: that gave every open case its OWN toggle button and OWN independent state, so turning
 * "Hit areas" on for one render did nothing for the next one the reader opened, and the render was
 * never affected by the ONE panel already sitting in the app's own chrome. This mirrors that panel's
 * effect instead of duplicating its control surface: one source of truth (the outer `<html>`), every
 * iframe just reflects it.
 */
const MIRRORED_ATTRS = ["data-scheme", HIT_AREA_ATTR, FOCUS_ORDER_ATTR, SLOW_MO_ATTR] as const;

function syncRootState(): void {
  const parentRoot = window.parent.document.documentElement;
  for (const name of MIRRORED_ATTRS) {
    const value = parentRoot.getAttribute(name);
    if (value === null) document.documentElement.removeAttribute(name);
    else document.documentElement.setAttribute(name, value);
  }
  // `data-scheme` alone does not arm `light-dark()`: `applyColorMode` (`theme-toggle.ts`) also sets
  // `color-scheme` as an inline style, not a CSS rule keyed off the attribute, so that has to be
  // copied too, not just the attribute mirrored above.
  document.documentElement.style.colorScheme = parentRoot.style.colorScheme;
}

/*
 * The INITIAL height only, reported a few times right after mount and never again  -  not the
 * continuous `ResizeObserver`/`MutationObserver` this used to be. `Preview.tsx`'s `.preview-stage`
 * now OWNS its height (a reader's manual `resize: vertical` drag, or nothing at all), and the iframe
 * just fills 100% of it; a message that kept arriving on every later mutation would fight that
 * ownership the instant something inside the render changed size on its own (a menu opening, a tab
 * switching panes) by silently re-expanding the stage the reader had just resized. This still starts
 * the box at a size that fits the render, it just stops mattering the moment it has.
 *
 * `document.documentElement.scrollHeight` alone is WRONG for anything promoted to the top layer  - 
 * confirmed live: a Dialog's `open` option renders `<dialog open>` in the markup, but that alone is a
 * NON-modal dialog, sized in normal flow. Both bindings' enhancers/effects then call `.showModal()`
 * on mount to match the contract's intent, and `showModal()` is what actually promotes it to the top
 * layer with fixed, centered positioning  -  at which point it stops contributing to `scrollHeight`
 * entirely, the same way any `position: fixed` element does. `:modal` (native, matches whatever IS
 * currently in the top layer, regardless of which API put it there) is what a correct measurement has
 * to also account for, unioned with the normal document extent.
 */
function reportInitialHeight(): void {
  let height = document.documentElement.scrollHeight;
  for (const modal of document.querySelectorAll(":modal")) {
    height = Math.max(height, Math.ceil(modal.getBoundingClientRect().bottom));
  }
  window.parent.postMessage({ source: "eval-viewer-frame", height }, "*");
}

async function boot(): Promise<void> {
  const stage = document.getElementById("stage");
  if (!stage) throw new Error("eval-viewer frame: #stage missing");

  /*
   * Style tags first, state second: the CSS rules these three inject are inert until their attribute
   * is set (`overlay.ts`'s own comment on why `ensureHitAreaStyleTag` runs this early rather than
   * waiting for a first toggle), so having them present before `syncRootState()` ever writes an
   * attribute is what makes an ALREADY-ON check visible the instant this frame boots, not one paint
   * late.
   */
  ensureHitAreaStyleTag();
  ensureFocusOrderStyleTag();
  ensureSlowMoStyleTag();
  syncRootState();
  new MutationObserver(syncRootState).observe(window.parent.document.documentElement, { attributes: true });

  const data = readFrameData();

  if (data.binding === "vanilla") {
    stage.innerHTML = data.vanillaHtml ?? "";
    await mountComponentsWithIcons(document, phosphorIcons);
  } else if (data.tree) {
    setPortalContainer({ current: stage as HTMLElement });
    createRoot(stage).render(renderTree(data.tree));
  }

  reportInitialHeight();
  // `showModal()`, and React's own commit for the tree binding, can land a frame after the enhancer/
  // effect above resolves; a couple of deferred re-checks cover that without needing to know each
  // binding's own timing. Three attempts total, then this stops reporting for good.
  requestAnimationFrame(reportInitialHeight);
  setTimeout(reportInitialHeight, 100);
}

void boot();
