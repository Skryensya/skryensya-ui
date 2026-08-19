/*
 * ONE COPY BUTTON FOR A WHOLE PAGE OF COPYABLE CELLS, moved to the cell you are pointing at.
 *
 * WHAT THIS REPLACES. The token reference rendered a real CopyButton in every copyable cell: 3.135
 * of them, 1.660 bytes each, 5,1 MB of a 6,8 MB document, 6.280 inline `<svg>`s for the icon guard
 * to rewrite before first paint, and 3.135 tab stops between the filter and the bottom of the page.
 * All of it to draw an affordance that only ever exists in ONE cell at a time: the one under the
 * pointer.
 *
 * So the button is a single element that travels. It is the SAME element `CopyButton.astro`
 * authors, bound by the same `initCopyButtons` behavior (`scripts/copy-button.ts`, decision 33: no
 * published contract owns this shape any more), so it is not a lookalike: it is an icon-only small
 * button because it IS the one the kit ships, and the copying, the copied/error states and the
 * anchored feedback flag are that script's, untouched.
 *
 * WHAT MAKES THAT LEGAL. The bound button reads `data-sk-copy-button-target` at CLICK time, not at
 * mount, so retargeting a mounted button is a supported move rather than a trick: this file writes
 * the id of the cell's own value span before the click can happen.
 *
 * THE KEYBOARD IS NOT AN AFTERTHOUGHT HERE, it is the part that got better. Reaching the copy
 * button of the six-hundredth token used to mean six hundred tab stops; now the tables hold exactly
 * one, and the arrow keys walk it cell by cell and row by row from wherever it is.
 */
import { attrs as copyButtonAttrs } from "./copy-button.js";

/** The docs' own marker for "this cell holds one copyable value", from `site.css`. */
const CELL = ".sk-table__cell--copy, .sk-table__header--copy";
const HOME = "[data-docs-copy-cells]";

type Cell = HTMLTableCellElement;

let button: HTMLElement | null = null;
let home: HTMLElement | null = null;
let copyWord = "Copy";

/** The cell's own value, in the id'd span the enhancer copies from. */
function valueOf(cell: Cell): HTMLElement | null {
  const span = cell.querySelector<HTMLElement>("span[id]");
  return span?.id ? span : null;
}

function visible(cell: Element): boolean {
  const row = cell.closest("tr");
  /* `hidden` is what the token filter writes, on the row and on the whole family block. Reading the
     attribute instead of measuring keeps this off the layout path entirely. */
  return !row?.hidden && !cell.closest("[data-group]")?.hasAttribute("hidden");
}

function place(cell: Cell): void {
  const span = valueOf(cell);
  if (!button || !span) return;

  if (button.parentElement !== cell) cell.append(button);
  button.setAttribute(copyButtonAttrs.target, span.id);
  /*
   * Re-labelled on every move, because one button standing in for three thousand has to say WHICH
   * value it is about to copy, and a screen reader reads the label, not the cell it happens to sit
   * in. The enhancer restores its own idle label after a copy; the next move corrects it.
   */
  /* Collapsed, because a definition keeps the newlines of the stylesheet it was parsed from, and a
     screen reader announcing a label with line breaks in it reads them as pauses in the value. */
  button.setAttribute(
    "aria-label",
    `${copyWord}: ${(span.textContent ?? "").replace(/\s+/g, " ").trim()}`,
  );
}

function park(): void {
  /* Never while it is focused: parking a focused control is how a keyboard user loses their place
     for no reason they can see. */
  if (!button || !home || document.activeElement === button) return;
  if (button.parentElement !== home) home.append(button);
}

/** Every copyable cell of the table the button is in, in reading order. */
function cellsAround(cell: Cell): Cell[] {
  const table = cell.closest("table");
  return table ? Array.from(table.querySelectorAll<Cell>(CELL)).filter(visible) : [cell];
}

function step(cell: Cell, key: string): Cell | undefined {
  const cells = cellsAround(cell);
  const index = cells.indexOf(cell);
  if (index < 0) return undefined;

  const row = cell.closest("tr");
  const perRow = row ? row.querySelectorAll(CELL).length : 1;

  switch (key) {
    case "ArrowRight":
      return cells[index + 1];
    case "ArrowLeft":
      return cells[index - 1];
    /* A column at a time: the same cell of the next row is `perRow` cells further along, which is
       exact as long as every row of a table carries the same copyable columns, and they do, the
       rows come from one template. */
    case "ArrowDown":
      return cells[index + perRow];
    case "ArrowUp":
      return cells[index - perRow];
    default:
      return undefined;
  }
}

/**
 * Re-park the button when the cell it is in stops being on screen. The token filter hides rows and
 * whole families as you type, and a button inside one of those goes with it: for a pointer that is
 * invisible and harmless, but it is also the page's only copy control, so it has to come back.
 */
export function revalidateCopyCells(): void {
  const cell = button?.parentElement?.closest<Cell>(CELL);
  if (!cell) return;
  if (!visible(cell)) park();
}

export function initCopyCells(): void {
  home = document.querySelector<HTMLElement>(HOME);
  button = home?.querySelector<HTMLElement>(`[${copyButtonAttrs.root}]`) ?? null;
  if (!home || !button) return;
  copyWord = home.dataset.copyWord || copyWord;

  /*
   * ONE listener for the document, not one per cell. `pointerover` fires as the pointer crosses
   * element boundaries, so the work per event is a `closest()` on the element it entered.
   */
  document.addEventListener(
    "pointerover",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cell = target.closest<Cell>(CELL);
      if (cell) place(cell);
      else if (!target.closest(HOME)) park();
    },
    { passive: true },
  );

  button.addEventListener("keydown", (event) => {
    const cell = button?.parentElement?.closest<Cell>(CELL);
    if (!cell) return;
    const next = step(cell, event.key);
    if (!next) return;
    event.preventDefault();
    place(next);
    button?.focus();
  });

  /* Somewhere to land before anyone has hovered anything: the first copyable value on the page, so
     the tables hold a real tab stop from the first Tab rather than only after a pointer wakes it. */
  const first = document.querySelector<Cell>(CELL);
  if (first) place(first);
}
