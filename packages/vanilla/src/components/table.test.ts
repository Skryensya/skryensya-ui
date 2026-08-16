import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
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
});
