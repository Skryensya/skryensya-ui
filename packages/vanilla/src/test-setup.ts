/* jsdom parses `<dialog>` and reflects `open`, but ships none of its METHODS, and Vaul and the
 * Command Palette are both built on the platform owning the modality. Just enough of it to test the
 * wiring around it: the attribute the CSS reads, and the `close` event both enhancers listen for. */
const dialogProto = globalThis.HTMLDialogElement?.prototype as
  | (HTMLDialogElement & { showModal?: () => void })
  | undefined;
if (dialogProto && typeof dialogProto.showModal !== "function") {
  const show = function show(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  dialogProto.show = show;
  dialogProto.showModal = show;
  dialogProto.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.hasAttribute("open")) return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

/* Pointer capture, which Vaul's drag asks for on the handle. A no-op is the honest stub: jsdom has
 * no compositor to retarget events with, and the gesture already tracks on the window regardless. */
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function setPointerCapture() {};
  Element.prototype.releasePointerCapture = function releasePointerCapture() {};
  Element.prototype.hasPointerCapture = function hasPointerCapture() {
    return false;
  };
}

/* jsdom ships neither of these, and the select's popper reaches for both the moment it opens. */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);
if (globalThis.window) globalThis.window.ResizeObserver = globalThis.ResizeObserver;

/* Same story for the carousel machine, which watches its slides to know which ones are in view. */
class IntersectionObserverStub {
  root = null;
  rootMargin = "";
  thresholds: number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ?? (IntersectionObserverStub as unknown as typeof IntersectionObserver);
if (globalThis.window) globalThis.window.IntersectionObserver = globalThis.IntersectionObserver;
Element.prototype.scrollTo = Element.prototype.scrollTo ?? function scrollTo() {};
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? function scrollIntoView() {};

/* jsdom ships no `CSS` global, but Zag's DOM helpers escape generated ids (which contain ":") with
 * `CSS.escape` before querying. Spec-compliant polyfill (mathiasbynens/CSS.escape). */
function cssEscape(value: string): string {
  const str = String(value);
  const length = str.length;
  let index = -1;
  let result = "";
  const firstCodeUnit = str.charCodeAt(0);
  while (++index < length) {
    const codeUnit = str.charCodeAt(index);
    if (codeUnit === 0x0000) {
      result += "�";
      continue;
    }
    if (
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      codeUnit === 0x007f ||
      (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002d)
    ) {
      result += "\\" + codeUnit.toString(16) + " ";
      continue;
    }
    if (index === 0 && length === 1 && codeUnit === 0x002d) {
      result += "\\" + str.charAt(index);
      continue;
    }
    if (
      codeUnit >= 0x0080 ||
      codeUnit === 0x002d ||
      codeUnit === 0x005f ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a)
    ) {
      result += str.charAt(index);
      continue;
    }
    result += "\\" + str.charAt(index);
  }
  return result;
}

const cssShim = { escape: cssEscape } as unknown as typeof CSS;
globalThis.CSS = globalThis.CSS ?? cssShim;
if (!globalThis.CSS.escape) globalThis.CSS.escape = cssEscape;
if (globalThis.window) globalThis.window.CSS = globalThis.CSS;
