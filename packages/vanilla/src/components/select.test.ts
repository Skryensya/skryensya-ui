import { fireEvent, waitFor } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { connectSelect, mountSelect } from "./select.js";

const items = [
  { value: "default", label: "default" },
  { value: "dusk", label: "dusk" },
  { value: "ember", label: "ember" },
];

function markup({ hidden = false, value = "default" } = {}) {
  return `<div class="sk-select" data-sk-select id="brand" data-value="${value}" data-name="brand">
    ${hidden ? `<select data-sk-select-hidden name="brand">${items.map((i) => `<option value="${i.value}">${i.label}</option>`).join("")}</select>` : ""}
    <div class="sk-select__control" data-sk-select-control>
      <label class="sk-select__label" data-sk-select-label>Marca</label>
      <button class="sk-select__trigger sk-interactive" data-sk-select-trigger>
        <span class="sk-select__value" data-sk-select-value>default</span>
        <span class="sk-select__indicator" data-sk-select-indicator aria-hidden="true"><span data-state="closed"><svg class="sk-icon"></svg></span><span data-state="open"><svg class="sk-icon"></svg></span></span>
      </button>
    </div>
    <div class="sk-select__positioner" data-sk-select-positioner>
      <ul class="sk-select__content" data-sk-select-content>
        ${items
          .map(
            (i) => `<li class="sk-select__item sk-interactive" data-sk-select-item data-value="${i.value}">
              <span class="sk-select__item-text" data-sk-select-item-text>${i.label}</span>
              <span class="sk-select__item-indicator" data-sk-select-item-indicator aria-hidden="true"><svg class="sk-icon"></svg></span>
            </li>`,
          )
          .join("")}
      </ul>
    </div>
  </div>`;
}

function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

describe("Select Vanilla contracts", () => {
  it("drives the machine over authored markup: ARIA, selection and the value text", async () => {
    const root = mount(markup());
    const onValueChange = vi.fn();
    const cleanup = connectSelect(root, { onValueChange });

    const trigger = root.querySelector("[data-sk-select-trigger]") as HTMLElement;
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(root.querySelector("[data-sk-select-value]")?.textContent).toBe("default");

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    const dusk = root.querySelector('[data-sk-select-item][data-value="dusk"]') as HTMLElement;
    fireEvent.click(dusk);

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["dusk"] })));
    expect(root.querySelector("[data-sk-select-value]")?.textContent).toBe("dusk");
  });

  it("emits sk-value-change, and cleanup stops the machine", async () => {
    const root = mount(markup());
    const handler = vi.fn();
    root.addEventListener("sk-value-change", handler);
    const cleanup = connectSelect(root);

    fireEvent.click(root.querySelector("[data-sk-select-trigger]") as HTMLElement);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="ember"]') as HTMLElement);
    await waitFor(() => expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: ["ember"] } })));

    cleanup();
    handler.mockClear();
    fireEvent.click(root.querySelector("[data-sk-select-trigger]") as HTMLElement);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="dusk"]') as HTMLElement);
    expect(handler).not.toHaveBeenCalled();
  });

  it("never writes a class: the consumer's stay exactly as authored", async () => {
    const root = mount(markup());
    const trigger = root.querySelector("[data-sk-select-trigger]") as HTMLElement;
    const authored = trigger.className;
    connectSelect(root);

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    expect(trigger.className).toBe(authored);
    expect(root.className).toBe("sk-select");
  });

  it("keeps the id the consumer authored, rather than renaming it", async () => {
    const root = mount(markup());
    connectSelect(root);

    // Left alone the machine would rename this to "select:brand" and quietly break every
    // #brand selector the consumer wrote.
    expect(root.id).toBe("brand");

    const trigger = root.querySelector("[data-sk-select-trigger]") as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    expect(root.id).toBe("brand");
  });

  it("keeps an authored hidden select in sync for forms", async () => {
    const root = mount(markup({ hidden: true }));
    connectSelect(root);
    const hidden = root.querySelector("select") as HTMLSelectElement;

    fireEvent.click(root.querySelector("[data-sk-select-trigger]") as HTMLElement);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="dusk"]') as HTMLElement);

    await waitFor(() => expect(hidden.value).toBe("dusk"));
  });

  it("refuses a hidden select that drifted from the items", () => {
    const root = mount(markup({ hidden: true }).replace('<option value="dusk">dusk</option>', ""));

    expect(() => connectSelect(root)).toThrow(/drifted/);
  });

  it("mounts from authored data attributes, and mounting twice is idempotent", () => {
    document.body.innerHTML = markup();

    expect(mountSelect(document)).toBe(1);
    expect(mountSelect(document)).toBe(0);
  });

  it("moves aria-selected onto the highlighted option before Enter commits anything", async () => {
    const root = mount(markup({ value: "" }));
    connectSelect(root);
    const trigger = root.querySelector("[data-sk-select-trigger]") as HTMLElement;
    const content = root.querySelector("[data-sk-select-content]") as HTMLElement;
    const itemAt = (value: string) =>
      root.querySelector(`[data-sk-select-item][data-value="${value}"]`) as HTMLElement;

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    // Nothing chosen yet, nothing highlighted yet: no option should claim to be "selected".
    for (const item of items) expect(itemAt(item.value).hasAttribute("aria-selected")).toBe(false);

    // Unlike Combobox's virtual-focus-on-input model, Select moves REAL DOM focus into the
    // listbox on open (`setInitialFocus`, deferred to `raf`) — arrow keys are dispatched wherever
    // focus actually landed. Waiting for the exact target (not just "not the trigger") matters:
    // `document.activeElement` passes through `<body>` first, which would vacuously satisfy a
    // weaker check before the `raf` callback actually lands the focus on the content.
    await waitFor(() => expect(document.activeElement).toBe(content));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    // Matches the WAI reference implementation (`combobox-autocomplete.js`,
    // `setCurrentOptionStyle`), and the same fix already applied to Combobox: the option under
    // `aria-activedescendant` carries `aria-selected="true"` while merely previewed, not just the
    // previously chosen value.
    await waitFor(() => expect(itemAt("default").getAttribute("aria-selected")).toBe("true"));
    expect(itemAt("dusk").hasAttribute("aria-selected")).toBe(false);

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    await waitFor(() => expect(itemAt("dusk").getAttribute("aria-selected")).toBe("true"));
    expect(itemAt("default").hasAttribute("aria-selected")).toBe(false);
  });
});
