/*
 * The command palette, the docs' one consumer of the hotkey primitive.
 *
 * It owns no matching and no platform branching: `bindHotkey("mod+k", …)` is the whole shortcut, and
 * `formatHotkey` fills the visible badge with the right chord for the OS. Everything else here is the
 * palette itself, a filtered listbox over the nav index, driven from the keyboard.
 */
import { detectMac, formatHotkey } from "@skryensya/core/hotkey";
import { bindHotkey } from "@skryensya/vanilla/hotkey";

interface Entry {
  label: string;
  aliases: string[];
  href: string;
  section: string;
  group: string;
}

function normalizeSearchTerm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Rank a query against an entry. Returns null for no match, lower is better. Prefix beats contains,
 *  a hit in the label or an alias beats a hit in the section, so "acordeon" finds Accordion before
 *  it surfaces a page whose context merely contains the letters. */
function score(entry: Entry, query: string): number | null {
  const names = [entry.label, ...entry.aliases].map(normalizeSearchTerm);
  const context = normalizeSearchTerm(`${entry.section} ${entry.group}`);
  if (names.some((name) => name.startsWith(query))) return 0;
  if (names.some((name) => name.includes(query))) return 1;
  if (context.includes(query)) return 2;
  return null;
}

export function initCommandPalette(): void {
  const dialog = document.getElementById("docs-cmdk");
  const input = document.getElementById("docs-cmdk-input") as HTMLInputElement | null;
  const list = document.getElementById("docs-cmdk-list");
  const empty = document.querySelector<HTMLElement>("[data-cmdk-empty]");
  const indexScript = document.getElementById("docs-cmdk-index");
  // Every `[data-docs-cmdk-open]` opens the SAME dialog, navbar, catalog, etc. Never a second palette.
  const triggers = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-docs-cmdk-open]"),
  ];
  if (!(dialog instanceof HTMLDialogElement) || !input || !list || !indexScript) return;

  let index: Entry[] = [];
  try {
    index = JSON.parse(indexScript.textContent || "[]");
  } catch {
    index = [];
  }

  // The shortcut, shown the way the OS shows it. Detect the platform once for the badges, the same
  // read the hotkey binding uses, from the core beside the matcher.
  const isMac = detectMac();
  document
    .querySelectorAll<HTMLElement>("[data-cmdk-hint]")
    .forEach((el) => {
      // the Esc badge inside the dialog stays Esc; only the trigger's ⌘K badge is platform-swapped
      if (el.textContent?.trim() === "Esc") return;
      el.textContent = formatHotkey("mod+k", isMac);
    });

  let results: Entry[] = [];
  let active = -1;

  const optionId = (i: number) => `docs-cmdk-option-${i}`;

  const render = (query: string) => {
    const q = normalizeSearchTerm(query);
    results = q === ""
      ? index
      : index
          .map((entry) => ({ entry, rank: score(entry, q) }))
          .filter((r): r is { entry: Entry; rank: number } => r.rank !== null)
          .sort((a, b) => a.rank - b.rank)
          .map((r) => r.entry);

    list.innerHTML = results
      .map(
        (entry, i) =>
          `<li class="docs-cmdk__option" id="${optionId(i)}" role="option" aria-selected="false" data-href="${entry.href}">` +
          `<span class="docs-cmdk__option-label">${entry.label}</span>` +
          `<span class="docs-cmdk__option-context">${entry.section} › ${entry.group}</span>` +
          `</li>`,
      )
      .join("");

    empty?.toggleAttribute("hidden", results.length !== 0);
    setActive(results.length ? 0 : -1);
  };

  const setActive = (next: number) => {
    const options = list.querySelectorAll<HTMLElement>(".docs-cmdk__option");
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

  const go = (i: number) => {
    const href = results[i]?.href;
    if (href) window.location.assign(href);
  };

  const setExpanded = (expanded: boolean) => {
    for (const trigger of triggers) {
      trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
  };

  const open = () => {
    if (dialog.open) return;
    input.value = "";
    render("");
    dialog.showModal();
    // focus after the dialog is in the top layer, or the caret lands nowhere
    requestAnimationFrame(() => input.focus());
    setExpanded(true);
  };
  const close = () => dialog.close();

  input.addEventListener("input", () => render(input.value));

  input.addEventListener("keydown", (event) => {
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
    // Escape is the platform's: the native <dialog> closes on it with no handler here.
  });

  // Click a result. Delegated, because the list is re-rendered on every keystroke.
  list.addEventListener("click", (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>(".docs-cmdk__option");
    if (option?.dataset.href) window.location.assign(option.dataset.href);
  });

  // Click on the backdrop (the dialog's own box, outside the panel) closes it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("close", () => setExpanded(false));

  for (const trigger of triggers) {
    trigger.addEventListener("click", open);
  }
  // The shortcut itself. `mod` is ⌘ on Mac, Ctrl elsewhere, one binding, both platforms.
  bindHotkey("mod+k", open);
}
