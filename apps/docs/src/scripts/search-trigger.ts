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

export function initSearchTrigger(): void {
  const wrapper = document.querySelector<HTMLElement>("[data-sk-search-trigger]");
  const input = wrapper?.querySelector<HTMLInputElement>("[data-sk-search-trigger-input]");
  if (!wrapper || !input) return;

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    input.click();
  });

  // The icon and the padding around the input are part of the field's own click target, the same
  // way the whole `<button>` used to be: a real user does not aim for the exact input box inside a
  // visually single control. Re-dispatches as a click ON the input (not a plain `.focus()`, which
  // opens nothing on its own now that the focus listener that used to do that is gone, see the
  // header comment on why): `command-palette.ts` only ever listens for `click` on the element
  // carrying `data-sk-command-palette-open`, which is the input, not this wrapper.
  // `event.target !== input` skips the redundant re-click when the click already landed there.
  wrapper.addEventListener("click", (event) => {
    if (event.target !== input) input.click();
  });
}
