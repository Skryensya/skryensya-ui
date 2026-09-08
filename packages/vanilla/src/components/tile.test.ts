import { getByRole } from "@testing-library/dom";
import { tileSharedAccessibilityContract } from "@skryensya/core/tile-contracts";
import { describe, expect, it } from "vitest";
import { createTileButton } from "./tile-button.js";
import { createTileLink } from "./tile-link.js";
import { expandableTileClass, interactiveTileClass } from "./tile.js";

/*
 * Tile factories (link + button). The stateful tiles, checkbox, radio-group, expandable, accordion,
 * migrated to Svelte+Zag enhancers and are tested in their own `*.svelte.test.ts`. What is left here
 * are only the two pieces that have NO machine: interactive markup the consumer composes
 * (createTileLink / createTileButton), which did not change.
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

describe("Tile class helpers", () => {
  it("composes the interactive Tile's classes in the order the sheet expects", () => {
    // `sk-interactive` is the shared paint, and it composes with the Tile's own parts rather than
    // replacing them: one string, so the factories and the enhancers cannot drift apart.
    expect(interactiveTileClass()).toBe("sk-tile sk-tile--interactive sk-interactive");
    expect(interactiveTileClass("docs-card")).toBe(
      "sk-tile sk-tile--interactive sk-interactive docs-card",
    );
  });

  it("keeps the expandable Tile out of the interactive paint", () => {
    // The expandable shape carries its own trigger, so the ROOT is not the interactive surface.
    expect(expandableTileClass()).toBe("sk-tile sk-tile--interactive sk-tile--expandable");
    expect(expandableTileClass("docs-card")).toBe(
      "sk-tile sk-tile--interactive sk-tile--expandable docs-card",
    );
  });
});
