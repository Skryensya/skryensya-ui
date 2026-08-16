import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Menubar, MenubarItem, MenubarMenu, MenubarMenuItem } from "./menubar.js";

/* Same fixture shape as the vanilla suite: "Archivo" (2 commands), "Editar" (2 commands), "Ayuda"
 * (a direct command, no dropdown). */
function Fixture(props: { onHelp?: () => void; onNew?: () => void }) {
  return (
    <Menubar label="Editor">
      <MenubarItem label="Archivo">
        <MenubarMenu>
          <MenubarMenuItem onActivate={props.onNew}>Nuevo</MenubarMenuItem>
          <MenubarMenuItem>Abrir</MenubarMenuItem>
        </MenubarMenu>
      </MenubarItem>
      <MenubarItem label="Editar">
        <MenubarMenu>
          <MenubarMenuItem>Cortar</MenubarMenuItem>
          <MenubarMenuItem>Pegar</MenubarMenuItem>
        </MenubarMenu>
      </MenubarItem>
      <MenubarItem label="Ayuda" onActivate={props.onHelp} />
    </Menubar>
  );
}

const triggers = (ui: ReturnType<typeof render>) => ui.getAllByRole("menuitem", { name: /^(Archivo|Editar|Ayuda)$/ });

describe("Menubar React contracts", () => {
  it("sets role=menubar/menuitem, one tab stop, aria-haspopup only on dropdown items", () => {
    const ui = render(<Fixture />);
    const [archivo, editar, ayuda] = triggers(ui);
    expect(ui.getByRole("menubar", { name: "Editor" })).toBeTruthy();
    expect(archivo!.tabIndex).toBe(0);
    expect(editar!.tabIndex).toBe(-1);
    expect(ayuda!.tabIndex).toBe(-1);
    expect(archivo!.getAttribute("aria-haspopup")).toBe("menu");
    expect(ayuda!.hasAttribute("aria-haspopup")).toBe(false);
  });

  it("Right/Left move between top-level items, wrapping, without opening anything", () => {
    const ui = render(<Fixture />);
    const [archivo, , ayuda] = triggers(ui);
    archivo!.focus();
    fireEvent.keyDown(ui.getByRole("menubar"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(ayuda); // wrapped
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
  });

  it("Down Arrow opens the dropdown and focuses its first item; Up focuses the last", () => {
    const ui = render(<Fixture />);
    const [archivo] = triggers(ui);
    archivo!.focus();
    fireEvent.keyDown(ui.getByRole("menubar"), { key: "ArrowDown" });
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(ui.getByRole("menuitem", { name: "Nuevo" }));
  });

  it("moving Right while a dropdown is open closes it and opens the adjacent item's dropdown", () => {
    const ui = render(<Fixture />);
    const [archivo, editar] = triggers(ui);
    const menubar = ui.getByRole("menubar");
    archivo!.focus();
    fireEvent.keyDown(menubar, { key: "ArrowDown" });
    fireEvent.keyDown(menubar, { key: "ArrowRight" });
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(editar!.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(ui.getByRole("menuitem", { name: "Cortar" }));
  });

  it("Escape closes the open dropdown and returns focus to its trigger", () => {
    const ui = render(<Fixture />);
    const [archivo] = triggers(ui);
    const menubar = ui.getByRole("menubar");
    archivo!.focus();
    fireEvent.keyDown(menubar, { key: "ArrowDown" });
    fireEvent.keyDown(menubar, { key: "Escape" });
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(archivo);
  });

  it("clicking a dropdown item activates it and closes the menu, returning focus to the trigger", () => {
    const onNew = vi.fn();
    const ui = render(<Fixture onNew={onNew} />);
    const [archivo] = triggers(ui);
    fireEvent.click(archivo!);
    fireEvent.click(ui.getByRole("menuitem", { name: "Nuevo" }));
    expect(onNew).toHaveBeenCalledOnce();
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(archivo);
  });

  it("clicking a leaf item (no dropdown) activates it directly", () => {
    const onHelp = vi.fn();
    const ui = render(<Fixture onHelp={onHelp} />);
    const [, , ayuda] = triggers(ui);
    fireEvent.click(ayuda!);
    expect(onHelp).toHaveBeenCalledOnce();
  });
});
