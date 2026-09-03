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

  /* `cache: "no-cache"` forces a revalidation even when a still-"fresh" copy is in the HTTP cache: a
     response previously stored under `max-age=3600` stays fresh for the rest of that hour and the
     browser would not otherwise re-request it, so a reader who opened the palette once would keep
     getting a catalog that predates any component added since. The endpoint now sends `no-cache`
     too; this covers copies cached before that change shipped. */
  const response = await fetch(indexSrc, { credentials: "same-origin", cache: "no-cache" });
  if (!response.ok) return;

  const script = document.createElement("script");
  script.type = "application/json";
  script.id = indexId;
  script.textContent = await response.text();
  root.after(script);
}

/*
 * The index fetch and the enhancer's own JS chunk are independent, so they run in parallel
 * (`Promise.all`) rather than one after the other — on mobile, awaiting them sequentially is
 * exactly the delay a tap-to-open command palette should not have. Idempotent per root: repeat
 * calls before the first resolves return the same in-flight promise (`initLazyCommandPalettes`'s
 * `mounting` cache), so warming on `pointerdown` and finishing on `click` never double-fetches.
 */
async function mountLazyCommandPalette(root: HTMLDialogElement): Promise<void> {
  if (root.hasAttribute("data-sk-ready") || root.hasAttribute("data-sk-mounting")) return;

  // Runtime-selected by user intent: importing this statically would put the whole CommandPalette
  // enhancer back on the initial page graph, which is the seam this lazy chrome path exists to move.
  const [, { mountCommandPalette }] = await Promise.all([
    ensureCommandPaletteIndex(root),
    import("@skryensya/vanilla/command-palette"),
  ]);
  if (root.hasAttribute("data-sk-ready")) return;
  root.setAttribute("data-sk-command-palette", "");
  mountCommandPalette(root);
}

/*
 * Warm the lazy palette AFTER the page is quiet: `requestIdleCallback`, or the first real
 * interaction anywhere on the page, whichever comes first. `data-sk-command-palette-lazy` still keeps
 * the enhancer off the INITIAL graph, the seam it exists for. This only pulls it (chunk + the ~19KB
 * index) once nothing else is competing, so a later tap on search finds the palette already mounted
 * and `open()` is instant instead of a cold `import()` + fetch on a slow mobile connection.
 * `mountLazyCommandPalette` is idempotent (`data-sk-ready`/`-mounting`), so this never races a real
 * open into a double fetch.
 */
function warmLazyCommandPalettes(): void {
  const roots = [...document.querySelectorAll<HTMLDialogElement>("[data-sk-command-palette-lazy]")];
  if (!roots.length) return;

  let warmed = false;
  const warm = () => {
    if (warmed) return;
    warmed = true;
    for (const root of roots) void mountLazyCommandPalette(root);
  };

  const idle =
    typeof window.requestIdleCallback === "function"
      ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 4000 })
      : (cb: () => void) => window.setTimeout(cb, 2000);
  idle(warm);

  // A user who reaches for search before idle fires is exactly who should not wait for the cold path.
  for (const type of ["pointerdown", "keydown", "touchstart", "wheel"] as const) {
    window.addEventListener(type, warm, {
      once: true,
      passive: true,
      signal: searchTriggerController?.signal,
    });
  }
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

    const ensureMounted = () =>
      (mounting ??= mountLazyCommandPalette(root).finally(() => {
        mounting = null;
      }));

    /*
     * Open the sheet on the FIRST interaction, BEFORE the enhancer chunk or the index have loaded.
     *
     * The delay this removes: the enhancer's lazy chunk statically pulls in the Svelte 5 runtime
     * (via `createConnectMount` → `Imperative.svelte`), and nothing called `showModal()` until that
     * whole graph had downloaded, parsed and run; on a mobile CPU, the visible "nothing happens for
     * a beat after I tap search". The `<dialog>` is already in the DOM and `dialog-vaul.css` slides
     * it up on `showModal()` alone via `@starting-style`, so this path costs no JS. `connect()` then
     * adopts the open dialog (`command-palette.ts`): it fills the list and takes focus once it
     * mounts. `[data-sk-cmdk-loading]` shows a spinner in the results area until then.
     */
    const openImmediately = () => {
      if (root.open || root.hasAttribute("data-sk-ready") || typeof root.showModal !== "function") return;
      root.setAttribute("data-sk-cmdk-loading", "");
      root.showModal();
      ensureMounted()
        .catch(() => {})
        .finally(() => root.removeAttribute("data-sk-cmdk-loading"));
    };

    for (const trigger of uniqueTriggers) {
      // `pointerdown` fires well before `click` resolves on a touch tap, so start the fetch/import
      // here: the mount is often already done by the time the sheet is up. `passive: true`:
      // nothing here calls `preventDefault`, so it must not block the scroll/tap the browser is
      // deciding between.
      trigger.addEventListener("pointerdown", () => {
        if (!root.hasAttribute("data-sk-ready")) ensureMounted();
      }, { signal: searchTriggerController?.signal, passive: true });

      trigger.addEventListener("click", (event) => {
        if (root.hasAttribute("data-sk-ready")) return;
        event.preventDefault();
        openImmediately();
      }, { signal: searchTriggerController?.signal });
    }

    const hotkey = root.getAttribute("data-sk-command-palette-hotkey");
    if (hotkey === "mod+k" && uniqueTriggers[0]) {
      document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey) || event.altKey) return;
        event.preventDefault();
        if (root.hasAttribute("data-sk-ready")) uniqueTriggers[0].click();
        else openImmediately();
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
  warmLazyCommandPalettes();
}
