import { menuParts } from "./menu.js";

/*
 * The `debugSafetyTriangle` status line: is the safe area holding the pointer right now?
 *
 * This replaces a badge that used to be appended to `<body>` at `position: fixed` pinned to the
 * top-inline-start corner. In a docs preview frame (`viewport="menu"`, 18rem tall) that corner is
 * exactly where the menu's own trigger sits, so the readout covered the button it was explaining —
 * and it was created once PER OPEN SUBMENU, so a second level stacked another badge on the same
 * coordinates. A readout that hides the thing it reads is worse than no readout.
 *
 * So it is laid out instead of floated: ONE per flagged menu root, appended to that root, taking up
 * its own space beside the trigger (menu.css turns a flagged root into a column for exactly this).
 * Nothing can overlap it because nothing is positioned.
 *
 * `report(id, holding)` rather than `set(holding)` because "is the pointer protected" is a question
 * about the whole menu, not about one level: with two levels open, the second level's safe area
 * releasing must not report "free" while the first is still holding. A set of ids answers that
 * exactly, and a level that unmounts drops its id, so the readout cannot get stuck lit.
 */

export interface IntentReadoutLabels {
  label: string;
  lockedText: string;
  freeText: string;
}

export interface IntentReadoutHandle {
  report(id: string, holding: boolean): void;
  release(id: string): void;
  destroy(): void;
}

const readouts = new WeakMap<HTMLElement, IntentReadoutHandle>();

/**
 * The handle for `root`, created on first use. Both bindings ask the same way: vanilla passes the
 * root it found with `closest()`, React passes the root element it rendered — one readout per menu
 * either way, with no binding owning the lifetime.
 */
export function getIntentReadout(
  root: HTMLElement,
  labels: IntentReadoutLabels,
): IntentReadoutHandle {
  const existing = readouts.get(root);
  if (existing) return existing;

  const doc = root.ownerDocument ?? document;
  const node = doc.createElement("p");
  node.className = menuParts.intentReadout;
  const dot = doc.createElement("span");
  dot.className = menuParts.intentReadoutDot;
  dot.setAttribute("aria-hidden", "true");
  const text = doc.createElement("span");
  node.append(dot, text);
  /*
   * BEFORE the trigger, not after. Space in the layout is not the same as being visible: appended
   * below, the readout sat exactly where the panel opens (`bottom-start`, the menu's own placement),
   * and a `position: fixed` panel at `--z-popover` covers a static box every time — the readout had
   * its own box and still could not be read while the menu was open, which is the only moment it
   * says anything. Above the trigger, the panel grows away from it.
   */
  root.prepend(node);

  const holdingIds = new Set<string>();

  const paint = () => {
    const holding = holdingIds.size > 0;
    node.setAttribute("data-locked", String(holding));
    text.textContent = `${labels.label}: ${holding ? labels.lockedText : labels.freeText}`;
  };
  paint();

  const handle: IntentReadoutHandle = {
    report(id, holding) {
      if (holding) holdingIds.add(id);
      else holdingIds.delete(id);
      paint();
    },
    release(id) {
      holdingIds.delete(id);
      paint();
    },
    destroy() {
      node.remove();
      readouts.delete(root);
    },
  };
  readouts.set(root, handle);
  return handle;
}
