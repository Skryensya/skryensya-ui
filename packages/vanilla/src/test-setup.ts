/* jsdom ships neither of these, and the select's popper reaches for both the moment it opens. */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);
if (globalThis.window) globalThis.window.ResizeObserver = globalThis.ResizeObserver;
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
