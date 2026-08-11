import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Flyout } from "./flyout.js";

const options = [
  { label: "Predeterminado", value: "default" },
  { label: "Crepúsculo", value: "dusk" },
  { label: "Brasa", value: "ember", disabled: true },
];

describe("Flyout", () => {
  it("opens on click and keeps ARIA in sync with the panel", () => {
    const ui = render(<Flyout label="Marca" options={options} />);
    const trigger = ui.getByRole("button", { name: "Marca" });
    const panel = ui.container.querySelector<HTMLElement>(".sk-flyout__panel")!;

    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
    expect(panel.getAttribute("data-state")).toBe("closed");

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(panel.hidden).toBe(false);
    expect(panel.getAttribute("data-state")).toBe("open");

    fireEvent.click(trigger);
    expect(panel.hidden).toBe(true);
  });

  it("commits an option, reports it and closes", () => {
    const onValueChange = vi.fn();
    const ui = render(<Flyout label="Marca" onValueChange={onValueChange} options={options} />);
    const trigger = ui.getByRole("button", { name: "Marca" });

    // Without a defaultValue the first option is the resting one, so the trigger never shows
    // the placeholder for a list that has options.
    expect(trigger.textContent).toContain("Predeterminado");

    fireEvent.click(trigger);
    fireEvent.click(ui.getByRole("option", { name: "Crepúsculo" }));

    expect(onValueChange).toHaveBeenCalledWith({ value: ["dusk"] });
    expect(trigger.textContent).toContain("Crepúsculo");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    // Queried through the DOM, not by role: the closed panel is `hidden`, so it is out of the tree.
    expect(
      ui.container.querySelector('li[data-value="dusk"]')?.getAttribute("aria-selected"),
    ).toBe("true");
    expect(ui.container.querySelector(".sk-flyout")?.getAttribute("data-value")).toBe("dusk");
  });

  it("ignores a disabled option", () => {
    const onValueChange = vi.fn();
    const ui = render(<Flyout label="Marca" onValueChange={onValueChange} options={options} />);

    fireEvent.click(ui.getByRole("button", { name: "Marca" }));
    const ember = ui.getByRole("option", { name: "Brasa" });
    expect(ember.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(ember);

    expect(onValueChange).not.toHaveBeenCalled();
    // Still open: a dead click is not a commit.
    expect(ui.getByRole("button", { name: "Marca" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("stays controlled when the consumer owns the value", () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Flyout label="Marca" onValueChange={onValueChange} options={options} value={["dusk"]} />,
    );
    const trigger = ui.getByRole("button", { name: "Marca" });

    fireEvent.click(trigger);
    fireEvent.click(ui.getByRole("option", { name: "Predeterminado" }));

    expect(onValueChange).toHaveBeenCalledWith({ value: ["default"] });
    // The component does not move on its own: the value it shows is still the prop's.
    expect(trigger.textContent).toContain("Crepúsculo");
  });

  it("closes on Escape and gives the trigger its focus back", () => {
    const ui = render(<Flyout label="Marca" options={options} />);
    const trigger = ui.getByRole("button", { name: "Marca" });

    fireEvent.click(trigger);
    fireEvent.keyDown(ui.getByRole("option", { name: "Predeterminado" }), { key: "Escape" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("opens from the keyboard on the trigger", () => {
    const ui = render(<Flyout label="Marca" options={options} />);
    const trigger = ui.getByRole("button", { name: "Marca" });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    // The checked option is the one the panel hands its tab stop to.
    expect(ui.getByRole("option", { name: "Predeterminado" }).tabIndex).toBe(0);
  });

  it("closes on a pointerdown outside its own root", async () => {
    const ui = render(<Flyout label="Marca" options={options} />);
    const trigger = ui.getByRole("button", { name: "Marca" });

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);

    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("stays disabled: no panel, no events", () => {
    const onValueChange = vi.fn();
    const ui = render(<Flyout disabled label="Marca" onValueChange={onValueChange} options={options} />);
    const trigger = ui.getByRole("button", { name: "Marca" });

    expect(trigger.hasAttribute("disabled")).toBe(true);
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(ui.container.querySelector(".sk-flyout")?.getAttribute("data-disabled")).toBe("");
  });

  it("keeps only one flyout open at a time", async () => {
    const ui = render(
      <>
        <Flyout label="Marca" options={options} />
        <Flyout label="Tema" options={options} />
      </>,
    );
    const brand = ui.getByRole("button", { name: "Marca" });
    const theme = ui.getByRole("button", { name: "Tema" });

    fireEvent.click(brand);
    expect(brand.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(theme);

    await waitFor(() => expect(brand.getAttribute("aria-expanded")).toBe("false"));
    expect(theme.getAttribute("aria-expanded")).toBe("true");
  });

  it("shows the placeholder when there is nothing to pick", () => {
    const ui = render(<Flyout label="Marca" options={[]} placeholder="Sin marcas" />);
    expect(ui.getByRole("button", { name: "Marca" }).textContent).toContain("Sin marcas");
  });
});
