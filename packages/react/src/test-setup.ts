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
