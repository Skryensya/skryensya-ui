import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountMenubar } from "./menubar.js";

/*
 * A 3-item bar matching WAI's own `menubar-editor` shape: "File" (2 commands), "Edit" (2 commands),
 * "Help" (a direct command, no dropdown — the leaf-item case).
 */
function markup() {
  document.body.innerHTML = `<div class="sk-menubar" data-sk-menubar role="menubar" aria-label="Editor">
    <div class="sk-menubar__item-wrapper">
      <button type="button" role="menuitem" data-sk-menubar-item>Archivo</button>
      <div class="sk-menubar__positioner" data-sk-menubar-menu>
        <div class="sk-menubar__menu" role="menu">
          <button type="button" role="menuitem" data-sk-menubar-menu-item data-value="new">Nuevo</button>
          <button type="button" role="menuitem" data-sk-menubar-menu-item data-value="open">Abrir</button>
        </div>
      </div>
    </div>
    <div class="sk-menubar__item-wrapper">
      <button type="button" role="menuitem" data-sk-menubar-item>Editar</button>
      <div class="sk-menubar__positioner" data-sk-menubar-menu>
        <div class="sk-menubar__menu" role="menu">
          <button type="button" role="menuitem" data-sk-menubar-menu-item data-value="cut">Cortar</button>
          <button type="button" role="menuitem" data-sk-menubar-menu-item data-value="paste">Pegar</button>
        </div>
      </div>
    </div>
    <div class="sk-menubar__item-wrapper">
      <button type="button" role="menuitem" data-sk-menubar-item>Ayuda</button>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-menubar]")!;
  expect(mountMenubar(document)).toBe(1);
  return root;
}

const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>("[data-sk-menubar-item]"));
const archivo = () => items()[0]!;
const editar = () => items()[1]!;
const ayuda = () => items()[2]!;
const archivoMenu = () => archivo().parentElement!.querySelector<HTMLElement>("[data-sk-menubar-menu]")!;
const archivoItems = () => Array.from(archivoMenu().querySelectorAll<HTMLButtonElement>("[data-sk-menubar-menu-item]"));

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-menubar]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("Menubar vanilla enhancer", () => {
  it("gives exactly one top-level item a tab stop on mount, wires aria-haspopup/expanded/controls", () => {
    markup();
    const stops = items().filter((item) => item.tabIndex === 0);
    expect(stops).toEqual([archivo()]);
    expect(archivo().getAttribute("aria-haspopup")).toBe("menu");
    expect(archivo().getAttribute("aria-expanded")).toBe("false");
    expect(archivo().getAttribute("aria-controls")).toBe(archivoMenu().id);
    expect(archivoMenu().hidden).toBe(true);
    // The leaf item (no dropdown) gets none of this.
    expect(ayuda().hasAttribute("aria-haspopup")).toBe(false);
  });

  it("Right/Left move between top-level items, wrapping, without opening anything", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(editar());
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(ayuda()); // wrapped
    expect(archivoMenu().hidden).toBe(true);
  });

  it("Down Arrow opens the dropdown and focuses its first item", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(archivo().getAttribute("aria-expanded")).toBe("true");
    expect(archivoMenu().hidden).toBe(false);
    expect(document.activeElement).toBe(archivoItems()[0]);
  });

  it("Up Arrow opens the dropdown and focuses its LAST item", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(document.activeElement).toBe(archivoItems()[1]);
  });

  it("Down/Up move within an open dropdown, wrapping", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowDown" }); // open, first item
    fireEvent.keyDown(root, { key: "ArrowDown" }); // second item
    expect(document.activeElement).toBe(archivoItems()[1]);
    fireEvent.keyDown(root, { key: "ArrowDown" }); // wraps to first
    expect(document.activeElement).toBe(archivoItems()[0]);
  });

  it("moving Right/Left while a dropdown is open closes it and opens the adjacent item's dropdown", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowDown" });
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(archivo().getAttribute("aria-expanded")).toBe("false");
    expect(archivoMenu().hidden).toBe(true);
    expect(editar().getAttribute("aria-expanded")).toBe("true");
    const editarMenu = editar().parentElement!.querySelector<HTMLElement>("[data-sk-menubar-menu]")!;
    expect(editarMenu.hidden).toBe(false);
    expect(document.activeElement).toBe(
      editarMenu.querySelectorAll<HTMLButtonElement>("[data-sk-menubar-menu-item]")[0],
    );
  });

  it("moving to the leaf item (no dropdown) while one was open just closes it — no dropdown to open", () => {
    const root = markup();
    editar().focus();
    fireEvent.keyDown(root, { key: "ArrowDown" });
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(editar().getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(ayuda());
  });

  it("Escape closes the open dropdown and returns focus to its trigger", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowDown" });
    fireEvent.keyDown(root, { key: "Escape" });
    expect(archivo().getAttribute("aria-expanded")).toBe("false");
    expect(archivoMenu().hidden).toBe(true);
    expect(document.activeElement).toBe(archivo());
  });

  it("clicking a top-level trigger toggles its dropdown; clicking again closes it", () => {
    const archivoBtn = markup() && archivo();
    fireEvent.click(archivoBtn);
    expect(archivoMenu().hidden).toBe(false);
    fireEvent.click(archivoBtn);
    expect(archivoMenu().hidden).toBe(true);
  });

  it("clicking a dropdown item activates it (emits sk-menubar-activate) and closes the menu", () => {
    const root = markup();
    let detail: unknown;
    root.addEventListener("sk-menubar-activate", (event) => {
      detail = (event as CustomEvent).detail;
    });
    fireEvent.click(archivo());
    fireEvent.click(archivoItems()[1]!);
    expect(detail).toEqual({ value: "open" });
    expect(archivoMenu().hidden).toBe(true);
    expect(document.activeElement).toBe(archivo());
  });

  it("clicking outside the menubar closes any open dropdown", () => {
    markup();
    fireEvent.click(archivo());
    expect(archivoMenu().hidden).toBe(false);
    fireEvent.pointerDown(document.body);
    expect(archivoMenu().hidden).toBe(true);
  });
});
