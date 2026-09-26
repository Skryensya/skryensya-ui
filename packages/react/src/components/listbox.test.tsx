import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Listbox, type ListboxItem } from "./listbox.js";

const items: ListboxItem[] = [
  { value: "a", label: "Alfa" },
  { value: "b", label: "Beta", defaultSelected: true },
  { value: "c", label: "Gamma" },
  { value: "d", label: "Delta", disabled: true },
];

/* Zag's React adapter applies a machine update after the event handler returns; read the DOM after it. */
const click = async (el: HTMLElement) => {
  fireEvent.click(el);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const selected = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("[role='option'][aria-selected='true']")].map((o) => o.dataset.value);

describe("Listbox", () => {
  it("is a listbox named by its label, starting from the items marked selected", () => {
    const ui = render(<Listbox items={items} label="Letras" />);

    expect(ui.getByRole("listbox", { name: "Letras" })).toBeTruthy();
    expect(selected(ui.container)).toEqual(["b"]);
  });

  it("replaces the choice in single mode and reports it", async () => {
    const changes: string[][] = [];
    const ui = render(<Listbox items={items} label="Letras" onValueChange={(d) => changes.push(d.value)} />);

    await click(ui.getByRole("option", { name: "Gamma" }));

    expect(selected(ui.container)).toEqual(["c"]);
    expect(changes).toEqual([["c"]]);
  });

  it("toggles options in multiple mode and skips disabled ones", async () => {
    const ui = render(<Listbox items={items} label="Letras" selectionMode="multiple" />);
    expect(ui.getByRole("listbox").getAttribute("aria-multiselectable")).toBe("true");

    await click(ui.getByRole("option", { name: "Alfa" }));
    await click(ui.getByRole("option", { name: "Delta" }));

    expect(selected(ui.container)).toEqual(["a", "b"]);
  });
});
