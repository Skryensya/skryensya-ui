import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TREEGRID_EXIT_FALLBACK_MS } from "@skryensya/core/treegrid";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountTreegrid } from "./treegrid.js";

/*
 * The same fixture shape `treegrid.test.ts` (core) reasons about: Inbox (expanded, two children),
 * Drafts (collapsed, one child that stays hidden), Sent (a top-level leaf). Two columns. Subject,
 * From. The disclosure lives in the first.
 */
function markup() {
  document.body.innerHTML = `<table class="sk-treegrid" data-sk-treegrid aria-label="Mensajes" role="treegrid">
    <thead>
      <tr><th scope="col">Asunto</th><th scope="col">De</th></tr>
    </thead>
    <tbody>
      <tr data-sk-treegrid-row data-value="inbox" role="row" aria-level="1" aria-setsize="3" aria-posinset="1" aria-expanded="true">
        <td role="gridcell">Inbox</td><td role="gridcell">-</td>
      </tr>
      <tr data-sk-treegrid-row data-value="alice" role="row" aria-level="2" aria-setsize="2" aria-posinset="1">
        <td role="gridcell">Reunión</td><td role="gridcell">Alice</td>
      </tr>
      <tr data-sk-treegrid-row data-value="bob" role="row" aria-level="2" aria-setsize="2" aria-posinset="2">
        <td role="gridcell">Almuerzo</td><td role="gridcell">Bob</td>
      </tr>
      <tr data-sk-treegrid-row data-value="drafts" role="row" aria-level="1" aria-setsize="3" aria-posinset="2" aria-expanded="false">
        <td role="gridcell">Drafts</td><td role="gridcell">-</td>
      </tr>
      <tr data-sk-treegrid-row data-value="untitled" role="row" aria-level="2" aria-setsize="1" aria-posinset="1">
        <td role="gridcell">Sin título</td><td role="gridcell">Yo</td>
      </tr>
      <tr data-sk-treegrid-row data-value="sent" role="row" aria-level="1" aria-setsize="3" aria-posinset="3">
        <td role="gridcell">Sent</td><td role="gridcell">-</td>
      </tr>
    </tbody>
  </table>`;
  const root = document.querySelector<HTMLElement>("[data-sk-treegrid]")!;
  expect(mountTreegrid(document)).toBe(1);
  return root;
}

/** Three columns, so "no resizer after the LAST column" is distinguishable from "no resizer at all". */
function resizableMarkup() {
  document.body.innerHTML = `<table class="sk-treegrid" data-sk-treegrid aria-label="Mensajes" data-resizable-columns data-resize-label="Redimensionar columna" role="treegrid">
    <thead>
      <tr><th scope="col">Asunto</th><th scope="col">De</th><th scope="col">Fecha</th></tr>
    </thead>
    <tbody>
      <tr data-sk-treegrid-row data-value="inbox" role="row" aria-level="1" aria-setsize="1" aria-posinset="1">
        <td role="gridcell">Inbox</td><td role="gridcell">-</td><td role="gridcell">Hoy</td>
      </tr>
    </tbody>
  </table>`;
  const root = document.querySelector<HTMLElement>("[data-sk-treegrid]")!;
  expect(mountTreegrid(document)).toBe(1);
  return root;
}

const row = (value: string) => document.querySelector<HTMLTableRowElement>(`[data-value="${value}"]`)!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-treegrid]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("Treegrid vanilla enhancer", () => {
  it("mounts once and hides the collapsed branch's descendant on connect", () => {
    markup();
    expect(mountTreegrid(document)).toBe(0);
    expect(row("untitled").hidden).toBe(true);
    expect(row("inbox").hidden).toBe(false);
    expect(row("alice").hidden).toBe(false);
  });

  it("gives exactly one row a tab stop on mount. The first visible row", () => {
    markup();
    const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>("[data-sk-treegrid-row]"));
    const stops = rows.filter((element) => element.tabIndex === 0);
    expect(stops).toEqual([row("inbox")]);
  });

  it("Right Arrow on a collapsed branch's row expands it and reveals its child, without moving focus", () => {
    const root = markup();
    row("drafts").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(row("drafts").getAttribute("aria-expanded")).toBe("true");
    expect(row("untitled").hidden).toBe(false);
    expect(document.activeElement).toBe(row("drafts"));
  });

  it("Left Arrow on an expanded branch's row collapses it and hides its child, after its exit animation settles", () => {
    vi.useFakeTimers();
    const root = markup();
    row("inbox").focus();
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(row("inbox").getAttribute("aria-expanded")).toBe("false");
    // Kept painting through its own exit animation, not hidden the same frame the branch collapses
    //. Jsdom never fires `animationend`, so `TREEGRID_EXIT_FALLBACK_MS` is what settles it.
    expect(row("alice").hidden).toBe(false);
    expect(row("bob").hidden).toBe(false);
    vi.advanceTimersByTime(TREEGRID_EXIT_FALLBACK_MS + 1);
    expect(row("alice").hidden).toBe(true);
    expect(row("bob").hidden).toBe(true);
    vi.useRealTimers();
  });

  it("Right Arrow on an already-expanded row enters its first cell; Left Arrow returns to the row", () => {
    const root = markup();
    row("inbox").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    const firstCell = row("inbox").querySelectorAll("td")[0]!;
    expect(document.activeElement).toBe(firstCell);
    expect(firstCell.tabIndex).toBe(0);
    expect(row("inbox").tabIndex).toBe(-1);

    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(row("inbox"));
  });

  it("Down Arrow skips a hidden (collapsed-away) row entirely", () => {
    const root = markup();
    // Collapsed by default: Drafts (row index 3 among visible rows) is followed by Sent, never Untitled.
    row("drafts").focus();
    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(document.activeElement).toBe(row("sent"));
  });

  it("Enter toggles a focused branch row and activates a focused leaf row", () => {
    const root = markup();
    row("inbox").focus();
    fireEvent.keyDown(root, { key: "Enter" });
    expect(row("inbox").getAttribute("aria-expanded")).toBe("false");

    let activated: unknown;
    root.addEventListener("sk-treegrid-activate", (event) => {
      activated = (event as CustomEvent).detail;
    });
    row("sent").focus();
    fireEvent.keyDown(root, { key: "Enter" });
    expect(activated).toEqual({ value: "sent" });
  });

  it("clicking a branch's first cell toggles it and moves focus to the row", () => {
    const root = markup();
    const firstCell = row("drafts").querySelectorAll("td")[0]!;
    fireEvent.click(firstCell);
    expect(row("drafts").getAttribute("aria-expanded")).toBe("true");
    expect(row("untitled").hidden).toBe(false);
    expect(document.activeElement).toBe(row("drafts"));

    let detail: unknown;
    root.addEventListener("sk-treegrid-expanded-change", (event) => {
      detail = (event as CustomEvent).detail;
    });
    fireEvent.click(firstCell);
    expect(detail).toEqual({ value: "drafts", expanded: false });
  });

  it("clicking a non-first cell just moves focus there, without toggling", () => {
    markup();
    const secondCell = row("inbox").querySelectorAll("td")[1]!;
    fireEvent.click(secondCell);
    expect(document.activeElement).toBe(secondCell);
    expect(row("inbox").getAttribute("aria-expanded")).toBe("true");
  });

  it("Home/End (row focus) jump to the first/last VISIBLE row", () => {
    const root = markup();
    row("bob").focus();
    fireEvent.keyDown(root, { key: "Home" });
    expect(document.activeElement).toBe(row("inbox"));
    fireEvent.keyDown(root, { key: "End" });
    expect(document.activeElement).toBe(row("sent"));
  });

  it("never puts `sk-interactive` on the <tr> itself. Its state layer breaks table column alignment", () => {
    markup();
    expect(row("inbox").classList.contains("sk-interactive")).toBe(false);
  });

  it("inserts a decorative disclosure button into a branch row's first cell, never a leaf's", () => {
    markup();
    const inboxButton = row("inbox").querySelector<HTMLButtonElement>(":first-child > button");
    expect(inboxButton).not.toBeNull();
    expect(inboxButton!.getAttribute("aria-hidden")).toBe("true");
    expect(inboxButton!.tabIndex).toBe(-1);
    expect(row("sent").querySelector("button")).toBeNull();
  });

  it("clicking the disclosure button itself toggles the row, same as clicking the cell", () => {
    const root = markup();
    const draftsButton = row("drafts").querySelector<HTMLButtonElement>(":first-child > button")!;
    fireEvent.click(draftsButton);
    expect(row("drafts").getAttribute("aria-expanded")).toBe("true");
    expect(row("untitled").hidden).toBe(false);
  });

  it("never inserts a column resizer unless `data-resizable-columns` is authored", () => {
    markup();
    expect(document.querySelector("[data-sk-column-resizer]")).toBeNull();
  });
});

function pointer(type: string, init: { clientX?: number; button?: number } = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init }) as MouseEvent & { pointerId: number };
}

describe("Treegrid column resize", () => {
  const resizers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-sk-column-resizer]"));
  const cols = () => Array.from(document.querySelectorAll<HTMLTableColElement>("col"));

  /** jsdom lays nothing out, so the seed (`measured width ÷ colCount`) clamps every column straight
   * to `MIN_COLUMN_WIDTH`. A real, but degenerate, 0-length travel range that cannot demonstrate a
   * resize at all. Tests that need room to move set wider widths directly, the same way a real
   * browser's own initial measurement would have. */
  const widenColumns = (px: number) => cols().forEach((col) => (col.style.width = `${px}px`));

  /** A press, then whatever moves the caller asks for, then the release. Same shape as
   * `sidebar.test.ts`'s own `gesture()` helper, against the resizer at `resizerIndex` instead. */
  function gesture(resizerIndex: number, xs: number[], { release = true } = {}) {
    const handle = resizers()[resizerIndex]!;
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
    return handle;
  }

  it("inserts one resizer per column boundary: never after the last column", () => {
    resizableMarkup();
    // Three columns, two boundaries.
    expect(resizers()).toHaveLength(2);
    for (const handle of resizers()) {
      expect(handle.getAttribute("role")).toBe("separator");
      expect(handle.getAttribute("aria-orientation")).toBe("vertical");
      expect(handle.tabIndex).toBe(0);
    }
  });

  it("names each resizer from the shared label plus its OWN column header", () => {
    resizableMarkup();
    expect(resizers()[0]!.getAttribute("aria-label")).toBe("Redimensionar columna: Asunto");
    expect(resizers()[1]!.getAttribute("aria-label")).toBe("Redimensionar columna: De");
  });

  it("a press that never travels resizes nothing", () => {
    resizableMarkup();
    const widthsBefore = cols().map((c) => c.style.width);
    gesture(0, [100]);
    expect(cols().map((c) => c.style.width)).toEqual(widthsBefore);
  });

  it("dragging redistributes width between exactly the resized pair, total conserved", () => {
    resizableMarkup();
    widenColumns(200);
    const before = cols().map((c) => Number.parseFloat(c.style.width));
    // The move that CROSSES the threshold measures from there (no slop-jump, `sidebar.ts`'s own
    // documented behavior); a third point is what actually demonstrates a resize.
    gesture(0, [100, 140, 180]);
    const after = cols().map((c) => Number.parseFloat(c.style.width));
    expect(after[0]! + after[1]!).toBeCloseTo(before[0]! + before[1]!);
    expect(after[0]!).toBeGreaterThan(before[0]!);
    expect(after[1]!).toBeLessThan(before[1]!);
    expect(after[2]).toBe(before[2]); // the untouched third column never moves
  });

  it("marks the resizer `data-dragging` for the length of the gesture only", () => {
    resizableMarkup();
    widenColumns(200);
    const handle = gesture(0, [100, 140], { release: false });
    expect(handle.hasAttribute("data-dragging")).toBe(true);
    gesture(0, [100, 140]);
    expect(handle.hasAttribute("data-dragging")).toBe(false);
  });

  it("Left/Right resize by a step, Shift+Left/Right by the coarse step", () => {
    resizableMarkup();
    widenColumns(200);
    const handle = resizers()[0]!;
    const before = Number.parseFloat(cols()[0]!.style.width);
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(before + 16);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(before + 16 - 64);
  });

  it("Home/End jump to the resized pair's min/max extent", () => {
    resizableMarkup();
    widenColumns(200);
    const handle = resizers()[0]!;
    const [w0, w1] = cols().map((c) => Number.parseFloat(c.style.width));
    const total = w0! + w1!;

    fireEvent.keyDown(handle, { key: "End" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(total - 60); // 60 = MIN_COLUMN_WIDTH

    fireEvent.keyDown(handle, { key: "Home" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(60);
  });

  it("Enter (and double-click) resets the pair to an even split", () => {
    resizableMarkup();
    widenColumns(200);
    const handle = resizers()[0]!;
    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    const [w0, w1] = cols().map((c) => Number.parseFloat(c.style.width));
    expect(w0).toBeCloseTo(w1!);

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.dblClick(handle);
    const [r0, r1] = cols().map((c) => Number.parseFloat(c.style.width));
    expect(r0).toBeCloseTo(r1!);
  });

  it("reports its position as a percentage of the pair's travel, not a raw pixel count", () => {
    resizableMarkup();
    widenColumns(200);
    const handle = resizers()[0]!;
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
  });
});
