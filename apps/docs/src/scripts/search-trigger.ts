/*
 * Behavior for the header's search field (`Base.astro`). Docs-local, the same reason
 * `copy-button.ts`/`theme-toggle.ts` are: no published contract owns this shape, it is site chrome.
 *
 * WHY A REAL `<input>` used to be a `<button class="sk-button">` styled to look like a field. That
 * borrowed two real button behaviors it never wanted: the `:active` press-scale squeeze (a search
 * field does not squeeze when clicked, a button does), and, once buttons started carrying
 * `--elevation-raised` at rest, a cast shadow a genuine text field does not have either
 * (`.sk-input`'s own is `sunken`, see /elevacion). Both came along for free with `.sk-button`, not
 * because either was ever wanted here.
 *
 * The field is `readonly`: nobody types a query into it, the real query box is the command
 * palette's own (`CommandPalette.astro`), opened on top of this one. `command-palette.ts` (vanilla)
 * already wires ANY element carrying `data-sk-command-palette-open` + a matching `aria-controls` to
 * open on CLICK; it never assumed that element would be a button, so the input alone already
 * regains the pointer path with no JS here.
 *
 * What a real `<button>` gave this for free and a bare `readonly` input does not: Enter/Space
 * activates it. A FOCUS listener was tried here first and measured to break Escape - closing the
 * palette returns focus to whatever opened it (native `<dialog>` behaviour), which is this field,
 * which refired the same focus listener and reopened the palette in the same tick, so Escape
 * looked like it did nothing. A keydown handler for Enter/Space has no such loop: closing a dialog
 * synthesizes a `focus` event on return, never a keypress, so nothing here fires again on close.
 */

let searchTriggerController: AbortController | null = null;

async function ensureCommandPaletteIndex(root: HTMLDialogElement): Promise<void> {
  const indexId = root.getAttribute("data-sk-command-palette-index");
  if (!indexId || document.getElementById(indexId)) return;

  const indexSrc = root.getAttribute("data-sk-command-palette-index-src");
  if (!indexSrc) return;

  const response = await fetch(indexSrc, { credentials: "same-origin" });
  if (!response.ok) return;

  const script = document.createElement("script");
  script.type = "application/json";
  script.id = indexId;
  script.textContent = await response.text();
  root.after(script);
}

async function mountLazyCommandPalette(root: HTMLDialogElement, trigger: HTMLElement): Promise<void> {
  if (root.hasAttribute("data-sk-ready") || root.hasAttribute("data-sk-mounting")) {
    trigger.click();
    return;
  }

  // Runtime-selected by user intent: importing this statically would put the whole CommandPalette
  // enhancer back on the initial page graph, which is the seam this lazy chrome path exists to move.
  await ensureCommandPaletteIndex(root);
  root.setAttribute("data-sk-command-palette", "");
  const { mountCommandPalette } = await import("@skryensya/vanilla/command-palette");
  mountCommandPalette(root);
  trigger.click();
}

function initLazyCommandPalettes(): void {
  const roots = document.querySelectorAll<HTMLDialogElement>("[data-sk-command-palette-lazy]");
  for (const root of roots) {
    const dialogId = root.id;
    const triggers = dialogId
      ? [
          ...document.querySelectorAll<HTMLElement>(`[data-sk-command-palette-open][aria-controls="${CSS.escape(dialogId)}"]`),
          ...document.querySelectorAll<HTMLElement>(`[data-sk-command-palette-open="${CSS.escape(dialogId)}"]`),
        ]
      : [...document.querySelectorAll<HTMLElement>("[data-sk-command-palette-open]")];
    const uniqueTriggers = [...new Set(triggers)];
    let mounting: Promise<void> | null = null;

    const open = (trigger: HTMLElement) => {
      mounting ??= mountLazyCommandPalette(root, trigger).finally(() => {
        mounting = null;
      });
    };

    for (const trigger of uniqueTriggers) {
      trigger.addEventListener("click", (event) => {
        if (root.hasAttribute("data-sk-ready")) return;
        event.preventDefault();
        open(trigger);
      }, { signal: searchTriggerController?.signal });
    }

    const hotkey = root.getAttribute("data-sk-command-palette-hotkey");
    if (hotkey === "mod+k" && uniqueTriggers[0]) {
      document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey) || event.altKey) return;
        event.preventDefault();
        if (root.hasAttribute("data-sk-ready")) uniqueTriggers[0].click();
        else open(uniqueTriggers[0]);
      }, { signal: searchTriggerController?.signal });
    }
  }
}

export function initSearchTrigger(): void {
  searchTriggerController?.abort();
  searchTriggerController = new AbortController();
  const wrapper = document.querySelector<HTMLElement>("[data-sk-search-trigger]");
  const input = wrapper?.querySelector<HTMLInputElement>("[data-sk-search-trigger-input]");
  if (!wrapper || !input) return;

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    input.click();
  }, { signal: searchTriggerController.signal });

  // The icon and the padding around the input are part of the field's own click target, the same
  // way the whole `<button>` used to be: a real user does not aim for the exact input box inside a
  // visually single control. Re-dispatches as a click ON the input (not a plain `.focus()`, which
  // opens nothing on its own now that the focus listener that used to do that is gone, see the
  // header comment on why): `command-palette.ts` only ever listens for `click` on the element
  // carrying `data-sk-command-palette-open`, which is the input, not this wrapper.
  // `event.target !== input` skips the redundant re-click when the click already landed there.
  wrapper.addEventListener("click", (event) => {
    if (event.target !== input) input.click();
  }, { signal: searchTriggerController.signal });
  initLazyCommandPalettes();
}
