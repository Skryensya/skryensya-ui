import { describe, expect, it } from "vitest";
import { initComponents } from "./registry.js";
import { destroyEnhancer } from "./svelte-hydrate.js";

describe("initComponents", () => {
  it("mounts every authored machine-backed root and is idempotent", () => {
    document.body.innerHTML = `
      <div data-ds-accordion data-type="single" data-default-value="one">
        <section data-part="item" data-value="one"><button data-part="trigger">One</button><div data-part="content">One</div></section>
      </div>
      <section data-ds-expandable-tile data-part="root"><button data-part="trigger">Details</button><div data-part="content">Body</div></section>
      <label data-ds-tile-checkbox data-part="root"><input type="checkbox" data-part="input" /><span data-part="content">Alerts</span><span data-part="indicator"></span></label>
      <div data-ds-tile-radio-group data-part="root" data-name="plan" data-default-value="basic">
        <label data-part="item"><input type="radio" value="basic" /><span data-part="content">Basic</span><span data-part="indicator"></span></label>
        <label data-part="item"><input type="radio" value="pro" /><span data-part="content">Pro</span><span data-part="indicator"></span></label>
      </div>
      <section data-ds-tabs id="tabs" data-value="one">
        <div data-ds-tabs-list><button data-ds-tabs-trigger data-value="one">One</button></div>
        <div data-ds-tabs-content data-value="one">Panel</div>
      </section>
    `;

    expect(initComponents(document)).toBe(5);
    expect(initComponents(document)).toBe(0);
    expect(document.querySelectorAll("[data-ds-accordion-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-ds-expandable-tile-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-ds-tile-checkbox-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-ds-tile-radio-group-ready]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-ds-tabs-ready]")).toHaveLength(1);
  });

  it("does not scan siblings outside the supplied root", () => {
    document.body.innerHTML = `
      <button class="ds-button" data-ds-button>Inside</button>
      <button class="ds-button" data-ds-button>Outside</button>
    `;
    const inside = document.body.firstElementChild as HTMLElement;

    expect(initComponents(inside)).toBe(1);
    expect(inside.hasAttribute("data-ds-ready")).toBe(true);
    expect(document.body.lastElementChild?.hasAttribute("data-ds-ready")).toBe(false);
  });

  it("unmounts an auto-mounted root so it can be mounted again", () => {
    document.body.innerHTML = `<button class="ds-button" data-ds-button>Save</button>`;
    const root = document.body.firstElementChild as HTMLElement;

    expect(initComponents(root)).toBe(1);
    destroyEnhancer(root);
    expect(root.hasAttribute("data-ds-ready")).toBe(false);
    expect(initComponents(root)).toBe(1);
  });
});
