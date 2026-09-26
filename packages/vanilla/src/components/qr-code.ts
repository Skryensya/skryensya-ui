import { QrError, qrCodeAttrs, qrCodeParts, qrGeometry, qrSymbolFromAttributes } from "@skryensya/core/qr-code";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/* Saving a symbol as a file is a function the page's own button calls, from either binding. */
export {
  QrExportError,
  downloadQrCode,
  qrCodeToBlob,
  qrCodeToDataUrl,
  qrCodeToSvg,
  type QrExportOptions,
  type QrExportType,
} from "@skryensya/core/qr-code-export";

const rootSelector = `[${qrCodeAttrs.root}]`;

/* Everything a redraw depends on: the value, the four encoder inputs, and the inline style that carries
   `--sk-qr-code-logo-ratio`, which decides the hole the modules are cleared from. */
const watched = [
  qrCodeAttrs.value,
  qrCodeAttrs.level,
  qrCodeAttrs.mask,
  qrCodeAttrs.moduleShape,
  qrCodeAttrs.quietZone,
  "style",
];

/*
 * QR CODE, drawn in the browser, for what the build cannot cover: a value only known at runtime, and
 * a code re-pointed after load. A symbol the emitter produced already carries its path, and this does
 * not encode it again until something it encodes changes.
 *
 * THE SAME ENCODER AS EVERY OTHER PATH. `qrGeometry` is what the markup emitter calls at build time
 * and what the React binding calls at render; this is the third caller, not a third implementation,
 * so a symbol cannot come out one way here and another way anywhere else.
 *
 * IT RENDERS NO MARKUP, like every enhancer: the authored shell already has the `<svg>` frame and its
 * `<path>`, and this writes their `viewBox` and `d`. Change `data-value` (or the level, mask, shape or
 * quiet zone) later and it draws again, so a page can re-point a code without re-mounting anything.
 *
 * A VALUE THAT CANNOT BE ENCODED (too long for version 40 at that level) leaves the drawing EMPTY and
 * the root marked `data-sk-qr-error`, with the reason in the console. Empty, never the previous
 * symbol: a code still pointing at the old value is worse than no code, because it scans.
 */
export function connectQrCode(root: HTMLElement): () => void {
  const frame = root.querySelector<SVGSVGElement>(`:scope > .${qrCodeParts.frame}`);
  const modules = frame?.querySelector<SVGPathElement>(`.${qrCodeParts.modules}`);
  if (!frame || !modules) return () => {};

  const draw = () => {
    const symbol = qrSymbolFromAttributes(
      (name) => root.getAttribute(name),
      root.style.getPropertyValue("--sk-qr-code-logo-ratio"),
    );
    if (!symbol) return;
    try {
      const { path, extent } = qrGeometry(symbol.value, symbol.options);
      frame.setAttribute("viewBox", `0 0 ${extent} ${extent}`);
      modules.setAttribute("d", path);
      root.removeAttribute(qrCodeAttrs.error);
    } catch (error) {
      if (!(error instanceof QrError)) throw error;
      modules.setAttribute("d", "");
      root.setAttribute(qrCodeAttrs.error, "");
      console.warn(`[skryensya/qr-code] ${error.message}`);
    }
  };

  /* A symbol the emitter (or a server) already drew is not encoded a second time on load: its path
     came from the same function with the same inputs. Only an empty shell is drawn now; every later
     change to what it encodes is drawn when it happens. */
  if (!modules.getAttribute("d")) draw();
  const Observer = root.ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
  const observer = new Observer(draw);
  observer.observe(root, { attributes: true, attributeFilter: watched });
  return () => observer.disconnect();
}

export const mountQrCode = createConnectMount({
  key: "qr-code",
  rootSelector,
  connect: connectQrCode,
});
