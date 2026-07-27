import { fireEvent } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { mountCodePreview } from "./code-preview.js";

function markup(options?: { condensedCollapsible?: boolean }): string {
  const condensedCollapsible = options?.condensedCollapsible
    ? `data-sk-code-preview-condensed-collapsible data-sk-code-preview-condensed-lines="48"`
    : "";
  return `
    <div
      class="sk-code-preview"
      data-sk-code-preview
      data-sk-code-preview-density="condensed"
      data-sk-code-preview-collapsible
      ${condensedCollapsible}
      data-sk-code-preview-expanded="false"
      data-sk-code-preview-lines="96"
    >
      <input type="checkbox" data-sk-code-preview-density-input />
      <div id="panel-condensed" data-sk-code-preview-density-panel="condensed"></div>
      <div id="panel-full" data-sk-code-preview-density-panel="full"></div>
      <div data-sk-code-preview-more ${options?.condensedCollapsible ? "" : "hidden"}></div>
      <button
        type="button"
        data-sk-code-preview-toggle
        aria-expanded="false"
        aria-label="Mostrar todas las líneas"
        aria-controls="panel-full"
        data-sk-code-preview-expanded-label="Mostrar menos"
        data-sk-code-preview-expanded-aria-label="Mostrar sólo el preview"
      >
        <span data-sk-code-preview-toggle-label>Mostrar más</span>
        <span class="sk-code-preview__toggle-count">96 líneas</span>
      </button>
    </div>
  `;
}

describe("CodePreview opt-in enhancer", () => {
  it("switches density, expands, collapses and mounts idempotently", () => {
    document.body.innerHTML = markup();
    const root = document.querySelector<HTMLElement>("[data-sk-code-preview]");
    const input = root?.querySelector<HTMLInputElement>("[data-sk-code-preview-density-input]");
    const more = root?.querySelector<HTMLElement>("[data-sk-code-preview-more]");
    const toggle = root?.querySelector<HTMLButtonElement>("[data-sk-code-preview-toggle]");
    const label = toggle?.querySelector<HTMLElement>("[data-sk-code-preview-toggle-label]");
    if (!root || !input || !more || !toggle || !label) throw new Error("Invalid test markup.");

    expect(mountCodePreview(document)).toBe(1);
    expect(mountCodePreview(document)).toBe(0);
    expect(more.hidden).toBe(true);

    input.checked = true;
    fireEvent.change(input);
    expect(root.getAttribute("data-sk-code-preview-density")).toBe("full");
    expect(more.hidden).toBe(false);
    expect(toggle.getAttribute("aria-controls")).toBe("panel-full");

    fireEvent.click(toggle);
    expect(root.getAttribute("data-sk-code-preview-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-label")).toBe("Mostrar sólo el preview");
    expect(label.textContent).toBe("Mostrar menos");

    input.checked = false;
    fireEvent.change(input);
    expect(root.getAttribute("data-sk-code-preview-density")).toBe("condensed");
    expect(root.getAttribute("data-sk-code-preview-expanded")).toBe("false");
    expect(more.hidden).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-label")).toBe("Mostrar todas las líneas");
    expect(label.textContent).toBe("Mostrar más");
  });

  it("keeps disclosure available when Condensed itself is long", () => {
    document.body.innerHTML = markup({ condensedCollapsible: true });
    const root = document.querySelector<HTMLElement>("[data-sk-code-preview]");
    const input = root?.querySelector<HTMLInputElement>("[data-sk-code-preview-density-input]");
    const more = root?.querySelector<HTMLElement>("[data-sk-code-preview-more]");
    const toggle = root?.querySelector<HTMLButtonElement>("[data-sk-code-preview-toggle]");
    const count = toggle?.querySelector<HTMLElement>(".sk-code-preview__toggle-count");
    if (!root || !input || !more || !toggle || !count) throw new Error("Invalid test markup.");

    expect(mountCodePreview(document)).toBe(1);
    expect(more.hidden).toBe(false);
    expect(toggle.getAttribute("aria-controls")).toBe("panel-condensed");
    expect(count.textContent).toBe("48 líneas");

    fireEvent.click(toggle);
    expect(root.getAttribute("data-sk-code-preview-expanded")).toBe("true");

    input.checked = true;
    fireEvent.change(input);
    expect(more.hidden).toBe(false);
    expect(toggle.getAttribute("aria-controls")).toBe("panel-full");
    expect(count.textContent).toBe("96 líneas");
  });
});
