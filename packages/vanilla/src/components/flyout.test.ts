import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectFlyout, mountFlyout } from "./flyout.js";

const items = [
  { value: "default", label: "default" },
  { value: "dusk", label: "dusk" },
  { value: "ember", label: "ember" },
];

function markup({ value = "default" } = {}) {
  return `<div class="sk-flyout" data-sk-flyout id="brand" data-value="${value}">
    <label class="sk-flyout__label" data-sk-flyout-label>Marca</label>
    <button class="sk-flyout__trigger sk-interactive" data-sk-flyout-trigger type="button">
      <span class="sk-flyout__value" data-sk-flyout-value>default</span>
      <span class="sk-flyout__indicator" data-sk-flyout-indicator aria-hidden="true">
        <span data-state="closed"></span>
        <span data-state="open"></span>
      </span>
    </button>
    <ul class="sk-flyout__panel" data-sk-flyout-panel>
      ${items
        .map(
          (i) => `<li class="sk-flyout__item sk-interactive" data-sk-flyout-item data-value="${i.value}">
            <span class="sk-flyout__item-text" data-sk-flyout-item-text>${i.label}</span>
            <span class="sk-flyout__item-indicator" data-sk-flyout-item-indicator aria-hidden="true"></span>
          </li>`,
        )
        .join("")}
    </ul>
  </div>`;
}

function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Flyout Vanilla contracts", () => {
  it("opens on click and keeps ARIA + value text in sync", async () => {
    const root = mount(markup());
    const cleanup = connectFlyout(root);
    const trigger = root.querySelector("[data-sk-flyout-trigger]") as HTMLElement;
    const panel = root.querySelector("[data-sk-flyout-panel]") as HTMLElement;

    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hasAttribute("hidden")).toBe(true);

    fireEvent.pointerEnter(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(panel.dataset.placement).toBe("fixed");

    cleanup();
  });

  it("emits sk-value-change on item click and closes", async () => {
    const root = mount(markup());
    const onValueChange = vi.fn();
    const handler = vi.fn();
    root.addEventListener("sk-value-change", handler);
    const cleanup = connectFlyout(root, { onValueChange });

    fireEvent.click(root.querySelector("[data-sk-flyout-trigger]") as HTMLElement);
    fireEvent.click(root.querySelector('[data-sk-flyout-item][data-value="dusk"]') as HTMLElement);

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith({ value: ["dusk"] }));
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: ["dusk"] } }));
    expect(root.querySelector("[data-sk-flyout-value]")?.textContent).toBe("dusk");
    expect(root.querySelector("[data-sk-flyout-trigger]")?.getAttribute("aria-expanded")).toBe("false");

    cleanup();
  });

  it("closes on Escape", async () => {
    const root = mount(markup());
    connectFlyout(root);
    const trigger = root.querySelector("[data-sk-flyout-trigger]") as HTMLElement;

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    fireEvent.keyDown(trigger, { key: "Escape" });
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("keeps only one flyout open at a time", async () => {
    document.body.innerHTML = `${markup({ value: "default" })}${markup({ value: "dusk" }).replace('id="brand"', 'id="brand-b"')}`;
    const [first, second] = Array.from(document.body.querySelectorAll<HTMLElement>("[data-sk-flyout]"));
    connectFlyout(first);
    connectFlyout(second);

    const firstTrigger = first.querySelector("[data-sk-flyout-trigger]") as HTMLElement;
    const secondTrigger = second.querySelector("[data-sk-flyout-trigger]") as HTMLElement;

    fireEvent.click(firstTrigger);
    await waitFor(() => expect(firstTrigger.getAttribute("aria-expanded")).toBe("true"));

    fireEvent.click(secondTrigger);
    await waitFor(() => expect(secondTrigger.getAttribute("aria-expanded")).toBe("true"));
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("flips the panel to inline-start when the end side overflows the viewport", async () => {
    const root = mount(markup());
    const trigger = root.querySelector("[data-sk-flyout-trigger]") as HTMLElement;
    const panel = root.querySelector("[data-sk-flyout-panel]") as HTMLElement;

    Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 400 });
    Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, value: 600 });
    Object.defineProperty(trigger, "getBoundingClientRect", {
      value: () => ({ top: 40, right: 360, bottom: 72, left: 260, width: 100, height: 32, x: 260, y: 40, toJSON: () => ({}) }),
    });
    Object.defineProperty(panel, "getBoundingClientRect", {
      value: () => ({ top: 0, right: 280, bottom: 160, left: 0, width: 280, height: 160, x: 0, y: 0, toJSON: () => ({}) }),
    });
    Object.defineProperty(panel, "offsetWidth", { configurable: true, value: 280 });
    Object.defineProperty(panel, "offsetHeight", { configurable: true, value: 160 });

    connectFlyout(root);
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    expect(panel.dataset.side).toBe("inline-start");
    expect(panel.style.left).toBe("8px");
  });

  it("mounts from authored data attributes, and mounting twice is idempotent", () => {
    document.body.innerHTML = markup();
    expect(mountFlyout(document)).toBe(1);
    expect(mountFlyout(document)).toBe(0);
  });
});
