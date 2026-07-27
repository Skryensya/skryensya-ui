/*
 * El set del sitio, importado de `../icons` como cualquier otro consumidor. Estuvo hardcodeado a
 * `lucideIcons` acá adentro: mientras el sitio pintaba Phosphor, los iconos del demo salían con otra
 * geometría que los del chrome que lo rodea. El set se nombra en UN lugar y este realm lo lee.
 */
import { siteIcons } from "../icons";
import { initComponents } from "@skryensya/vanilla/auto";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountComponentPreview } from "@skryensya/vanilla/component-preview";
import { mountIcons } from "@skryensya/vanilla/icon";
import { initTocDisclosure } from "./toc";

/*
 * Root cause (do not regress): `window.frameElement instanceof HTMLIFrameElement` is FALSE inside
 * the srcdoc frame. The element lives in the parent Window realm, so the child's HTMLIFrameElement
 * constructor is a different function. Always identify the host with tagName / parent identity.
 */
const frame = hostIframe();
const parentRoot = window.parent.document.documentElement;
const rootAttributes = ["lang", "dir", "data-scheme", "data-contrast", "data-radius", "data-icon-set"] as const;
const allowScroll = document.body.hasAttribute("data-sk-component-preview-scroll");
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

/**
 * A screen preset is on, so the stage is a device: both axes are the preset's, and the document
 * scrolls inside them exactly as it would on the real thing. Measuring here would be worse than
 * useless — fitting the frame to its content is precisely what a device does not do.
 */
function screened(): boolean {
  return frame?.hasAttribute("data-sk-component-preview-screen") ?? false;
}

function scrolls(): boolean {
  return allowScroll || readerSized() || screened();
}

function applyOverflow(): void {
  const scrolling = scrolls();
  const overflow = scrolling ? "auto" : "hidden";
  document.documentElement.style.setProperty("overflow", overflow, "important");
  document.body.style.setProperty("overflow", overflow, "important");

  /*
   * An auto-fit frame has no independent viewport: its height is the content's height. Mirror the
   * reader viewport so components using viewport-relative limits do not create a fit loop
   * (short frame → short content → short frame). Fixed/resized stages own a real viewport instead.
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

function syncRootState(): void {
  for (const name of rootAttributes) {
    const value = parentRoot.getAttribute(name);
    if (value === null) document.documentElement.removeAttribute(name);
    else document.documentElement.setAttribute(name, value);
  }
  document.documentElement.style.cssText = parentRoot.style.cssText;
  // Host scroll-lock reserves a classic scrollbar gutter; previews size to content.
  document.documentElement.style.setProperty("scrollbar-gutter", "auto", "important");
  document.documentElement.style.setProperty("block-size", "auto", "important");
  document.documentElement.style.setProperty("min-block-size", "0", "important");
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
    }
  `;
  document.head.append(style);
}

/**
 * A preview nested in a preview (the ComponentPreview page documents itself) boots against a parent
 * whose head is still empty: the parent clones its own styles asynchronously. Cloning then would
 * copy nothing. Wait for the parent frame to declare itself ready — top-level pages never do, and
 * are never waited on.
 */
async function waitForParentFrame(): Promise<void> {
  const parentBody = window.parent.document.body;
  const nested = parentBody?.classList.contains("sk-component-preview__frame-body") ?? false;
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
    observer.observe(parentRoot, { attributes: true, attributeFilter: [frameReadyAttribute] });
    // A parent that never finishes must not leave this frame blank forever.
    const timer = setTimeout(settle, 4000);
  });
}

async function cloneParentStyles(): Promise<void> {
  const pending: Promise<void>[] = [];
  const styles = window.parent.document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
    'link[rel="stylesheet"], style',
  );

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

function runAuthoredScript(): void {
  const encoded = document.body.dataset.skComponentPreviewScript;
  delete document.body.dataset.skComponentPreviewScript;
  if (!encoded) return;
  window.skMount = async (root = document) => {
    await initComponents(root);
    mountIcons(root, siteIcons);
  };
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
  for (const child of body.children) {
    if (!(child instanceof Element)) continue;
    const position = getComputedStyle(child).position;
    if (position === "absolute" || position === "fixed") continue;
    const bottom = child.getBoundingClientRect().bottom;
    if (Number.isFinite(bottom)) contentBottom = Math.max(contentBottom, bottom);
  }

  const height = contentBottom - bodyTop + paddingBottom + borderBottom;
  return Math.max(1, Math.ceil(height));
}

function fitFrame(): void {
  if (!frame || allowScroll || readerSized() || screened()) return;
  const next = `${measureContentHeight()}px`;
  if (frame.style.height !== next) frame.style.height = next;
}

async function boot(): Promise<void> {
  syncRootState();
  const rootObserver = new MutationObserver(syncRootState);
  rootObserver.observe(parentRoot, { attributes: true });
  window.addEventListener("pagehide", () => rootObserver.disconnect(), { once: true });
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

  await waitForParentFrame();
  await cloneParentStyles();
  injectFrameChrome();
  const disposeToc = initTocDisclosure(document);
  window.addEventListener("pagehide", disposeToc, { once: true });
  mountIcons(document, siteIcons);
  await initComponents(document);
  /*
   * The documentation surfaces are opt-in, and this realm opts in: a preview of ComponentPreview
   * has to behave like one — its own tabs, reload, resizer and code disclosure. Both mounts are
   * no-ops when the demo has neither surface, which is every other preview on the site.
   */
  mountCodePreview(document);
  mountComponentPreview(document);
  runAuthoredScript();

  if (frame) {
    /*
     * The resizer and the screen tabs both live in the parent document: watch their verdict on who
     * owns the height. Leaving a preset is the case that needs the re-fit — the stage goes back to
     * content height, and nothing else would ever ask for that measurement again.
     */
    const sizingObserver = new MutationObserver(() => {
      applyOverflow();
      fitFrame();
    });
    sizingObserver.observe(frame, {
      attributes: true,
      attributeFilter: ["data-sk-component-preview-resized", "data-sk-component-preview-screen"],
    });
    window.addEventListener("pagehide", () => sizingObserver.disconnect(), { once: true });
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
    window.addEventListener("pagehide", () => resizeObserver.disconnect(), { once: true });

    let lastWidth = frame?.getBoundingClientRect().width ?? -1;
    const hostObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(width - lastWidth) < 0.5) return;
      lastWidth = width;
      fitFrame();
    });
    if (frame) hostObserver.observe(frame);
    window.addEventListener("pagehide", () => hostObserver.disconnect(), { once: true });

    fitFrame();
    requestAnimationFrame(() => {
      fitFrame();
      requestAnimationFrame(fitFrame);
    });
  } else if (frame) {
    frame.setAttribute("data-sk-component-preview-scroll", "");
  }

  document.documentElement.setAttribute("data-sk-component-preview-frame-ready", "");
  frame?.setAttribute("data-sk-component-preview-frame-ready", "");
  frame?.setAttribute("aria-busy", "false");
  window.dispatchEvent(new CustomEvent("sk-component-preview-ready"));
}

void boot().catch((error: unknown) => {
  frame?.setAttribute("data-sk-component-preview-frame-error", "");
  frame?.setAttribute("aria-busy", "false");
  console.error("[ComponentPreview] Could not initialize srcdoc frame.", error);
});
