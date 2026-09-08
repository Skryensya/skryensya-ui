/*
 * The site's set, imported from `../icons` like any other consumer. It used to be hardcoded to
 * `lucideIcons` in here: while the site painted Phosphor, the demo's icons came out with different
 * geometry from the chrome around them. The set is named in ONE place and this realm reads it.
 */
import { siteIcons } from "../icons";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountComponentPreview } from "@skryensya/vanilla/component-preview";
import { mountIcons } from "@skryensya/vanilla/icon";

/*
 * Root cause (do not regress): `window.frameElement instanceof HTMLIFrameElement` is FALSE inside
 * the srcdoc frame. The element lives in the parent Window realm, so the child's HTMLIFrameElement
 * constructor is a different function. Always identify the host with tagName / parent identity.
 */
const frame = hostIframe();
const parentRoot = window.parent.document.documentElement;
const rootAttributes = [
  "lang",
  "dir",
  "data-scheme",
  "data-contrast",
  "data-radius",
  "data-icon-set",
  /*
   * `@skryensya/devtools`'s "Safety triangle" toggle sets this on the PARENT page's `<html>`
   * before any of ITS OWN menus mount (see `Base.astro`'s early `is:inline` script). Every preview
   * here is its own `srcdoc` document, so without mirroring it too, the flag would reach the real
   * page's own menus and stop there. Every menu demo on the site lives inside one of these
   * frames, so that would be the one place the toggle visibly does nothing. `syncRootState()` runs
   * before `mountFrameComponents()` below, same as it does for `data-scheme`/`data-contrast`, so
   * `Menu.svelte`'s one-time `root.closest(...)` read sees it already there.
   */
  "data-sk-menu-debug-intent",
  /*
   * `@skryensya/devtools`'s "Hit areas" toggle. Unlike the menu flag above, this one is pure CSS -
   * a live-toggleable attribute, no mount-time constraint, so mirroring it here is all it needs on
   * the ATTRIBUTE side; `syncRootState()` re-runs on every parent-`<html>` attribute change
   * (`rootObserver` below), so this keeps working even toggled long after an iframe has booted. The
   * matching STYLE RULE still has to exist in this document too, which is `ensureHitAreaStyleTag()`
   * in the devtools package's own `overlay.ts`. Called at panel MOUNT rather than at first toggle
   * for exactly this reason, so `cloneParentStyles()` below has something to actually clone.
   */
  "data-sk-devtools-hit-areas",
  /*
   * Same shape as "Hit areas" above. Pure CSS, live-toggleable, no mount-time constraint. For
   * `@skryensya/devtools`'s "Slow motion" and "Focus order" checks. Each rule is pre-seeded in
   * `Base.astro`'s early `<head>` the same way, so `cloneParentStyles()` below always has something
   * to clone regardless of when a given iframe boots relative to the panel.
   */
  "data-sk-devtools-slow-mo",
  "data-sk-devtools-focus-order",
] as const;
const allowScroll = document.body.hasAttribute(
  "data-sk-component-preview-scroll",
);
const frameReadyAttribute = "data-sk-component-preview-frame-ready";
const previewViewportBlockSize = "--sk-component-preview-viewport-block-size";

function hostIframe(): HTMLIFrameElement | null {
  const el = window.frameElement;
  if (el && el.tagName === "IFRAME") return el as HTMLIFrameElement;
  return null;
}

/** The reader dragged the stage's resizer: the height is theirs, so stop measuring and scroll. */
function readerSized(): boolean {
  return frame?.hasAttribute("data-sk-component-preview-resized") ?? false;
}


function scrolls(): boolean {
  return allowScroll || readerSized();
}

function applyOverflow(): void {
  const scrolling = scrolls();
  const overflow = scrolling ? "auto" : "hidden";
  document.documentElement.style.setProperty("overflow", overflow, "important");
  document.body.style.setProperty("overflow", overflow, "important");

  /*
   * An auto-fit frame has no independent viewport: its height is the content's height. Mirror the
   * reader viewport so components using viewport-relative limits do not create a fit loop
   * (short frame → short content → short frame). Reader-resized stages own a real viewport instead.
   */
  if (scrolling) {
    document.documentElement.style.removeProperty(previewViewportBlockSize);
  } else {
    document.documentElement.style.setProperty(
      previewViewportBlockSize,
      `${window.parent.innerHeight}px`,
    );
  }
}

/**
 * Is there an element BETWEEN `target` and the frame's own `<body>` (exclusive of both) that can
 * still move in the wheel gesture's own direction? The auto-fit frame's `<html>`/`<body>` are
 * `overflow: hidden` (`applyOverflow`), by design, but a component can open its OWN scrollable
 * region inside that short frame regardless. A listbox, a menu, anything a Zag/native popup
 * portals into the frame's document (`Portal` with no `container` lands there, not on the parent
 * page), and that region is real, independent, internal scroll that has nothing to do with
 * whether the FRAME itself is auto-fit. Confirmed the concrete failure against a live render, not
 * assumed: TimeField's own picker (48 rows, `.sk-select__content`) was the first demo on the site
 * with enough rows to actually need this. Every earlier dropdown demo's item count fit inside its
 * `max-block-size` without scrolling, so the gap between "the frame is short" and "something inside
 * it needs its own scroll" had never been exercised before.
 */
function hasScrollableAncestor(target: EventTarget | null, deltaY: number): boolean {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const scrollableY = style.overflowY === "auto" || style.overflowY === "scroll";
    if (scrollableY && node.scrollHeight > node.clientHeight) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight;
      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
    }
    node = node.parentElement;
  }
  return false;
}

/**
 * An auto-fit frame (`!scrolls()`) has nothing to scroll internally (`overflow: hidden` sees to
 * that), but a wheel gesture over it does not reliably chain up to the PARENT page's scroll either:
 * cross-frame scroll chaining is not something browsers do consistently once the local document
 * has nowhere to go, so the frame just swallows the gesture and the reader's scroll appears to
 * stop dead the moment their pointer crosses into a preview. Forward it to the parent explicitly
 * instead. Once the frame legitimately owns scroll (reader-resized, screened, or a demo that opted
 * into `scroll`) this gets out of the way entirely, and the frame's own content scrolls normally.
 *
 * `hasScrollableAncestor` guards that forwarding: hijacking a gesture the reader aimed at a
 * component's OWN open dropdown. Scrolling the outer preview instead of the list under the
 * pointer. Is worse than the dead-stop this function exists to fix in the first place.
 */
function forwardWheelToParent(event: WheelEvent): void {
  if (scrolls()) return;
  if (hasScrollableAncestor(event.target, event.deltaY)) return;
  event.preventDefault();
  window.parent.scrollBy({ left: event.deltaX, top: event.deltaY });
}

function syncRootState(): void {
  for (const name of rootAttributes) {
    const value = parentRoot.getAttribute(name);
    if (value === null) document.documentElement.removeAttribute(name);
    else document.documentElement.setAttribute(name, value);
  }
  document.documentElement.style.cssText = parentRoot.style.cssText;
  // Host scroll-lock reserves a classic scrollbar gutter; previews size to content.
  document.documentElement.style.setProperty(
    "scrollbar-gutter",
    "auto",
    "important",
  );
  document.documentElement.style.setProperty("block-size", "auto", "important");
  document.documentElement.style.setProperty(
    "min-block-size",
    "0",
    "important",
  );
  document.body.style.setProperty("min-block-size", "0", "important");
  document.body.style.setProperty("block-size", "auto", "important");
  applyOverflow();
}

function injectFrameChrome(): void {
  if (document.head.querySelector("[data-sk-component-preview-chrome]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-sk-component-preview-chrome", "");
  style.textContent = `
    html {
      scrollbar-gutter: auto !important;
      block-size: auto !important;
      min-block-size: 0 !important;
      height: auto !important;
      overflow: ${scrolls() ? "auto" : "hidden"} !important;
    }
    body.sk-component-preview__frame-body {
      block-size: auto !important;
      min-block-size: 0 !important;
      height: auto !important;
      max-block-size: none !important;
      overflow: ${scrolls() ? "auto" : "hidden"} !important;
      /*
       * \`cloneParentStyles()\` brings in the docs site's own \`body { background: var(--color-bg-canvas) }\`
       * (site.css, unlayered), which otherwise wins over this class's \`@layer components\` background
       * regardless of specificity: an unlayered rule always beats a layered one. Left unforced, every
       * previewed demo painted on canvas instead of the surface component-preview.css intends, and in
       * dark mode canvas is exactly the depth \`--color-bg-surface-sunken\` deliberately lands on (it is
       * meant to sit INSIDE a surface), so a slider/progress/meter track vanished into the stage.
       */
      background: var(--sk-component-preview-bg) !important;
    }
  `;
  document.head.append(style);
}

/**
 * A preview nested in a preview (the ComponentPreview page documents itself) boots against a parent
 * whose head is still empty: the parent clones its own styles asynchronously. Cloning then would
 * copy nothing. Wait for the parent frame to declare itself ready: top-level pages never do, and
 * are never waited on.
 */
async function waitForParentFrame(): Promise<void> {
  const parentBody = window.parent.document.body;
  const nested =
    parentBody?.classList.contains("sk-component-preview__frame-body") ?? false;
  if (!nested || parentRoot.hasAttribute(frameReadyAttribute)) return;

  await new Promise<void>((resolve) => {
    const settle = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (parentRoot.hasAttribute(frameReadyAttribute)) settle();
    });
    observer.observe(parentRoot, {
      attributes: true,
      attributeFilter: [frameReadyAttribute],
    });
    // A parent that never finishes must not leave this frame blank forever.
    const timer = setTimeout(settle, 4000);
  });
}

async function cloneParentStyles(): Promise<void> {
  const pending: Promise<void>[] = [];
  const styles = window.parent.document.head.querySelectorAll<
    HTMLLinkElement | HTMLStyleElement
  >('link[rel="stylesheet"], style');

  for (const source of styles) {
    const clone = document.importNode(source, true);
    if (clone.tagName === "LINK") {
      const { promise, resolve } = Promise.withResolvers<void>();
      clone.addEventListener("load", () => resolve(), { once: true });
      clone.addEventListener("error", () => resolve(), { once: true });
      pending.push(promise);
    }
    document.head.append(clone);
  }

  await Promise.all(pending);
}

/*
 * The authored script runs through `Function`, so it has no module scope and cannot import the
 * enhancers. A demo that INSERTS markup after boot (a toast pushed by a click) still needs to mount
 * what it inserted, so the frame hands it the one call it would otherwise write as an import. It is
 * documentation plumbing, not library API: `mount(root)` here stands in for the page's own
 * `initComponents()` / `mountToast()`, and the JS shown to the reader keeps the real import.
 */
declare global {
  interface Window {
    skMount?: (root?: Document | Element) => Promise<void>;
  }
}

/*
 * Every React demo module, as lazy loaders keyed by basename.
 *
 * A glob, not a hand-kept registry: the map is derived from the directory at build time, so adding
 * a demo file cannot forget to register it. The loaders are lazy, so a preview pays only for the
 * one module it names, and, critically, these imports resolve in THIS realm, giving the frame its
 * own React instance and its own `document`. That is the entire point of mounting here instead of
 * from the parent (see `react-demos/framed.tsx` for the two shapes that failed first).
 */
const reactDemoModules = import.meta.glob<Record<string, unknown>>(
  "../components/react-demos/*.tsx",
);

const reactDemoLoaders = new Map(
  Object.entries(reactDemoModules).map(([path, load]) => [
    (path.split("/").pop() ?? path).replace(/\.tsx$/, ""),
    load,
  ]),
);

/**
 * Vite's React Fast Refresh preamble, for THIS realm.
 *
 * In dev, `@vitejs/plugin-react` instruments every `.tsx` with `$RefreshSig$`/`$RefreshReg$` calls
 * and relies on a preamble that Astro injects into the PAGE. The frame is a separate document with
 * its own globals, so importing a demo here threw `ReferenceError: $RefreshSig$ is not defined`
 * before the component ever rendered. Installing the same preamble on the frame's window is what
 * the page does for itself; production builds carry no instrumentation, so this is dev-only.
 */
async function installRefreshPreamble(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const win = window as unknown as Record<string, unknown>;
  if (win.__vite_plugin_react_preamble_installed__) return;

  // Through a variable: `/@react-refresh` is a dev-server virtual module with no file for TS to
  // resolve, and a literal specifier would fail the type check.
  const specifier = "/@react-refresh";
  const runtime = (await import(/* @vite-ignore */ specifier)) as {
    injectIntoGlobalHook: (target: unknown) => void;
  };
  runtime.injectIntoGlobalHook(window);
  win.$RefreshReg$ = () => {};
  win.$RefreshSig$ = () => (type: unknown) => type;
  win.__vite_plugin_react_preamble_installed__ = true;
}

/**
 * Match the name the island reported against the glob's source-file keys.
 *
 * Dev reports the file stem and hits exactly. A BUILD reports the hashed chunk stem
 * (`button_vlYZB2ck`), so fall back to the LONGEST key it starts with: longest because
 * `select-menu_HASH` starts with both `select` and `select-menu`, and only the longer one is the
 * module actually asked for.
 */
function resolveDemoLoader(
  name: string,
): (() => Promise<Record<string, unknown>>) | undefined {
  const exact = reactDemoLoaders.get(name);
  if (exact) return exact;

  let bestKey = "";
  for (const key of reactDemoLoaders.keys()) {
    if (name.startsWith(key) && key.length > bestKey.length) bestKey = key;
  }
  return bestKey ? reactDemoLoaders.get(bestKey) : undefined;
}

/** This frame's icon set, bound: see `mountComponentsWithIcons` for the sequence and why. */

function hasIconPlaceholders(root: Document | Element): boolean {
  if (root instanceof Element && root.hasAttribute("data-sk-icon")) return true;
  return root.querySelector("[data-sk-icon]") !== null;
}


const mountFrameComponents = (root: Document | Element): Promise<void> =>
  mountComponentsWithIcons(root, siteIcons);

/** Import and mount the demo this frame was told to render, in this frame's own realm. */
/*
 * Most React components own their behavior and must never receive the sibling Vanilla machine.
 * Three intentionally render authored structure for a Vanilla enhancer instead: Carousel adds
 * controls and tracks the active slide; TablePager builds its navigation; Toast owns dismissal
 * through the same DOM event API in both bindings. Keep that seam narrow so React-owned machines
 * such as Tabs and TreeView cannot race a second state owner.
 */
// Runtime selector registry: keep these imports lazy so ordinary frames do not ship three unused enhancers.
const reactEnhancers = [
  {
    selector: "[data-sk-carousel]",
    load: async () => (await import("@skryensya/vanilla/carousel")).mountCarousel,
  },
  {
    selector: "[data-sk-table-pager]",
    load: async () => (await import("@skryensya/vanilla/table-pager")).mountTablePager,
  },
  {
    selector: "[data-sk-toast]",
    load: async () => (await import("@skryensya/vanilla/toast")).mountToast,
  },
] as const;

async function mountReactEnhancers(host: Element): Promise<void> {
  await Promise.all(reactEnhancers.map(async ({ selector, load }) => {
    const roots = host.querySelectorAll<HTMLElement>(selector);
    if (roots.length === 0) return;

    const mount = await load();
    for (const root of roots) mount(root);
  }));
}

async function mountReactDemo(): Promise<void> {
  const { skReactDemoModule: moduleKey, skReactDemoExport: exportName } =
    document.body.dataset;
  if (!moduleKey || !exportName) return;

  const load = resolveDemoLoader(moduleKey);
  if (!load)
    throw new Error(
      `[ComponentPreview] Unknown React demo module "${moduleKey}".`,
    );

  await installRefreshPreamble();

  /*
   * `@skryensya/react/icon` joins the other React modules here, AFTER the preamble, not as a
   * static top-level import. A static import evaluates at frame-script load, before
   * `installRefreshPreamble()` has run, and this file is `.tsx`: Vite's Fast Refresh transform
   * registers it at module-evaluation time, which is exactly what threw "can't detect preamble"
   * on every tree-driven demo the moment this import was hoisted to the top.
   */
  const [module, { createRoot }, { createElement }, { flushSync }, { IconSetProvider }] =
    await Promise.all([
      load(),
      import("react-dom/client"),
      import("react"),
      import("react-dom"),
      import("@skryensya/react/icon"),
    ]);

  /*
   * A demo module may export an async `preload()` for a dependency it loads lazily on its own
   * side (`react-demos/tree.tsx` defers `render-tree`'s ~60-component graph this way so the PARENT
   * document never pays for it). Awaiting it here, before `flushSync` renders anything, is what
   * keeps that laziness invisible: the alternative (a `Suspense` boundary inside the demo) commits
   * an empty fallback first, `fitFrame()`'s first passes measure that emptiness, and the real
   * content then lands after the stage already left its loading state, so the resize transition
   * animates a visible jump instead of the frame simply appearing at its final size.
   */
  if (typeof module.preload === "function") await module.preload();

  const exported = module[exportName];
  if (typeof exported !== "function") {
    throw new Error(
      `[ComponentPreview] "${moduleKey}" has no demo export "${exportName}".`,
    );
  }

  /*
   * Unwrap: the export is the `framed()` wrapper, whose whole job is to render THIS frame. Render
   * it here and the preview nests a preview inside itself, forever. `demoComponent` is the original
   * component, resolved in this realm because this realm loaded the module.
   */
  const Component =
    (exported as { demoComponent?: unknown }).demoComponent ?? exported;

  const raw = document.body.dataset.skReactDemoProps;
  const props = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};

  /*
   * A container of its own rather than `document.body`: React owns everything inside its root, and
   * the body is shared with the authored-script demos and the enhancers' own insertions. The
   * `display: contents` keeps it out of layout, so the demo's children sit directly in the frame
   * body's padded, wrapping row: the same box the Vanilla markup gets, which is what makes the two
   * bindings line up instead of the React one sitting in a nested block.
   */
  const host = document.createElement("div");
  host.setAttribute("data-sk-react-demo-root", "");
  host.style.display = "contents";
  document.body.append(host);

  /*
   * Bound here, not left to `Icon`'s own default: the frame's icon-mounted Vanilla stage always
   * draws `siteIcons` (see the note atop this file), and an unwrapped React demo falls back to
   * `Icon`'s module default (Phosphor) instead: same tree, two geometries, side by side. A demo
   * that binds its own set (`ToolbarDemo`'s `<IconSetProvider set={lucideIcons}>`) still wins for
   * its own subtree; nesting just re-affirms the same set for everyone else.
   */
  const root = createRoot(host);
  flushSync(() => {
    root.render(
      createElement(IconSetProvider, {
        set: siteIcons,
        children: createElement(Component as never, props as never),
      }),
    );
  });
  await mountReactEnhancers(host);
  if (hasIconPlaceholders(host)) mountIcons(host, siteIcons);
}

function runAuthoredScript(): void {
  const encoded = document.body.dataset.skComponentPreviewScript;
  delete document.body.dataset.skComponentPreviewScript;
  if (!encoded) return;
  window.skMount = (root = document) => mountFrameComponents(root);
  Function(decodeURIComponent(encoded)).call(window);
}

/**
 * Content height independent of the iframe's current viewport.
 *
 * Do not append a flex-basis-100% end marker: with `gap` on the frame body that marker wraps onto
 * a new flex line and the row gap is counted as extra height, so the stage reads with more padding
 * below than above. Measure in-flow children instead; skip out-of-flow nodes (toasts, menus).
 */
function measureContentHeight(): number {
  const body = document.body;
  const styles = getComputedStyle(body);
  const paddingTop = parseFloat(styles.paddingTop) || 0;
  const paddingBottom = parseFloat(styles.paddingBottom) || 0;
  const borderTop = parseFloat(styles.borderTopWidth) || 0;
  const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
  const bodyTop = body.getBoundingClientRect().top;

  let contentBottom = bodyTop + borderTop + paddingTop;

  /*
   * `display: contents` has no box of its own, so its rect is empty and measuring it would report
   * nothing: which is exactly what happened to the React binding, whose mount host is `contents`
   * so the demo's children join the body's flex row like the Vanilla markup does. Descend through
   * such wrappers and measure the real boxes underneath.
   */
  const consider = (element: Element): void => {
    const styles = getComputedStyle(element);
    if (styles.position === "absolute" || styles.position === "fixed") return;
    if (styles.display === "contents") {
      for (const child of element.children) consider(child);
      return;
    }
    const bottom = element.getBoundingClientRect().bottom;
    if (Number.isFinite(bottom))
      contentBottom = Math.max(contentBottom, bottom);
  };

  for (const child of body.children) consider(child);

  /*
   * An OPEN menu panel is exactly the out-of-flow content `consider()` above is right to skip for
   * its own DIRECT box (a closed trigger must not reserve room for a menu that might never open),
   * but skipping it forever is a different bug: `.sk-menu` is a normal, in-flow wrapper, never
   * `display: contents`, so `consider()` never descends into it to find the panel nested inside -
   * a `position: fixed` submenu escapes the WRAPPER's own box by design (`patterns/anchored.css`),
   * and nothing here ever measured where it actually landed. Measured against a live nested Menu:
   * the auto-fit frame stayed at the closed trigger's own height regardless of how many levels were
   * open, clipping every one of them at the iframe's own edge. This is what actually broke, not
   * how tall any preset floor was. Every open panel, at ANY depth, gets its own real screen rect
   * folded in here; a closed one is `display: none` and contributes nothing, so this only grows the
   * frame for what the reader can currently see.
   */
  for (const panel of document.querySelectorAll<HTMLElement>('.sk-menu__content[data-state="open"]')) {
    const bottom = panel.getBoundingClientRect().bottom;
    if (Number.isFinite(bottom)) contentBottom = Math.max(contentBottom, bottom);
  }

  const height = contentBottom - bodyTop + paddingBottom + borderBottom;
  return Math.max(1, Math.ceil(height));
}

/*
 * `data-sk-component-preview-binding` toggling hides the OTHER binding's panel (this iframe
 * itself for Vanilla, an ancestor `<div>` for React), and while hidden, `measureContentHeight()`
 * reads every child's `getBoundingClientRect()` as empty and reports its 1px floor. THAT used to
 * land in `frame.style.height` regardless: real height overwritten with garbage nobody asked for.
 * The stage popped back at 1px the moment a reader toggled to it, then grew to its real size over
 * the next few frames, animated, because `frame-ready` had long since turned the resize
 * transition back on.
 *
 * `window.innerWidth === 0` looked like the right signal and was not: it only holds for a frame
 * that has NEVER yet been laid out (a fresh island whose ancestor started hidden). A frame that
 * WAS visible and got hidden afterward (Vanilla, toggling away from the default) keeps reporting
 * its last real `innerWidth` even while suspended, so that check let every later write through.
 * `frame.offsetParent` is the one query that reads the PARENT document's actual box for this
 * element right now: `null` the instant `display: none` applies to it OR an ancestor, restored the
 * instant it does not, for either DOM shape. Skipping the write while it is null leaves whatever
 * height was last measured while actually visible, so a toggle reveals the right size immediately:
 * nothing to correct, so nothing to see move.
 */
function frameCollapsed(): boolean {
  return !frame || frame.offsetParent === null;
}

/*
 * The same three numbers `component-preview.css` gives `--sk-component-preview-stage-min-block-size`
 * for the LOADING flash, kept here too rather than read back off the stage: that custom property
 * resolves to a `rem` string (density-scaled, cross-realm), and the one thing this floor has to be
 * is a plain px number `Math.max` can use against a measurement in the SAME units. Approximate is
 * fine, since what it buys is the placement machine's OWN room to decide "does this fit", not a
 * final pixel: a smaller floor here at most nudges where a menu's OWN flip already lands it.
 *
 * The floor matters at THIS layer and not only in CSS because of a bootstrapping loop the loading
 * floor alone cannot reach: a menu's flip logic decides which side it opens on by asking whether it
 * fits in the CURRENT frame, and once `frame-ready` zeroes the CSS floor (before any menu has ever
 * opened), that current frame is the closed trigger's own few px. A submenu opening into that flips
 * upward to "fit", landing at a negative `y`. ABOVE this frame's own origin, clipped at the top
 * instead of the bottom, and `measureContentHeight`'s open-panel pass only ever grows the BOTTOM
 * edge. Applying the floor here keeps the frame reporting a reasonable height even before content
 * says it needs one, so the flip decision a newly-opened menu makes is against real room from the
 * start, not the collapsed one an empty trigger left behind.
 */
const viewportFloorPx: Record<string, number> = {
  menu: 288,
  overlay: 384,
  "menu-deep": 480,
};

function fitFrame(): void {
  if (!frame || allowScroll || readerSized() || frameCollapsed()) return;
  const floor = viewportFloorPx[frame.dataset.skComponentPreviewViewport ?? ""] ?? 0;
  const next = `${Math.max(measureContentHeight(), floor)}px`;
  if (frame.style.height !== next) frame.style.height = next;
}

async function boot(): Promise<void> {
  syncRootState();
  const rootObserver = new MutationObserver(syncRootState);
  rootObserver.observe(parentRoot, { attributes: true });
  window.addEventListener("pagehide", () => rootObserver.disconnect(), {
    once: true,
  });
  const onParentResize = () => {
    applyOverflow();
    fitFrame();
  };
  window.parent.addEventListener("resize", onParentResize);
  window.addEventListener(
    "pagehide",
    () => window.parent.removeEventListener("resize", onParentResize),
    { once: true },
  );
  // Not passive: forwarding depends on preventDefault() to stop the (otherwise no-op) local scroll
  // attempt cleanly, rather than racing it.
  window.addEventListener("wheel", forwardWheelToParent, { passive: false });
  window.addEventListener(
    "pagehide",
    () => window.removeEventListener("wheel", forwardWheelToParent),
    { once: true },
  );

  await waitForParentFrame();
  await cloneParentStyles();
  injectFrameChrome();
  /*
   * Lazy enhancers can insert their control chrome after their mount promise resolves. Hydrate
   * placeholders as they arrive; observing child additions avoids timing guesses and ignores state
   * updates, which only change attributes.
   */
  const iconObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element && hasIconPlaceholders(node)) {
          mountIcons(node, siteIcons);
        }
      }
    }
  });
  iconObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("pagehide", () => iconObserver.disconnect(), {
    once: true,
  });
  await mountFrameComponents(document);
  /*
   * The documentation surfaces are opt-in, and this realm opts in: a preview of ComponentPreview
   * has to behave like one: its own tabs, reload, resizer and code disclosure. Both mounts are
   * no-ops when the demo has neither surface, which is every other preview on the site.
   */
  if (document.querySelector("[data-sk-code-preview]")) mountCodePreview(document);
  if (document.querySelector("[data-sk-component-preview]")) mountComponentPreview(document);
  /*
   * Editor is deliberately absent from `initComponents`'s own registry (`mountFrameComponents`
   * above already ran it): `@skryensya/editor` is an OPTIONAL peer dependency of
   * `@skryensya/vanilla` (ProseMirror, ~9 packages), so the package's auto-loader must never name
   * it, even lazily. This site's docs, though, is exactly the kind of consumer that already
   * depends on `@skryensya/editor` directly - it is what builds this very demo - so it opts in
   * explicitly here, the same shape any real page hosting an Editor would write for itself
   * (`EditorPage.astro`'s own `js` snippet shows that exact shape to the reader).
   */
  if (document.querySelector("[data-sk-editor]")) {
    const { mountEditor } = await import("@skryensya/vanilla/editor");
    mountEditor(document);
  }
  await mountReactDemo();
  runAuthoredScript();

  if (frame) {
    /*
     * The resizer and screen tabs both live in the parent document. Watching either lets a stage
     * re-fit when the reader returns height to content or when a new frame width reflows it.
     */
    const sizingObserver = new MutationObserver(() => {
      applyOverflow();
      fitFrame();
    });
    sizingObserver.observe(frame, {
      attributes: true,
      attributeFilter: [
        "data-sk-component-preview-resized",
        "data-sk-component-preview-screen",
      ],
    });
    window.addEventListener("pagehide", () => sizingObserver.disconnect(), {
      once: true,
    });
  }

  if (!allowScroll) {
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }

    const resizeObserver = new ResizeObserver(fitFrame);
    resizeObserver.observe(document.body);
    for (const child of document.body.children) {
      if (child instanceof Element) resizeObserver.observe(child);
    }
    window.addEventListener("pagehide", () => resizeObserver.disconnect(), {
      once: true,
    });

    /*
     * The body's children are not fixed at boot. The React binding portals its whole tree in AFTER
     * this runtime is ready (that is the signal it waits for), and an authored script can append a
     * toast or a dialog at any time. Observing only the children that existed at boot would leave
     * those measured by the body observer alone, which misses the case that matters most: a child
     * that grows without changing the body's own border box.
     */
    const childObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) resizeObserver.observe(node);
        }
        for (const node of record.removedNodes) {
          if (node instanceof Element) resizeObserver.unobserve(node);
        }
      }
      fitFrame();
    });
    /*
     * `subtree`, not just the body's own children: the React demo mounts into a `display: contents`
     * host, so its nodes are appended INSIDE that host and a childList-only watch never sees them:
     * the frame stayed at its empty-body height. Watching the subtree also covers a demo that grows
     * a menu or a row deeper in its own tree.
     */
    childObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pagehide", () => childObserver.disconnect(), {
      once: true,
    });

    /*
     * A menu opening/closing toggles `data-state` on an EXISTING node (Zag's own machine, not this
     * runtime's DOM), which `childObserver` above never sees: it watches nodes being added or
     * removed, not attributes changing on ones already there. Without this, `measureContentHeight`'s
     * own open-panel pass (above) had the right measurement but nothing ever asked for it again once
     * a menu opened after boot.
     */
    const menuStateObserver = new MutationObserver(fitFrame);
    menuStateObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    });
    window.addEventListener("pagehide", () => menuStateObserver.disconnect(), {
      once: true,
    });

    let lastWidth = frame?.getBoundingClientRect().width ?? -1;
    const hostObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(width - lastWidth) < 0.5) return;
      lastWidth = width;
      fitFrame();
    });
    if (frame) hostObserver.observe(frame);
    window.addEventListener("pagehide", () => hostObserver.disconnect(), {
      once: true,
    });

    fitFrame();
    requestAnimationFrame(() => {
      fitFrame();
      requestAnimationFrame(fitFrame);
    });
  } else if (frame) {
    frame.setAttribute("data-sk-component-preview-scroll", "");
  }

  document.documentElement.setAttribute(
    "data-sk-component-preview-frame-ready",
    "",
  );
  frame?.setAttribute("data-sk-component-preview-frame-ready", "");
  frame?.setAttribute("aria-busy", "false");
  window.dispatchEvent(new CustomEvent("sk-component-preview-ready"));
}

void boot().catch((error: unknown) => {
  frame?.setAttribute("data-sk-component-preview-frame-error", "");
  frame?.setAttribute("aria-busy", "false");
  console.error("[ComponentPreview] Could not initialize srcdoc frame.", error);
});
