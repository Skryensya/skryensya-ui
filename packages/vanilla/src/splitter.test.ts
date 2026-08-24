import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { attachColumnResizer, measureColumnContentWidth, watchColumnLayout, watchSplitterExtent } from "./splitter.js";

function pointer(type: string, init: { clientX?: number; button?: number } = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init }) as MouseEvent & { pointerId: number };
}

/** A press, then whatever moves the caller asks for, then the release. Same shape every
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
    // The move that crosses the threshold measures from there. A third point demonstrates a resize
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

  it("Enter (and double-click) resets the pair to an even split, with no `resetWidth` given", () => {
    const { handle, widths } = setup();
    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(widths()).toEqual([100, 100]);

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.dblClick(handle);
    expect(widths()).toEqual([100, 100]);
  });

  it("Enter (and double-click) resize to `resetWidth`'s own target instead, when given", () => {
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
      direction: () => "ltr",
      resetWidth: () => 150,
    });
    const handle = th.querySelector<HTMLElement>("[data-sk-column-resizer]")!;

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(current).toEqual([150, 50]);

    fireEvent.keyDown(handle, { key: "Home" });
    fireEvent.dblClick(handle);
    expect(current).toEqual([150, 50]);
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
    expect(apply).toHaveBeenCalledExactlyOnceWith([100, 100, 100]);
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
    expect(apply).toHaveBeenCalledExactlyOnceWith([200, 200]);
    expect(disconnected).toBe(true);

    // A second layout change after the first real seed must not reseed again.
    capturedCallback!([{ contentRect: { width: 800 } }] as ResizeObserverEntry[], {} as ResizeObserver);
    expect(apply).toHaveBeenCalledOnce();

    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("seeds proportionally to `weights` when given, instead of an even split", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ width: 400 }) as DOMRect;
    const apply = vi.fn();
    watchColumnLayout({ measured: el, colCount: 3, min: 20, weights: [2, 1, 1], apply });
    const [widths] = apply.mock.calls[0]!;
    expect(widths[0]).toBeGreaterThan(widths[1]);
    expect(widths[1]).toBe(widths[2]);
    expect(widths[0] + widths[1] + widths[2]).toBe(400);
  });
});

describe("measureColumnContentWidth", () => {
  function tableWithColumn(texts: string[]) {
    const table = document.createElement("table");
    table.className = "sk-table";
    const [headText, ...bodyTexts] = texts;
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = headText ?? "";
    headRow.append(th);
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    for (const text of bodyTexts) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.textContent = text;
      row.append(cell);
      tbody.append(row);
    }
    table.append(thead, tbody);
    document.body.append(table);
    return table;
  }

  /** A real browser can't be asked "how wide would this text be" from jsdom, so this stands in for
   * layout: every measured element's width comes from its OWN text content, the one thing a clone
   * of a real cell still carries faithfully. */
  function stubWidthByText(widths: Record<string, number>) {
    return vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return { width: widths[this.textContent ?? ""] ?? 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
  }

  it("takes the widest cell across header AND body rows", () => {
    const table = tableWithColumn(["Header", "Row 1", "Row 2 longer"]);
    const spy = stubWidthByText({ Header: 80, "Row 1": 60, "Row 2 longer": 150 });
    expect(measureColumnContentWidth({ table, columnIndex: 0, min: 20 })).toBe(150);
    spy.mockRestore();
  });

  it("floors at `min` when every cell measures narrower", () => {
    const table = tableWithColumn(["A", "B", "C"]);
    const spy = stubWidthByText({ A: 5, B: 10, C: 8 });
    expect(measureColumnContentWidth({ table, columnIndex: 0, min: 20 })).toBe(20);
    spy.mockRestore();
  });

  it("never mutates or removes the real cell. It measures a detached clone instead", () => {
    const table = tableWithColumn(["Header", "Row"]);
    const realCell = table.querySelector("th")!;
    const spy = stubWidthByText({ Header: 999, Row: 999 });
    measureColumnContentWidth({ table, columnIndex: 0, min: 20 });
    expect(realCell.style.whiteSpace).toBe("");
    expect(document.body.contains(realCell)).toBe(true);
    // no leftover ruler table left behind in the document after the call returns
    expect(document.querySelectorAll("table")).toHaveLength(1);
    spy.mockRestore();
  });

  it("strips the resizer handle from the clone before measuring", () => {
    const table = tableWithColumn(["Header"]);
    const th = table.querySelector("th")!;
    const handle = document.createElement("div");
    handle.setAttribute("data-sk-column-resizer", "");
    th.appendChild(handle);
    let sawResizerOnMeasuredElement = false;
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      if (this.querySelector("[data-sk-column-resizer]")) sawResizerOnMeasuredElement = true;
      return { width: 90, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    expect(measureColumnContentWidth({ table, columnIndex: 0, min: 20 })).toBe(90);
    expect(sawResizerOnMeasuredElement).toBe(false);
    spy.mockRestore();
  });

  it("returns `min` for a column index with no cells at all", () => {
    const table = tableWithColumn(["Only column"]);
    expect(measureColumnContentWidth({ table, columnIndex: 5, min: 20 })).toBe(20);
  });
});

describe("watchSplitterExtent", () => {
  it("writes the container's own rendered height as `--sk-splitter-block-size`, in px", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ height: 340 }) as DOMRect;
    const cleanup = watchSplitterExtent(el);
    expect(el.style.getPropertyValue("--sk-splitter-block-size")).toBe("340px");
    cleanup();
  });

  it("keeps tracking height changes for as long as the caller holds the cleanup", () => {
    let capturedCallback: ResizeObserverCallback | null = null;
    const OriginalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        capturedCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ height: 200 }) as DOMRect;
    watchSplitterExtent(el);
    expect(el.style.getPropertyValue("--sk-splitter-block-size")).toBe("200px");

    el.getBoundingClientRect = () => ({ height: 450 }) as DOMRect;
    capturedCallback!([] as ResizeObserverEntry[], {} as ResizeObserver);
    expect(el.style.getPropertyValue("--sk-splitter-block-size")).toBe("450px");

    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("uses a caller-supplied `measure` instead of the container's own full height, when given", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ height: 999 }) as DOMRect; // proves the default is bypassed
    const cleanup = watchSplitterExtent(el, () => 77);
    expect(el.style.getPropertyValue("--sk-splitter-block-size")).toBe("77px");
    cleanup();
  });
});
