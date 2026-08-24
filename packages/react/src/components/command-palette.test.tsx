import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandPalette } from "./command-palette.js";

const items = [
  { href: "/componentes/boton", label: "Botón", section: "Componentes", group: "Acciones" },
  { href: "/componentes/dialogo", label: "Diálogo", section: "Componentes" },
  { href: "/tokens", label: "Tokens", context: "Fundamentos" },
];

const open = (ui: ReturnType<typeof render>) =>
  ui.container.querySelector<HTMLInputElement>("input[role='combobox']")!;

describe("CommandPalette", () => {
  it("claims nothing at rest: no options and no expanded popup", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);

    // The enhancer only fills the list from `open()`, so a palette at rest has none, and a combobox
    // announcing an expanded popup over an empty listbox is what this fixed.
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    expect(ui.container.querySelectorAll("[role='option']")).toHaveLength(0);
    expect(ui.container.querySelector<HTMLElement>(".sk-command-palette__empty")?.hidden).toBe(true);
    // WAI's combobox pattern requires `aria-controls` point at the listbox whether or not it is
    // visible right now. It used to be entirely absent.
    const listbox = ui.container.querySelector<HTMLElement>("[role='listbox']")!;
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox.id).toBeTruthy();
  });

  it("filters as the reader types and points at the first hit", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);

    fireEvent.change(input, { target: { value: "dialogo" } });

    const options = ui.container.querySelectorAll("[role='option']");
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain("Diálogo");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    // Active descendant instead of moving focus: the input keeps it while the list is walked.
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-0");
    expect(options[0].id).toBe("cmd-option-0");
    expect(options[0].getAttribute("aria-selected")).toBe("true");
  });

  it("shows the empty sentence only once a query has failed", () => {
    const ui = render(<CommandPalette emptyLabel="Nada por aquí." id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);
    const empty = ui.container.querySelector<HTMLElement>(".sk-command-palette__empty")!;

    fireEvent.change(input, { target: { value: "zzz" } });

    expect(empty.hidden).toBe(false);
    expect(empty.textContent).toBe("Nada por aquí.");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("labels each option with its own context line", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);

    // A blank query is the whole index, and a space is a blank query.
    fireEvent.change(open(ui), { target: { value: " " } });

    const contexts = Array.from(
      ui.container.querySelectorAll(".sk-command-palette__option-context"),
    ).map((node) => node.textContent);
    // section + group joins with the separator; an explicit context wins over both.
    expect(contexts).toEqual(["Componentes › Acciones", "Componentes", "Fundamentos"]);
    expect(
      ui.container.querySelector("[role='option']")?.getAttribute("data-href"),
    ).toBe("/componentes/boton");
  });

  it("reads the index from a JSON string, the way a usage tree passes it", () => {
    const ui = render(
      <CommandPalette id="cmd" items={JSON.stringify(items)} label="Buscar" open />,
    );

    fireEvent.change(open(ui), { target: { value: "tokens" } });

    expect(ui.container.querySelectorAll("[role='option']")).toHaveLength(1);
    expect(ui.container.querySelector("[role='option']")?.textContent).toContain("Tokens");
  });

  it("closes through the dialog form and names itself for the reader", () => {
    const ui = render(
      <CommandPalette
        footer={<span>↵ para abrir</span>}
        id="cmd"
        items={items}
        label="Buscar en la documentación"
        open
      />,
    );

    const dialog = ui.container.querySelector("dialog")!;
    expect(dialog.getAttribute("aria-label")).toBe("Buscar en la documentación");
    expect(dialog.classList.contains("sk-dialog")).toBe(true);
    expect(dialog.classList.contains("sk-command-palette")).toBe(true);

    const close = dialog.querySelector<HTMLButtonElement>(".sk-command-palette__close")!;
    expect(close.getAttribute("aria-label")).toBe("Cerrar");
    expect(close.closest("form")?.getAttribute("method")).toBe("dialog");
    expect(close.getAttribute("value")).toBe("cancel");

    expect(dialog.querySelector(".sk-command-palette__footer")?.textContent).toBe("↵ para abrir");
  });
});
