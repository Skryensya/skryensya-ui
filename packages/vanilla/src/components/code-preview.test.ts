import { fireEvent } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { mountCodePreview } from "./code-preview.js";

function markup(options?: { condensedCollapsible?: boolean; linesLabel?: string | null }): string {
  const condensedCollapsible = options?.condensedCollapsible
    ? `data-sk-code-preview-condensed-collapsible data-sk-code-preview-condensed-lines="48"`
    : "";
  /* The count's WORDING belongs to the author, in the author's language; only the number is the
     enhancer's. `null` is the omitted case, which has to degrade to the bare number rather than to
     a word this package picked. */
  const linesLabel =
    options?.linesLabel === null
      ? ""
      : `data-sk-code-preview-lines-label="${options?.linesLabel ?? "{count} líneas"}"`;
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
        ${linesLabel}
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

  /* The count is the one string this enhancer WRITES rather than reads, so it is the one place a
     language could leak out of a package that has none. It used to: the count was built as
     `${n} líneas`, and the English site printed that. */
  it("says the count in the author's language, and only the number without one", () => {
    document.body.innerHTML = markup({ condensedCollapsible: true, linesLabel: "{count} lines" });
    let root = document.querySelector<HTMLElement>("[data-sk-code-preview]");
    let toggle = root?.querySelector<HTMLButtonElement>("[data-sk-code-preview-toggle]");
    let count = toggle?.querySelector<HTMLElement>(".sk-code-preview__toggle-count");
    let input = root?.querySelector<HTMLInputElement>("[data-sk-code-preview-density-input]");
    if (!root || !toggle || !count || !input) throw new Error("Invalid test markup.");

    expect(mountCodePreview(document)).toBe(1);
    expect(count.textContent).toBe("48 lines");

    input.checked = true;
    fireEvent.change(input);
    expect(count.textContent).toBe("96 lines");

    document.body.innerHTML = markup({ condensedCollapsible: true, linesLabel: null });
    root = document.querySelector<HTMLElement>("[data-sk-code-preview]");
    toggle = root?.querySelector<HTMLButtonElement>("[data-sk-code-preview-toggle]");
    count = toggle?.querySelector<HTMLElement>(".sk-code-preview__toggle-count");
    if (!root || !toggle || !count) throw new Error("Invalid test markup.");

    expect(mountCodePreview(document)).toBe(1);
    expect(count.textContent).toBe("48");
  });

  /*
   * The single-panel case (no density switch): `syncDisclosureChrome` used to run only from inside
   * `showDensity`, which only ever fired when a density `<input>` existed — so a plain collapsible
   * preview never got its line count filled in, and its toggle never got `aria-controls`, in the
   * entire time this enhancer has shipped.
   */
  it("fills the count and aria-controls even with no density switch at all", () => {
    document.body.innerHTML = `
      <div
        class="sk-code-preview"
        data-sk-code-preview
        data-sk-code-preview-collapsible
        data-sk-code-preview-expanded="false"
        data-sk-code-preview-lines="42"
      >
        <div class="sk-code-preview__viewport"></div>
        <div data-sk-code-preview-more></div>
        <button
          type="button"
          data-sk-code-preview-toggle
          aria-expanded="false"
          aria-label="Mostrar todas las líneas"
          data-sk-code-preview-lines-label="{count} líneas"
        >
          <span data-sk-code-preview-toggle-label>Mostrar más</span>
          <span class="sk-code-preview__toggle-count"></span>
        </button>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-sk-code-preview]");
    const viewport = root?.querySelector<HTMLElement>(".sk-code-preview__viewport");
    const more = root?.querySelector<HTMLElement>("[data-sk-code-preview-more]");
    const toggle = root?.querySelector<HTMLButtonElement>("[data-sk-code-preview-toggle]");
    const count = toggle?.querySelector<HTMLElement>(".sk-code-preview__toggle-count");
    if (!root || !viewport || !more || !toggle || !count) throw new Error("Invalid test markup.");

    expect(mountCodePreview(document)).toBe(1);

    expect(more.hidden).toBe(false);
    expect(count.textContent).toBe("42 líneas");
    expect(viewport.id).toBeTruthy();
    expect(toggle.getAttribute("aria-controls")).toBe(viewport.id);
  });
});
