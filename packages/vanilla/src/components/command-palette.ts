import {
  commandPaletteAttrs,
  commandPaletteOptionContext,
  commandPaletteParts,
  filterCommandPaletteEntries,
  type CommandPaletteEntry,
} from "@skryensya/core/command-palette";
import { detectMac, formatHotkey } from "@skryensya/core/hotkey";
import { bindHotkey } from "../hotkey.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";
import { connectVaul } from "./vaul.js";

const rootSelector = `[${commandPaletteAttrs.root}]`;
const openSelector = `[${commandPaletteAttrs.open}]`;
const hintSelector = `[${commandPaletteAttrs.hint}]`;

type Cleanup = () => void;

function readIndex(root: HTMLElement): CommandPaletteEntry[] {
  const indexId = root.getAttribute(commandPaletteAttrs.index);
  if (!indexId) return [];
  const script = document.getElementById(indexId);
  if (!script) return [];
  try {
    const parsed = JSON.parse(script.textContent || "[]") as CommandPaletteEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

/** Binds one authored Command Palette: filter, listbox keyboard, open triggers and optional hotkey. */
export function connectCommandPalette(root: HTMLElement): Cleanup {
  if (!(root instanceof HTMLDialogElement)) {
    throw new Error(`CommandPalette root [${commandPaletteAttrs.root}] must be a <dialog>.`);
  }

  /*
   * A palette that opts into Dialog Vaul (`data-sk-dialog-vaul`, the mobile bottom sheet) still
   * needs the drag-to-dismiss gesture, but it cannot come from the generic `mountVaul` auto-loader:
   * that mount and this one share one lifecycle marker (`data-sk-ready`/`-mounting`,
   * `createConnectMount`'s own doc says "selectors are disjoint, so a root gets enhanced by exactly
   * one enhancer"), and this root matches BOTH. Whichever claims it first marks it ready for both,
   * so the second - always this one, since it is lazy and the Vaul auto-loader is eager - found the
   * root already "ready" and never wired a single listener: no crash, just a search button and a
   * drawer trigger that silently did nothing. The registry's own selector now excludes command
   * palettes for the same reason (`registry.ts`); this call is what still gives them the gesture.
   */
  const cleanupVaul = root.matches("[data-sk-dialog-vaul]") ? connectVaul(root) : null;

  const input = root.querySelector<HTMLInputElement>(`[${commandPaletteAttrs.input}]`);
  const list = root.querySelector<HTMLElement>(`[${commandPaletteAttrs.list}]`);
  const empty = root.querySelector<HTMLElement>(`[${commandPaletteAttrs.empty}]`);
  if (!input || !list) {
    throw new Error("CommandPalette requires authored input and list parts.");
  }

  const index = readIndex(root);
  const dialogId = root.id;
  const triggers = dialogId
    ? [
        ...document.querySelectorAll<HTMLElement>(
          `${openSelector}[aria-controls="${CSS.escape(dialogId)}"]`,
        ),
        ...document.querySelectorAll<HTMLElement>(
          `[${commandPaletteAttrs.open}="${CSS.escape(dialogId)}"]`,
        ),
      ]
    : [...document.querySelectorAll<HTMLElement>(openSelector)];

  // Deduplicate if aria-controls and value both point at the same control.
  const uniqueTriggers = [...new Set(triggers)];

  // Hotkey is opt-in: only the palette that owns `data-sk-command-palette-hotkey` binds and fills
  // platform badges, so a docs demo does not steal ⌘K from the site chrome palette.
  const hotkeySpec = root.getAttribute(commandPaletteAttrs.hotkey);
  if (hotkeySpec) {
    const isMac = detectMac();
    document.querySelectorAll<HTMLElement>(hintSelector).forEach((el) => {
      if (el.textContent?.trim() === "Esc") return;
      el.textContent = formatHotkey(hotkeySpec, isMac);
    });
  }

  let results: CommandPaletteEntry[] = [];
  let active = -1;
  const optionId = (i: number) => `${root.id || "sk-command-palette"}-option-${i}`;

  const setExpanded = (expanded: boolean) => {
    // The combobox itself, not just the external open-buttons: `input` is what carries
    // `role="combobox"`, so it is what a screen reader actually questions about expansion.
    input.setAttribute("aria-expanded", expanded ? "true" : "false");
    for (const trigger of uniqueTriggers) {
      trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
  };

  const setActive = (next: number) => {
    const options = list.querySelectorAll<HTMLElement>(`.${commandPaletteParts.option}`);
    if (active >= 0 && options[active]) options[active].setAttribute("aria-selected", "false");
    active = next;
    if (active >= 0 && options[active]) {
      options[active].setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", optionId(active));
      options[active].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  /*
   * Feed the results' natural height to the stylesheet as a length so `.sk-command-palette__list`
   * can TRANSITION between result counts instead of snapping (the clamp + transition live in
   * command-palette.css).
   *
   * Measured from the child rows, not `list.scrollHeight`: `scrollHeight` is never smaller than the
   * box, so once the list has grown it can never report a SHRUNK content height, and touching the
   * list's own `block-size` to force a re-measure cancels the very transition this exists to feed.
   * `last.bottom - first.top` is the rows' total extent and is unaffected by the box height or its
   * scroll position; add the list's own block padding back. The CSS `clamp()` owns the floor and
   * ceiling, so no clamping here.
   */
  const sizeList = () => {
    const first = list.firstElementChild;
    const last = list.lastElementChild;
    if (!first || !last) {
      list.style.removeProperty("--sk-command-palette-list-content");
      return;
    }
    const styles = getComputedStyle(list);
    const padding =
      (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
    const rows = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
    list.style.setProperty(
      "--sk-command-palette-list-content",
      `${Math.ceil(rows + padding)}px`,
    );
  };

  const render = (query: string) => {
    results = filterCommandPaletteEntries(index, query);
    list.innerHTML = results
      .map((entry, i) => {
        const context = commandPaletteOptionContext(entry);
        return (
          `<li class="${commandPaletteParts.option}" id="${optionId(i)}" role="option" aria-selected="false" data-href="${escapeAttr(entry.href)}">` +
          `<span class="${commandPaletteParts.optionLabel}">${escapeAttr(entry.label)}</span>` +
          (context
            ? `<span class="${commandPaletteParts.optionContext}">${escapeAttr(context)}</span>`
            : "") +
          `</li>`
        );
      })
      .join("");
    /*
     * Both flags, from the one place that knows the answer.
     *
     * `aria-expanded` is about whether there is a popup to expand, so it follows the LIST: it used
     * to be set to `true` by `open()` regardless, which announced an expanded popup over an empty
     * listbox, the exact thing this contract's header says both bindings exist to avoid. "No results" answers a different question, whether anything was ASKED, so it waits for a query
     * instead of greeting an untouched palette with an absence nobody was looking for.
     */
    setExpanded(results.length > 0);
    empty?.toggleAttribute("hidden", results.length !== 0 || query.trim() === "");
    setActive(results.length ? 0 : -1);
    sizeList();
  };

  const go = (i: number) => {
    const href = results[i]?.href;
    if (href) window.location.assign(href);
  };

  const open = () => {
    if (root.open) return;
    input.value = "";
    render("");
    root.showModal();
    requestAnimationFrame(() => {
      input.focus();
      /* Now that the sheet is on screen, take the real measurement `render()` could not while it
       * was `display: none`, so the first keystroke resizes from a true height. */
      sizeList();
    });
  };

  const close = () => root.close();

  const onInput = () => render(input.value);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(active + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(active - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0) go(active);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(results.length - 1);
    }
  };

  const onListClick = (event: MouseEvent) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>(
      `.${commandPaletteParts.option}`,
    );
    if (option?.dataset.href) window.location.assign(option.dataset.href);
  };

  const onDialogClick = (event: MouseEvent) => {
    if (event.target === root) close();
  };

  const onClose = () => setExpanded(false);

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeyDown);
  list.addEventListener("click", onListClick);
  root.addEventListener("click", onDialogClick);
  root.addEventListener("close", onClose);

  const onTriggerClick = () => open();
  for (const trigger of uniqueTriggers) {
    trigger.addEventListener("click", onTriggerClick);
  }

  const unbindHotkey = hotkeySpec ? bindHotkey(hotkeySpec, open) : () => {};

  /*
   * Mounted onto an ALREADY-OPEN dialog. A lazy host (docs chrome, `search-trigger.ts`) shows the
   * sheet with `showModal()` on the first tap, before this enhancer's chunk has loaded, so the sheet
   * is never gated behind an import. `open()` bails on an open dialog, so run its first-open work
   * here instead: fill the list, take focus, and flip `aria-expanded` so the combobox does not
   * announce a populated listbox as collapsed.
   */
  if (root.open) {
    render(input.value);
    requestAnimationFrame(() => {
      input.focus();
      sizeList();
    });
  }

  return () => {
    input.removeEventListener("input", onInput);
    input.removeEventListener("keydown", onKeyDown);
    list.removeEventListener("click", onListClick);
    root.removeEventListener("click", onDialogClick);
    root.removeEventListener("close", onClose);
    for (const trigger of uniqueTriggers) {
      trigger.removeEventListener("click", onTriggerClick);
    }
    unbindHotkey();
    cleanupVaul?.();
  };
}

export const mountCommandPalette = createConnectMount({
  key: "command-palette",
  rootSelector,
  connect: connectCommandPalette,
});
