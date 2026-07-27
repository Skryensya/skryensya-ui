import { getByRole } from "@testing-library/dom";
import { tileSharedAccessibilityContract } from "@skryensya/core/tile-contracts";
import { describe, expect, it } from "vitest";
import { createTileButton } from "./tile-button.js";
import { createTileLink } from "./tile-link.js";

/*
 * Tile factories (link + button). Los tiles con estado, checkbox, radio-group, expandable, accordion, 
 * migraron a enhancers Svelte+Zag y se prueban en sus propios `*.svelte.test.ts`. Acá quedan sólo las
 * dos piezas que NO tienen máquina: markup interactivo que el consumidor compone (createTileLink /
 * createTileButton), que no cambiaron.
 */
function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

describe("Tile factories", () => {
  it("satisfies the core shared link accessibility contract", () => {
    const root = mount("<div></div>");
    root.append(createTileLink({ href: "/details" }));
    expect(getByRole(root, tileSharedAccessibilityContract.link.role)).toBeInstanceOf(HTMLAnchorElement);
  });

  it("satisfies the core shared button accessibility contract", () => {
    const root = mount("<div></div>");
    root.append(createTileButton({ disabled: true }));
    const control = getByRole(root, tileSharedAccessibilityContract.button.role) as HTMLButtonElement;
    expect(control.disabled).toBe(tileSharedAccessibilityContract.button.disabled);
  });

  it("creates TileLink and TileButton as interactive Tile roots decoupled from Box", () => {
    const link = createTileLink({ href: "/usage", padding: "none" });
    const button = createTileButton({ padding: "xl" });
    const defaultLink = createTileLink({ href: "/default" });

    expect(link.href).toContain("/usage");
    expect(link.classList.contains("sk-tile")).toBe(true);
    expect(link.classList.contains("sk-tile--interactive")).toBe(true);
    expect(link.classList.contains("sk-box")).toBe(false);
    expect(button.type).toBe("button");
    expect(button.classList.contains("sk-tile")).toBe(true);
    expect(button.classList.contains("sk-tile--interactive")).toBe(true);
    expect(button.classList.contains("sk-box")).toBe(false);
    expect(link.dataset.padding).toBe("none");
    expect(button.dataset.padding).toBe("xl");
    expect(defaultLink.dataset.padding).toBeUndefined();
    expect(createTileButton().dataset.padding).toBeUndefined();
  });
});
