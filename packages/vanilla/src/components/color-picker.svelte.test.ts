import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountColorPicker } from "./color-picker.js";

/*
 * ColorPicker splits the work by owner, same as DatePicker: the CONTROL (label, swatch trigger) is
 * authored markup the enhancer patches, and the PANEL (area, rails, channel rows, presets) is
 * chrome it renders inside its own popover. `data-anatomy` on the root picks which rows the panel
 * draws; the native `type="color"` field is a separate signature needing no enhancer at all.
 */
function markup(root = "") {
  document.body.innerHTML = `<div class="sk-color-picker" data-sk-color-picker ${root}>
    <label class="sk-color-picker__label">Color de marca</label>
    <input class="sk-color-picker__hidden-input" aria-hidden="true" tabindex="-1" />
    <div class="sk-color-picker__control">
      <button class="sk-color-picker__trigger" type="button" aria-label="Elegir color">
        <span class="sk-color-picker__swatch"></span>
      </button>
    </div>
  </div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-color-picker]")!;
  expect(mountColorPicker(document)).toBe(1);
  return element;
}

const trigger = () => document.querySelector<HTMLButtonElement>(".sk-color-picker__trigger")!;
const content = () => document.querySelector<HTMLElement>(".sk-color-picker__content")!;
const hexInput = () => document.querySelector<HTMLInputElement>('[data-channel="hex"]')!;
const swatchTriggers = () => Array.from(document.querySelectorAll<HTMLButtonElement>(".sk-color-picker__swatch-trigger"));
const channels = () => document.querySelector<HTMLElement>(".sk-color-picker__channels");

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ColorPicker Vanilla contracts", () => {
  it("refuses markup that is missing a part it must patch", () => {
    document.body.innerHTML = `<div class="sk-color-picker" data-sk-color-picker></div>`;
    expect(() => mountColorPicker(document)).toThrow(/sk-color-picker__control/);
  });

  it("patches the authored control and renders the popover around a panel", () => {
    const root = markup();
    const control = root.querySelector(".sk-color-picker__control")!;
    expect(control.classList.contains("sk-anchor")).toBe(true);
    expect(root.querySelector(".sk-color-picker__positioner")).toBeTruthy();
    expect(content().querySelector(".sk-color-picker__area")).toBeTruthy();
  });

  it("opens the panel from the trigger and closes it again", async () => {
    markup();
    expect(content().hidden).toBe(true);

    fireEvent.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));
    expect(trigger().getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger());
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
  });

  it("shows the starting color on the root's own custom property", () => {
    const root = markup('data-value="#3366ff"');
    expect(root.style.getPropertyValue("--value")).toBe("rgba(51, 102, 255, 1)");
  });

  it("commits a typed hex value and only shows the selected channel format", async () => {
    const root = markup('data-value="#000000"');
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", onChange);
    fireEvent.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));

    fireEvent.input(hexInput(), { target: { value: "#3366ff" } });
    // `@zag-js/svelte` remaps `onBlur`/`onFocus` to `focusout`/`focusin`, so a real DOM `blur`
    // never reaches the handler here (see the project's own note on this).
    fireEvent.focusOut(hexInput());

    await waitFor(() => expect(root.style.getPropertyValue("--value")).toBe("rgba(51, 102, 255, 1)"));
    expect(onChange).toHaveBeenCalled();
    expect(document.querySelector('[data-channel="red"]')).toBeNull();

    fireEvent.click(document.querySelector<HTMLButtonElement>(".sk-color-picker__format-option:nth-child(2)")!);
    await waitFor(() => expect(document.querySelector('[data-channel="red"]')).toBeTruthy());
    const red = document.querySelector<HTMLInputElement>('[data-channel="red"]')!;
    expect(red.value).toBe("51");
  });

  it("selects a preset swatch and updates the current color", async () => {
    const root = markup('data-value="#000000" data-swatches="#ff0000 #00ff00 #0000ff"');
    fireEvent.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));

    expect(swatchTriggers()).toHaveLength(3);
    fireEvent.click(swatchTriggers()[1]!);

    await waitFor(() => expect(root.style.getPropertyValue("--value")).toBe("rgba(0, 255, 0, 1)"));
  });

  it("renders no presets row at all when none were authored", async () => {
    markup();
    fireEvent.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));
    expect(swatchTriggers()).toHaveLength(0);
  });

  it("the compact anatomy drops the channel-input rows entirely", async () => {
    markup('data-anatomy="compact"');
    fireEvent.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));
    expect(channels()).toBeNull();
    expect(content().querySelector(".sk-color-picker__area")).toBeTruthy();
    expect(content().querySelector(".sk-color-picker__hue-slider")).toBeTruthy();
  });

  it("the full anatomy renders one editable channel format at a time", async () => {
    markup();
    fireEvent.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));
    expect(channels()).toBeTruthy();
    expect(document.querySelectorAll(".sk-color-picker__channel-row")).toHaveLength(1);
    expect(document.querySelector('[data-channel="hex"]')).toBeTruthy();
    expect(document.querySelector('[aria-label="oklch lightness"]')).toBeNull();

    fireEvent.click(document.querySelector<HTMLButtonElement>(".sk-color-picker__format-option:nth-child(4)")!);
    await waitFor(() => expect(document.querySelector('[aria-label="oklch lightness"]')).toBeTruthy());
    expect(document.querySelectorAll(".sk-color-picker__channel-row")).toHaveLength(1);
    expect(document.querySelector('[data-channel="hex"]')).toBeNull();
  });

  it("respects the authored disabled, readOnly, required and invalid flags", () => {
    const root = markup('data-disabled data-readonly data-required data-invalid');
    expect(root.getAttribute("data-disabled")).toBe("");
    expect(trigger().disabled).toBe(true);
  });

  it("names the field for a form under the name the markup gave it", () => {
    markup('data-name="brand" data-value="#3366ff"');
    const hidden = document.querySelector<HTMLInputElement>('input[name="brand"]');
    expect(hidden).toBeTruthy();
  });

  it("keeps the authored trigger label instead of Zag's own color-describing default", () => {
    markup('data-value="#3366ff"');
    // The markup already names the trigger ("Elegir color"); the enhancer must not overwrite it
    // with Zag's own `select color. current color is ...` default.
    expect(trigger().getAttribute("aria-label")).toBe("Elegir color");
    /*
     * `getTriggerProps()` also carries an `aria-labelledby` pointing at the field's own label,
     * and `aria-labelledby` outranks `aria-label` in the accessible-name algorithm: left alone,
     * it would silently defeat `triggerLabel` (the contract's real naming mechanism) no matter
     * what `aria-label` said. The enhancer strips it so `aria-label` is what actually names the
     * trigger for assistive tech, not just what the attribute happens to read.
     */
    expect(trigger().getAttribute("aria-labelledby")).toBeNull();
  });
});
