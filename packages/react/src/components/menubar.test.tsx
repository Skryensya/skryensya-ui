import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Menubar, MenubarItem } from "./menubar.js";

/*
 * Same fixture shape as the vanilla suite: "Archivo" (2 commands), "Editar" (2 commands), "Ayuda"
 * (a direct command, no dropdown). `items` is `Menu`'s own item shape now, not a JSX child.
 *
 * `@zag-js/react`'s own `send()` (machine.mjs) schedules its state transition via `queueMicrotask`,
 * so a click's effect on `aria-expanded` lands one microtask AFTER `fireEvent` returns, not
 * synchronously within it: `tick()` flushes that one queued microtask before each assertion.
 */
const tick = () => act(() => Promise.resolve());

function Fixture(props: { onHelp?: () => void; onNew?: (value: string) => void }) {
  return (
    <Menubar label="Editor">
      <MenubarItem
        items={[
          { value: "new", label: "Nuevo" },
          { value: "open", label: "Abrir" },
        ]}
        onSelect={(details) => props.onNew?.(details.value)}
      >
        Archivo
      </MenubarItem>
      <MenubarItem
        items={[
          { value: "cut", label: "Cortar" },
          { value: "paste", label: "Pegar" },
        ]}
      >
        Editar
      </MenubarItem>
      <MenubarItem onActivate={props.onHelp}>Ayuda</MenubarItem>
    </Menubar>
  );
}

const triggers = (ui: ReturnType<typeof render>) => ui.getAllByRole("menuitem", { name: /^(Archivo|Editar|Ayuda)$/ });

describe("Menubar React contracts, dropdowns as real Menu instances", () => {
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

  it("Right/Left move between top-level items, wrapping, without opening anything", async () => {
    const ui = render(<Fixture />);
    const [archivo, , ayuda] = triggers(ui);
    archivo!.focus();
    fireEvent.keyDown(ui.getByRole("menubar"), { key: "ArrowLeft" });
    await tick();
    expect(document.activeElement).toBe(ayuda); // wrapped
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
  });

  it("clicking a trigger opens its own dropdown via Zag", async () => {
    const ui = render(<Fixture />);
    const [archivo] = triggers(ui);
    fireEvent.click(archivo!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");
    expect(ui.getByRole("menuitem", { name: "Nuevo" })).toBeTruthy();
  });

  it("Escape closes the open dropdown and returns focus to its trigger", async () => {
    const ui = render(<Fixture />);
    const [archivo] = triggers(ui);
    fireEvent.click(archivo!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");

    /*
     * Zag attaches its dismissable listeners (Escape, outside press) behind raf + raf +
     * setTimeout(0), so an Escape fired straight after the open lands before anything is listening
     * and the dropdown stays open. `waitFor` RE-FIRES it on every poll instead of guessing at a
     * fixed delay, which is what makes this deterministic rather than timing-lucky.
     */
    await waitFor(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
      expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    });

    // The APG asks for the focus to come back to the trigger, not to be dropped on the body.
    expect(document.activeElement).toBe(archivo);
  });

  it("clicking a sibling trigger while one dropdown is open closes the first", async () => {
    const ui = render(<Fixture />);
    const [archivo, editar] = triggers(ui);
    fireEvent.click(archivo!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(editar!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(editar!.getAttribute("aria-expanded")).toBe("true");
  });

  it("moving Right while a dropdown is open closes it and opens the adjacent item's dropdown", async () => {
    const ui = render(<Fixture />);
    const [archivo, editar] = triggers(ui);
    const menubar = ui.getByRole("menubar");
    fireEvent.click(archivo!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(ui.getByRole("menuitem", { name: "Nuevo" }), { key: "ArrowRight" });
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(editar!.getAttribute("aria-expanded")).toBe("true");
  });

  it("clicking a dropdown command fires onSelect with its value", async () => {
    const onNew = vi.fn();
    const ui = render(<Fixture onNew={onNew} />);
    const [archivo] = triggers(ui);
    fireEvent.click(archivo!);
    await tick();
    fireEvent.click(ui.getByRole("menuitem", { name: "Nuevo" }));
    await tick();
    expect(onNew).toHaveBeenCalledWith("new");
  });

  it("clicking a leaf item (no dropdown) activates it directly", () => {
    const onHelp = vi.fn();
    const ui = render(<Fixture onHelp={onHelp} />);
    const [, , ayuda] = triggers(ui);
    fireEvent.click(ayuda!);
    expect(onHelp).toHaveBeenCalledOnce();
  });

  it("nav renders the trigger as nav-list's own link, not a Button, with behavior unchanged", async () => {
    const ui = render(
      <Menubar label="Principal">
        <MenubarItem nav items={[{ value: "new", label: "Nuevo" }]}>
          Archivo
        </MenubarItem>
        <MenubarItem nav onActivate={() => {}}>
          Ayuda
        </MenubarItem>
      </Menubar>,
    );
    const [archivo, ayuda] = triggers(ui);
    expect(archivo!.className).toContain("sk-nav-list__link");
    expect(archivo!.className).not.toContain("sk-button");
    expect(archivo!.querySelector(".sk-nav-list__label")?.textContent).toBe("Archivo");
    expect(ayuda!.className).toContain("sk-nav-list__link");
    // Same behavior as the non-nav bar above: still one tab stop, still opens via Zag.
    expect(ayuda!.tabIndex).toBe(-1);
    fireEvent.click(archivo!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");
  });

  it("a dropdown entry with an href renders as a real link, not a command div", async () => {
    const ui = render(
      <Menubar label="Editor">
        <MenubarItem items={[{ value: "docs", label: "Documentación", href: "/docs" }]}>Ayuda</MenubarItem>
      </Menubar>,
    );
    const [ayuda] = triggers(ui);
    fireEvent.click(ayuda!);
    await tick();
    const docs = ui.getByRole("menuitem", { name: "Documentación" });
    expect(docs.tagName).toBe("A");
    expect(docs.getAttribute("href")).toBe("/docs");
  });
});
