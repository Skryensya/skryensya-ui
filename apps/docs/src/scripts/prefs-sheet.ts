/*
 * Behavior for the reader-preference sheet (`#docs-prefs-sheet` in `Base.astro`). Docs-local site
 * chrome, same footing as `search-trigger.ts` / `theme-toggle.ts`: no published contract owns it.
 *
 * WHY THIS EXISTS SEPARATELY FROM `mountVaul`. The sheet is the SAME composition as the Command
 * Palette - a native `<dialog data-sk-dialog-vaul>`, slid up by `dialog-vaul.css`, drag/light-dismiss
 * from `connectVaul` - and `mountVaul` (registry.ts) already auto-wires its trigger. But that wiring
 * only exists AFTER the vanilla chunk has loaded, and that chunk statically pulls the Svelte 5
 * runtime (`createConnectMount` → `Imperative.svelte`); on a cold mobile load the trigger is dead
 * until it arrives. The Command Palette hit exactly this and grew a framework-free eager opener
 * (`search-trigger.ts`, commit "open command palette instantly on mobile"); this is the same move for
 * the prefs sheet. `showModal()` is called straight from the click, inside the user gesture, so iOS
 * Safari keeps the transient activation and the sheet is up the instant the finger lifts.
 *
 * `connectVaul` then adopts the (already-open) dialog for drag and backdrop-dismiss when its chunk
 * lands, exactly as `connectCommandPalette` adopts an already-open palette. `open` is guarded on
 * `!root.open`, so the two openers never double-fire `showModal()` on one tap.
 *
 * IT ALSO CLEARS STALE VAUL DRAG STATE ON OPEN. A phantom touch on the `touch-action: none` grab
 * handle while the dialog is entering the top layer can leave `connectVaul` mid-gesture with
 * `--sk-vaul-drag-offset` written and `[data-dragging]` set (→ `transition: none; translate: 0
 * <offset>`), and the `pointerup` that would clear it never arrives because pointer capture is
 * dropped when the element enters the top layer (`vaul.ts` documents this hazard). The sheet then
 * rests part-way down, looking half-open / slid off the bottom of the viewport - reported on iOS
 * Safari. Wiping the four hooks on every open pins it back to `translate: 0`.
 */

const SHEET_ID = "docs-prefs-sheet";

let controller: AbortController | null = null;

function clearStaleDragState(sheet: HTMLElement): void {
  sheet.removeAttribute("data-dragging");
  sheet.removeAttribute("data-releasing");
  sheet.style.removeProperty("--sk-vaul-drag-offset");
  sheet.style.removeProperty("--sk-vaul-drag-progress");
}

function syncTriggers(triggers: readonly HTMLElement[], open: boolean): void {
  for (const trigger of triggers) trigger.setAttribute("aria-expanded", String(open));
}

export function initPrefsSheet(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const sheet = document.getElementById(SHEET_ID) as HTMLDialogElement | null;
  if (!sheet) return;

  const triggers = [
    ...document.querySelectorAll<HTMLElement>(`[data-sk-dialog-vaul-open="${CSS.escape(SHEET_ID)}"]`),
  ];
  if (!triggers.length) return;

  const open = () => {
    if (sheet.open || typeof sheet.showModal !== "function") return;
    sheet.showModal();
    clearStaleDragState(sheet);
    syncTriggers(triggers, true);
  };

  for (const trigger of triggers) {
    trigger.addEventListener("click", open, { signal });
  }

  /* `toggle` fires for `showModal()` and for every close path (Escape, backdrop, the header's
     `<form method="dialog">`), so one listener keeps the triggers honest whichever opener actually
     ran and however it closed. */
  sheet.addEventListener(
    "toggle",
    () => {
      if (sheet.open) clearStaleDragState(sheet);
      syncTriggers(triggers, sheet.open);
    },
    { signal },
  );
}
