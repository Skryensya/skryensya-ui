import {
  hasCrossedDragThreshold,
  resolveColumnResize,
  resolveSplitterKey,
  resolveWeightedColumnWidths,
  splitterDirectionSign,
  splitterValuePercent,
} from "@skryensya/core/splitter";

/*
 * SPLITTER, the imperative binding for a COLUMN-RESIZE handle — the pointer/keyboard wiring
 * `@skryensya/core/splitter`'s own banner leaves to each binding, now written ONCE instead of once
 * per consumer: Treegrid's column resizer and a plain Table's both attach one of these per column
 * boundary, and until this file existed the two copied each other's press-vs-drag arming, RTL sign
 * and keyboard handling byte for byte. What stays OUTSIDE this function, on purpose, is the value
 * model: the caller hands over `getWidths`/`setWidths` closures over ITS OWN width state (a
 * `<col>` array read via inline styles today, in principle anything), so this file never has to
 * know where the numbers live, only how a "Window Splitter" gesture turns into a call against them.
 */

export interface ColumnResizerOptions {
  /** The header cell this handle sits inside — appended as its last child. */
  readonly th: HTMLElement;
  /** This handle sits BETWEEN column `index` and `index + 1` — `resolveColumnResize`'s own indexing. */
  readonly index: number;
  readonly getWidths: () => readonly number[];
  readonly setWidths: (widths: readonly number[]) => void;
  readonly min: number;
  readonly ariaLabel: string;
  /** Reads current writing direction fresh per gesture — a document can flip direction under a
   * long-lived table, the same reasoning `sidebar.ts`'s own `towardWider` documents. */
  readonly direction: () => "ltr" | "rtl";
  /** The caller's OWN part class (`sk-table__column-resizer`, `sk-treegrid__column-resizer`, …),
   * composed with the shared `sk-splitter` pattern the same way every other part composes it — the
   * gesture is generic, the paint is still the consumer's, per-contract part class. */
  readonly className: string;
}

/**
 * Seeds column widths from `measured`'s real rendered width, watching for one if it reads 0 right
 * now — `measured` can be `display: none` at the moment a table mounts (a docs preview panel not
 * yet the selected binding tab, a closed accordion, an inactive tab panel: all read 0 the whole
 * time they stay hidden), and 0 ÷ colCount would seed every column at the min floor permanently,
 * since nothing would ever ask again. A synchronous read that already succeeds needs no observer at
 * all; only a genuinely-zero read starts one, and it disconnects itself the moment a real,
 * nonzero width finally arrives — this only ever seeds once, a mount concern, not a resize one.
 */
export function watchColumnLayout(options: {
  readonly measured: HTMLElement;
  readonly colCount: number;
  readonly min: number;
  /** One positive weight per column — `resolveWeightedColumnWidths`'s own doc
   * (`@skryensya/core/splitter`) explains why an equal split is not always the seed a consumer
   * wants. Omitted, every column starts equal, the prior behaviour. */
  readonly weights?: readonly number[];
  readonly apply: (widths: readonly number[]) => void;
}): () => void {
  const { measured, colCount, min, apply } = options;
  const weights = options.weights ?? Array.from({ length: colCount }, () => 1);
  // Guards against a callback already in flight the instant `disconnect()` is called — a real race,
  // not a hypothetical one, since `ResizeObserver` batches and delivers on the next frame.
  let seeded = false;
  const seedFrom = (total: number): boolean => {
    if (seeded || total <= 0) return false;
    seeded = true;
    apply(resolveWeightedColumnWidths({ total, weights, min }));
    return true;
  };
  if (seedFrom(measured.getBoundingClientRect().width)) return () => {};
  const observer = new ResizeObserver((entries) => {
    if (seedFrom(entries[0]?.contentRect.width ?? 0)) observer.disconnect();
  });
  observer.observe(measured);
  return () => observer.disconnect();
}

/** Attaches one column-resize handle and returns its own cleanup — same shape every enhancer here
 * returns, and the same one `bindHotkey` documents for a single reusable primitive. */
export function attachColumnResizer(options: ColumnResizerOptions): () => void {
  const { th, index, getWidths, setWidths, min, ariaLabel, direction, className } = options;
  const doc = th.ownerDocument;

  const handle = doc.createElement("div");
  handle.className = `${className} sk-splitter`;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.setAttribute("aria-valuemin", "0");
  handle.setAttribute("aria-valuemax", "100");
  handle.setAttribute("aria-label", ariaLabel);
  handle.setAttribute("data-sk-column-resizer", "");
  handle.tabIndex = 0;

  const sign = () => splitterDirectionSign(direction());

  const describe = () => {
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const total = before + after;
    const max = Math.max(min, total - min);
    handle.setAttribute("aria-valuenow", String(splitterValuePercent(before, min, max)));
  };

  const resize = (delta: number) => {
    setWidths(resolveColumnResize({ widths: getWidths(), index, delta, min }));
    describe();
  };

  /** Back to an even split between this pair — the keyboard's answer to double-click, same as
   * Sidebar's own Enter/dblclick reset. */
  const reset = () => {
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    resize((before + after) / 2 - before);
  };

  let pointerId: number | null = null;
  let startX = 0;
  let startWidths: readonly number[] = [];
  let dragging = false;

  const onPointerDown = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0) return;
    pointer.preventDefault();
    pointerId = pointer.pointerId;
    startX = pointer.clientX;
    dragging = false;
    handle.setPointerCapture(pointer.pointerId);
  };

  const onPointerMove = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointerId === null || pointer.pointerId !== pointerId) return;
    if (!dragging) {
      if (!hasCrossedDragThreshold(startX, pointer.clientX)) return;
      // The gesture is a drag. Measure from HERE, so the width does not jump by the slop.
      dragging = true;
      startX = pointer.clientX;
      startWidths = getWidths();
      handle.setAttribute("data-dragging", "");
    }
    setWidths(
      resolveColumnResize({ widths: startWidths, index, delta: (pointer.clientX - startX) * sign(), min }),
    );
    describe();
  };

  const onPointerUp = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointerId === null || pointer.pointerId !== pointerId) return;
    if (handle.hasPointerCapture(pointer.pointerId)) handle.releasePointerCapture(pointer.pointerId);
    pointerId = null;
    // A press that never became a drag ends here: nothing moved.
    if (!dragging) return;
    dragging = false;
    handle.removeAttribute("data-dragging");
  };

  const onKeyDown = (event: Event) => {
    const key = event as KeyboardEvent;
    const action = resolveSplitterKey(key);
    switch (action.kind) {
      case "delta":
        resize(action.delta * sign());
        break;
      case "home":
        resize(-Infinity);
        break;
      case "end":
        resize(Infinity);
        break;
      case "reset":
        key.preventDefault();
        reset();
        return;
      case "none":
        return;
    }
    key.preventDefault();
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);
  handle.addEventListener("keydown", onKeyDown);
  handle.addEventListener("dblclick", reset);

  th.appendChild(handle);
  describe();

  return () => {
    handle.removeEventListener("pointerdown", onPointerDown);
    handle.removeEventListener("pointermove", onPointerMove);
    handle.removeEventListener("pointerup", onPointerUp);
    handle.removeEventListener("pointercancel", onPointerUp);
    handle.removeEventListener("keydown", onKeyDown);
    handle.removeEventListener("dblclick", reset);
    handle.remove();
  };
}
