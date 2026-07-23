import { fireEvent, getByRole } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountAccordion } from "./accordion.js";

function mount(type: "single" | "multiple" = "single", defaultValue = "runtime"): HTMLElement {
  document.body.innerHTML = `<div data-ds-accordion data-type="${type}" data-default-value="${defaultValue}">
    <section class="ds-tile ds-tile--expandable" data-part="item" data-value="runtime"><button data-part="trigger">Runtime</button><div data-part="content">Node 22</div></section>
    <section class="ds-tile ds-tile--expandable" data-part="item" data-value="rollout"><button data-part="trigger">Rollout</button><div data-part="content">10%, then 100%</div></section>
  </div>`;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountAccordion(document)).toBe(1);
  return root;
}

describe("Accordion (collapsible-per-item) contracts", () => {
  it("keeps exactly one item open in single mode and emits", async () => {
    const root = mount("single");
    const handler = vi.fn();
    root.addEventListener("ds:accordionvaluechange", handler);
    const runtime = getByRole(root, "button", { name: "Runtime" });
    const rollout = getByRole(root, "button", { name: "Rollout" });

    expect(root.classList.contains("ds-accordion")).toBe(true);
    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(rollout);
    flushSync();

    // Rollout abre de inmediato; Runtime cierra ANIMADO (collapsible lo mantiene visible hasta que la
    // animación de salida termina, en jsdom no hay animación computada, así que resuelve en un raf).
    expect(rollout.getAttribute("aria-expanded")).toBe("true");
    await vi.waitFor(() => expect(runtime.getAttribute("aria-expanded")).toBe("false"));
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "rollout" } }));
  });

  it("allows independent open items in multiple mode", () => {
    const root = mount("multiple");
    const runtime = getByRole(root, "button", { name: "Runtime" });
    const rollout = getByRole(root, "button", { name: "Rollout" });

    fireEvent.click(rollout);
    flushSync();

    expect(runtime.getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("true");
  });
});
