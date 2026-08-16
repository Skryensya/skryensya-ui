import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { attachColumnResizer, watchColumnLayout } from "./splitter.js";

function pointer(type: string, init: { clientX?: number; button?: number } = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init }) as MouseEvent & { pointerId: number };
}

/** A press, then whatever moves the caller asks for, then the release — same shape every
 * `gesture()` helper in this codebase already uses (`sidebar.test.ts`, `treegrid.test.ts`). */
function gesture(handle: HTMLElement, xs: number[], { release = true } = {}) {
  handle.setPointerCapture = () => {};
  handle.hasPointerCapture = () => true;
  handle.releasePointerCapture = () => {};

  const send = (type: string, clientX: number, extra = {}) => {
    const event = pointer(type, { clientX, ...extra });
    event.pointerId = 1;
    handle.dispatchEvent(event);
  };

  send("pointerdown", xs[0]!, { button: 0 });
  for (const x of xs.slice(1)) send("pointermove", x);
  if (release) send("pointerup", xs[xs.length - 1]!);
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("attachColumnResizer", () => {
  function setup(widths: number[] = [100, 100]) {
    const th = document.createElement("th");
    document.body.append(th);
    let current: readonly number[] = widths;
    const cleanup = attachColumnResizer({
      th,
      index: 0,
      getWidths: () => current,
      setWidths: (next) => {
        current = next;
      },
      min: 20,
      ariaLabel: "Resize column: Subject",
      className: "sk-test__column-resizer",
      direction: () => "ltr",
    });
    const handle = th.querySelector<HTMLElement>("[data-sk-column-resizer]")!;
    return { th, handle, cleanup, widths: () => current };
  }

  it("appends a real separator into the header cell, named and oriented", () => {
    const { handle } = setup();
    expect(handle.getAttribute("role")).toBe("separator");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-label")).toBe("Resize column: Subject");
    expect(handle.tabIndex).toBe(0);
  });

  it("reports its position as a 0-100 percentage of the pair's travel", () => {
    const { handle } = setup();
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    expect(handle.getAttribute("aria-valuenow")).toBe("50"); // [100,100], midpoint
  });

  it("a press that never travels resizes nothing", () => {
    const { handle, widths } = setup();
    gesture(handle, [100]);
    expect(widths()).toEqual([100, 100]);
  });

  it("dragging redistributes width between exactly the pair, total conserved", () => {
    const { handle, widths } = setup();
    // The move that crosses the threshold measures from there — a third point demonstrates a resize
    // (same reasoning `sidebar.test.ts`'s own gesture comments document).
    gesture(handle, [100, 140, 180]);
    const [before, after] = widths();
    expect(before! + after!).toBe(200);
    expect(before!).toBeGreaterThan(100);
  });

  it("honors RTL: a drag toward larger x still SHRINKS the column in a right-to-left direction", () => {
    const th = document.createElement("th");
    document.body.append(th);
    let current: readonly number[] = [100, 100];
    attachColumnResizer({
      th,
      index: 0,
      getWidths: () => current,
      setWidths: (next) => (current = next),
      min: 20,
      ariaLabel: "Resize",
      className: "sk-test__column-resizer",
      direction: () => "rtl",
    });
    const handle = th.querySelector<HTMLElement>("[data-sk-column-resizer]")!;
    gesture(handle, [100, 140, 180]);
    expect(current[0]).toBeLessThan(100);
  });

  it("marks `data-dragging` for the length of the gesture only", () => {
    const { handle } = setup();
    gesture(handle, [100, 140, 180], { release: false });
    expect(handle.hasAttribute("data-dragging")).toBe(true);
    gesture(handle, [100, 140, 180]);
    expect(handle.hasAttribute("data-dragging")).toBe(false);
  });

  it("Left/Right resize by a step, Shift+Left/Right by the coarse step", () => {
    const { handle, widths } = setup();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(widths()).toEqual([116, 84]);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(widths()).toEqual([52, 148]);
  });

  it("Home/End jump to the pair's min/max extent", () => {
    const { handle, widths } = setup();
    fireEvent.keyDown(handle, { key: "End" });
    expect(widths()).toEqual([180, 20]);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(widths()).toEqual([20, 180]);
  });

  it("Enter (and double-click) resets the pair to an even split", () => {
    const { handle, widths } = setup();
    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(widths()).toEqual([100, 100]);

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.dblClick(handle);
    expect(widths()).toEqual([100, 100]);
  });

  it("cleanup removes the handle and its listeners", () => {
    const { th, handle, cleanup, widths } = setup();
    cleanup();
    expect(th.querySelector("[data-sk-column-resizer]")).toBeNull();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(widths()).toEqual([100, 100]); // detached handle, no longer wired
  });
});

describe("watchColumnLayout", () => {
  it("seeds synchronously when the measured element already has a real width", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ width: 300 }) as DOMRect;
    const apply = vi.fn();
    const cleanup = watchColumnLayout({ measured: el, colCount: 3, min: 20, apply });
    expect(apply).toHaveBeenCalledExactlyOnceWith(100);
    cleanup();
  });

  it("does not call `apply` yet when the measured element reads 0 (hidden at the moment of the call)", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ width: 0 }) as DOMRect;
    const apply = vi.fn();
    watchColumnLayout({ measured: el, colCount: 3, min: 20, apply });
    expect(apply).not.toHaveBeenCalled();
  });

  it("seeds once a real width arrives later, and stops watching after that one seed", () => {
    let capturedCallback: ResizeObserverCallback | null = null;
    let disconnected = false;
    const OriginalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        capturedCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {
        disconnected = true;
      }
    } as unknown as typeof ResizeObserver;

    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ width: 0 }) as DOMRect;
    const apply = vi.fn();
    watchColumnLayout({ measured: el, colCount: 2, min: 20, apply });
    expect(apply).not.toHaveBeenCalled();

    capturedCallback!([{ contentRect: { width: 400 } }] as ResizeObserverEntry[], {} as ResizeObserver);
    expect(apply).toHaveBeenCalledExactlyOnceWith(200);
    expect(disconnected).toBe(true);

    // A second layout change after the first real seed must not reseed again.
    capturedCallback!([{ contentRect: { width: 800 } }] as ResizeObserverEntry[], {} as ResizeObserver);
    expect(apply).toHaveBeenCalledOnce();

    globalThis.ResizeObserver = OriginalResizeObserver;
  });
});
