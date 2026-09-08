import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

const css = globalThis.CSS ?? { escape: undefined as unknown as (value: string) => string };
css.escape = css.escape ?? ((value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "\\$&"));
globalThis.CSS = css;
if (globalThis.window) globalThis.window.CSS = css;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverStub;
if (globalThis.window) globalThis.window.ResizeObserver = globalThis.ResizeObserver;
Element.prototype.scrollTo = Element.prototype.scrollTo ?? function scrollTo() {};

/* jsdom ships no `matchMedia`, and the comment composer asks it whether it is a sheet. Reports "no"
 * for every query, which is the in-flow presentation: the fallback, and the one a test asserts
 * against unless it overrides this itself. */
if (globalThis.window && typeof globalThis.window.matchMedia !== "function") {
  globalThis.window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

/* jsdom parses `<dialog>` and reflects `open`, but ships none of its METHODS - the same gap
 * `packages/vanilla/src/test-setup.ts` fills, and now needed here too because the comment composer
 * is a real dialog in this binding as well. Enough of it to test the wiring around it: the attribute
 * the CSS reads and the `close` event the binding listens for. No modality, which is why nothing
 * asks `:modal`. */
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
