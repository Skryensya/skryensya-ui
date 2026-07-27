import { describe, expect, it, vi } from "vitest";
import { initComponents } from "./registry.js";
import { destroyEnhancer } from "./svelte-hydrate.js";

const importedModules = vi.hoisted(() => new Set<string>());

vi.mock("../components/button.js", async () => {
  importedModules.add("button");
  return vi.importActual("../components/button.js");
});

vi.mock("../components/slider.js", async () => {
  importedModules.add("slider");
  return vi.importActual("../components/slider.js");
});

describe("initComponents", () => {
  it("dynamically imports only enhancer types with a matching selector", async () => {
    document.body.innerHTML = `<button class="sk-button sk-interactive" data-sk-button>Save</button>`;

    expect(importedModules).not.toContain("button");
    expect(importedModules).not.toContain("slider");
    expect(await initComponents(document)).toBe(1);
    expect(importedModules).toContain("button");
    expect(importedModules).not.toContain("slider");
  });

  it("mounts every authored machine-backed root and is idempotent", async () => {
    document.body.innerHTML = `
      <div data-sk-accordion data-type="single" data-default-value="one">
        <section data-part="item" data-value="one"><button data-part="trigger">One</button><div data-part="content">One</div></section>
      </div>
      <section data-sk-expandable-tile data-part="root"><button data-part="trigger">Details</button><div data-part="content">Body</div></section>
      <label data-sk-tile-checkbox data-part="root"><input type="checkbox" data-part="input" /><span data-part="content">Alerts</span><span data-part="indicator"></span></label>
      <div data-sk-tile-radio-group data-part="root" data-name="plan" data-default-value="basic">
        <label data-part="item"><input type="radio" value="basic" /><span data-part="content">Basic</span><span data-part="indicator"></span></label>
        <label data-part="item"><input type="radio" value="pro" /><span data-part="content">Pro</span><span data-part="indicator"></span></label>
      </div>
      <section data-sk-tabs id="tabs" data-value="one">
        <div data-sk-tabs-list><button data-sk-tabs-trigger data-value="one">One</button></div>
        <div data-sk-tabs-content data-value="one">Panel</div>
      </section>
    `;

    expect(await initComponents(document)).toBe(5);
    expect(await initComponents(document)).toBe(0);
    expect(document.querySelectorAll("[data-sk-accordion-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-sk-expandable-tile-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-sk-tile-checkbox-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-sk-tile-radio-group-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-sk-tabs-ready]")).toHaveLength(1);
  });

  it("does not scan siblings outside the supplied root", async () => {
    document.body.innerHTML = `
      <button class="sk-button sk-interactive" data-sk-button>Inside</button>
      <button class="sk-button sk-interactive" data-sk-button>Outside</button>
    `;
    const inside = document.body.firstElementChild as HTMLElement;

    expect(await initComponents(inside)).toBe(1);
    expect(inside.hasAttribute("data-sk-ready")).toBe(true);
    expect(document.body.lastElementChild?.hasAttribute("data-sk-ready")).toBe(false);
  });

  it("unmounts an auto-mounted root so it can be mounted again", async () => {
    document.body.innerHTML = `<button class="sk-button sk-interactive" data-sk-button>Save</button>`;
    const root = document.body.firstElementChild as HTMLElement;

    expect(await initComponents(root)).toBe(1);
    destroyEnhancer(root);
    expect(root.hasAttribute("data-sk-ready")).toBe(false);
    expect(await initComponents(root)).toBe(1);
  });

  it("leaves documentation previews to their explicit opt-in mounts", async () => {
    document.body.innerHTML = `
      <div data-sk-code-preview></div>
      <div data-sk-component-preview></div>
    `;

    expect(await initComponents(document)).toBe(0);
    expect(document.querySelectorAll("[data-sk-ready]")).toHaveLength(0);
  });
});
