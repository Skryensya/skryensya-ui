import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker, CompactColorPicker, NativeColorPicker } from "./color-picker.js";

describe("ColorPicker", () => {
  it("opens the panel from the trigger and renders the full anatomy", async () => {
    const ui = render(<ColorPicker label="Color de marca" defaultValue="#3366ff" />);
    const trigger = ui.getByRole("button");

    fireEvent.click(trigger);

    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());
    expect(ui.getByDisplayValue("#3366FF")).toBeTruthy();
    expect(ui.queryByLabelText("oklch lightness")).toBeNull();
    fireEvent.click(document.querySelectorAll<HTMLButtonElement>(".sk-color-picker__format-option")[3]!);
    expect(ui.getByLabelText("oklch lightness")).toBeTruthy();
  });

  it("commits a typed hex value and updates the swatch", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <ColorPicker defaultValue="#000000" label="Color" onValueChange={onValueChange} />,
    );
    fireEvent.click(ui.getByRole("button"));
    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());

    const hex = ui.getByDisplayValue("#000000");
    fireEvent.change(hex, { target: { value: "#3366ff" } });
    fireEvent.blur(hex);

    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    const root = ui.container.querySelector(".sk-color-picker")!;
    expect((root as HTMLElement).style.getPropertyValue("--value")).toBe("rgba(51, 102, 255, 1)");
  });

  it("selects a preset swatch and updates the current color", async () => {
    const ui = render(
      <ColorPicker
        defaultValue="#000000"
        label="Color"
        swatches={["#ff0000", "#00ff00", "#0000ff"]}
      />,
    );
    fireEvent.click(ui.getByRole("button"));
    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());

    // `ColorPicker` portals its panel to `document.body`, outside `ui.container`'s own subtree.
    const swatchTriggers = document.querySelectorAll(".sk-color-picker__swatch-trigger");
    expect(swatchTriggers).toHaveLength(3);
    fireEvent.click(swatchTriggers[1]!);

    const root = ui.container.querySelector(".sk-color-picker")!;
    await waitFor(() =>
      expect((root as HTMLElement).style.getPropertyValue("--value")).toBe("rgba(0, 255, 0, 1)"),
    );
  });

  it("also accepts swatches as the compiler's own space-separated string", () => {
    // The contract's `swatches` option has no array/list type, so this space-separated string is
    // the literal shape the compiler emits as JSX; the array form above is the ergonomic one for
    // hand-authored React.
    const ui = render(
      <ColorPicker defaultValue="#000000" label="Color" swatches="#ff0000 #00ff00 #0000ff" />,
    );
    fireEvent.click(ui.getByRole("button"));
    expect(document.querySelectorAll(".sk-color-picker__swatch-trigger")).toHaveLength(3);
  });

  it("renders a real hidden input carrying the field's name", () => {
    const ui = render(<ColorPicker defaultValue="#3366ff" label="Color" name="brand" />);
    const hidden = ui.container.querySelector('input[name="brand"]');
    expect(hidden).toBeTruthy();
  });

  it("a consumer's own triggerLabel overrides Zag's color-describing default", () => {
    const ui = render(
      <ColorPicker defaultValue="#3366ff" label="Color" triggerLabel="Elegir color de marca" />,
    );
    expect(ui.getByRole("button", { name: "Elegir color de marca" })).toBeTruthy();
  });
});

describe("CompactColorPicker", () => {
  it("drops the channel-input rows entirely, keeping the area, hue rail and presets", async () => {
    const ui = render(
      <CompactColorPicker defaultValue="#3366ff" label="Acento" swatches={["#ff0000"]} />,
    );
    fireEvent.click(ui.getByRole("button"));
    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());

    // Portaled to `document.body`, same note as above.
    expect(document.querySelector(".sk-color-picker__channels")).toBeNull();
    expect(document.querySelector(".sk-color-picker__area")).toBeTruthy();
    expect(document.querySelector(".sk-color-picker__hue-slider")).toBeTruthy();
    expect(document.querySelector(".sk-color-picker__swatch-trigger")).toBeTruthy();
  });
});

describe("NativeColorPicker", () => {
  it("renders a real type=color input, named through aria-labelledby", () => {
    const ui = render(<NativeColorPicker defaultValue="#3366ff" label="Fondo" name="bg" />);
    const input = ui.container.querySelector('input[type="color"]')!;
    expect(input.getAttribute("name")).toBe("bg");
    const labelId = input.getAttribute("aria-labelledby");
    expect(ui.container.querySelector(`#${labelId}`)?.textContent).toBe("Fondo");
  });
});
