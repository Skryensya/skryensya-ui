import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountTable } from "./table.js";

/** Three columns, so "no resizer after the LAST column" is distinguishable from "no resizer at all". */
function resizableMarkup() {
  document.body.innerHTML = `<table class="sk-table" data-resizable-columns data-resize-label="Redimensionar columna">
    <thead>
      <tr><th scope="col">Nombre</th><th scope="col">Tipo</th><th scope="col">Tamaño</th></tr>
    </thead>
    <tbody>
      <tr><td>index.ts</td><td>Archivo</td><td>2 KB</td></tr>
    </tbody>
  </table>`;
  return document.querySelector<HTMLElement>(".sk-table")!;
}

function plainMarkup() {
  document.body.innerHTML = `<table class="sk-table">
    <thead><tr><th scope="col">Nombre</th><th scope="col">Tipo</th></tr></thead>
    <tbody><tr><td>index.ts</td><td>Archivo</td></tr></tbody>
  </table>`;
  return document.querySelector<HTMLElement>(".sk-table")!;
}

/** A treegrid is ALSO a `.sk-table` (Treegrid's own `also: ["sk-table"]`) — this markup exists only
 * to prove `mountTable`'s own selector excludes it, never to exercise treegrid behaviour. */
function treegridLookalikeMarkup() {
  document.body.innerHTML = `<table class="sk-treegrid sk-table" data-sk-treegrid data-resizable-columns data-resize-label="x" role="treegrid" aria-label="x">
    <thead><tr><th scope="col">Nombre</th><th scope="col">Tipo</th></tr></thead>
    <tbody><tr><td role="gridcell">x</td><td role="gridcell">y</td></tr></tbody>
  </table>`;
  return document.querySelector<HTMLElement>("[data-sk-treegrid]")!;
}

afterEach(() => {
  const root = document.querySelector<HTMLElement>(".sk-table, [data-sk-treegrid]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

const resizers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-sk-column-resizer]"));
const cols = () => Array.from(document.querySelectorAll<HTMLTableColElement>("col"));

describe("Table vanilla enhancer", () => {
  it("never enhances a plain table without `data-resizable-columns`", () => {
    plainMarkup();
    expect(mountTable(document)).toBe(0);
    expect(resizers()).toHaveLength(0);
    expect(cols()).toHaveLength(0);
  });

  it("mounts a resizable table and inserts one resizer per column boundary", () => {
    const root = resizableMarkup();
    expect(mountTable(document)).toBe(1);
    expect(root.querySelectorAll("col")).toHaveLength(3);
    expect(resizers()).toHaveLength(2); // three columns, two boundaries
    for (const handle of resizers()) {
      expect(handle.getAttribute("role")).toBe("separator");
      expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    }
  });

  it("names each resizer from the shared label plus its OWN column header", () => {
    resizableMarkup();
    mountTable(document);
    expect(resizers()[0]!.getAttribute("aria-label")).toBe("Redimensionar columna: Nombre");
    expect(resizers()[1]!.getAttribute("aria-label")).toBe("Redimensionar columna: Tipo");
  });

  it("never mounts twice on a Treegrid table that happens to also be `.sk-table[data-resizable-columns]`", () => {
    treegridLookalikeMarkup();
    expect(mountTable(document)).toBe(0);
    expect(resizers()).toHaveLength(0);
  });

  it("Left/Right resize by a step, Shift+Left/Right by the coarse step", () => {
    resizableMarkup();
    mountTable(document);
    // jsdom has no layout, so the seed clamps to the min floor on every column — widen first so
    // there is real room to demonstrate a resize (same trick `treegrid.test.ts`'s own suite uses).
    for (const col of cols()) col.style.width = "200px";
    const handle = resizers()[0]!;
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(216);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(152);
  });

  it("Home/End jump to the resized pair's min/max extent, total conserved", () => {
    resizableMarkup();
    mountTable(document);
    for (const col of cols()) col.style.width = "200px";
    const handle = resizers()[0]!;
    const before = cols().map((c) => Number.parseFloat(c.style.width));
    const total = before[0]! + before[1]!;

    fireEvent.keyDown(handle, { key: "End" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(total - 60); // 60 = SPLITTER_MIN_COLUMN_WIDTH
    expect(Number.parseFloat(cols()[2]!.style.width)).toBeCloseTo(before[2]!); // untouched

    fireEvent.keyDown(handle, { key: "Home" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(60);
  });

  it("is idempotent — re-mounting does not duplicate the colgroup or the resizers", () => {
    resizableMarkup();
    expect(mountTable(document)).toBe(1);
    expect(mountTable(document)).toBe(0);
    expect(document.querySelectorAll("colgroup")).toHaveLength(1);
    expect(resizers()).toHaveLength(2);
  });

  it("double-click (and Enter) fits the column to its own content, not an even split", () => {
    const root = resizableMarkup();
    mountTable(document);
    for (const col of cols()) col.style.width = "200px";
    // `measureColumnContentWidth` measures a detached CLONE, never the real cell (its own suite
    // covers that in full) — this stub answers by text content, the one thing a clone still
    // carries faithfully, so "Nombre" (header) and "index.ts" (body) both resolve to 130 here.
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const width = this.textContent === "Nombre" || this.textContent === "index.ts" ? 130 : 0;
      return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    const handle = resizers()[0]!;

    fireEvent.dblClick(handle);
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(130);
    // The pair's total stays conserved — the neighbor absorbs exactly what column 0 gave up.
    expect(Number.parseFloat(cols()[0]!.style.width) + Number.parseFloat(cols()[1]!.style.width)).toBeCloseTo(400);

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(Number.parseFloat(cols()[0]!.style.width)).toBeCloseTo(130);
    spy.mockRestore();
  });

  it("keeps --sk-splitter-block-size matched to the table's height measured from its first row", () => {
    const root = resizableMarkup();
    root.getBoundingClientRect = () => ({ bottom: 240, height: 240 }) as DOMRect;
    // jsdom's own default rect (all-zero) stands in for the first row's top here — the height above
    // is deliberately NOT what the table itself would report if it had a caption, see the next test.
    mountTable(document);
    expect(root.style.getPropertyValue("--sk-splitter-block-size")).toBe("240px");
  });

  it("excludes a <caption>'s own height — the resizer starts at the header row, not the caption", () => {
    document.body.innerHTML = `<table class="sk-table" data-resizable-columns data-resize-label="x">
      <caption>Archivos</caption>
      <thead><tr><th scope="col">Nombre</th><th scope="col">Tipo</th></tr></thead>
      <tbody><tr><td>index.ts</td><td>Archivo</td></tr></tbody>
    </table>`;
    const root = document.querySelector<HTMLElement>(".sk-table")!;
    const firstRow = root.querySelector<HTMLElement>("tr")!;
    // The table's OWN box includes the caption (`table.css`'s own note); the first row's does not.
    root.getBoundingClientRect = () => ({ top: 0, bottom: 300 }) as DOMRect;
    firstRow.getBoundingClientRect = () => ({ top: 40 }) as DOMRect; // 40px of caption above it
    mountTable(document);
    expect(root.style.getPropertyValue("--sk-splitter-block-size")).toBe("260px"); // 300 - 40, not 300
  });
});
