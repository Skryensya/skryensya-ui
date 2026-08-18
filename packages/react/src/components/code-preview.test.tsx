import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodePreview, CodePreviewDensity } from "./code-preview.js";
import { ComponentPreviewBare } from "./component-preview.js";

describe("CodePreview", () => {
  it("wraps already-highlighted code without touching it", () => {
    const ui = render(
      <CodePreview>
        <pre>
          <code>
            <span className="hl">const</span> x = 1
          </code>
        </pre>
      </CodePreview>,
    );
    const root = ui.container.querySelector(".sk-code-preview")!;

    // Shiki runs at build or on the server; `children` is whatever the author produced.
    expect(root.querySelector(".sk-code-preview__viewport pre code .hl")?.textContent).toBe("const");
    expect(root.getAttribute("data-sk-code-preview")).toBe("");
    expect(root.querySelector(".sk-code-preview__label")).toBeNull();
    expect(root.querySelector(".sk-code-preview__more")).toBeNull();
  });

  it("claims no state the enhancer has not written yet", () => {
    const ui = render(
      <CodePreview collapsible lines={62} previewLines={20}>
        <pre>código</pre>
      </CodePreview>,
    );
    const root = ui.container.querySelector(".sk-code-preview")!;

    expect(root.getAttribute("data-sk-code-preview-collapsible")).toBe("");
    expect(root.getAttribute("data-sk-code-preview-lines")).toBe("62");
    expect(root.getAttribute("data-sk-code-preview-preview-lines")).toBe("20");
    // `expanded` is written when the control is used, so nothing claims it at rest.
    expect(root.hasAttribute("data-sk-code-preview-expanded")).toBe(false);
    // The count comes from a rendered height, which does not exist without a layout.
    expect(root.querySelector(".sk-code-preview__toggle-count")?.textContent).toBe("");
  });

  it("flips the disclosure control's own label and state", () => {
    const ui = render(
      <CodePreview collapsible lessLabel="Ver menos" moreLabel="Ver 40 líneas más">
        <pre>código</pre>
      </CodePreview>,
    );
    const toggle = ui.getByRole("button", { name: /Ver 40 líneas más/ });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("data-size")).toBe("sm");
    expect(toggle.getAttribute("data-variant")).toBe("ghost");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.querySelector("[data-sk-code-preview-toggle-label]")?.textContent).toBe("Ver menos");
  });

  it("points aria-controls at the panel it discloses", () => {
    const ui = render(
      <CodePreview collapsible>
        <pre>código</pre>
      </CodePreview>,
    );
    const toggle = ui.container.querySelector(".sk-code-preview__toggle")!;
    const viewport = ui.container.querySelector(".sk-code-preview__viewport")!;

    expect(viewport.id).toBeTruthy();
    expect(toggle.getAttribute("aria-controls")).toBe(viewport.id);
  });

  it("puts the aside beside the meta block, not inside it", () => {
    const ui = render(
      <CodePreview aside={<span data-testid="aside">switch</span>} label="button.tsx" note="React">
        <pre>código</pre>
      </CodePreview>,
    );
    const labelRow = ui.container.querySelector(".sk-code-preview__label")!;
    const meta = labelRow.querySelector(".sk-code-preview__meta")!;

    expect(meta.textContent).toBe("button.tsxReact");
    expect(meta.querySelector("[data-testid='aside']")).toBeNull();
    expect(labelRow.querySelector("[data-testid='aside']")).toBeTruthy();
  });
});

describe("CodePreviewDensity", () => {
  it("renders two addressable panels and one switch between them", () => {
    const ui = render(
      <CodePreviewDensity condensed={<pre>corto</pre>} full={<pre>completo</pre>} label="button.tsx" />,
    );
    const root = ui.container.querySelector(".sk-code-preview")!;

    // Each panel is addressable on its own: the enhancer shows one and hides the other.
    expect(
      root.querySelector('[data-sk-code-preview-density-panel="condensed"]')?.textContent,
    ).toBe("corto");
    expect(root.querySelector('[data-sk-code-preview-density-panel="full"]')?.textContent).toBe(
      "completo",
    );
    // No extra wrapper: the children already ARE the viewports.
    expect(root.querySelectorAll(".sk-code-preview__viewport")).toHaveLength(2);
    expect(root.getAttribute("data-sk-code-preview-density")).toBe("condensed");
  });

  it("names the switch after what it does, and the ends beside it", () => {
    const ui = render(
      <CodePreviewDensity
        condensed={<pre>corto</pre>}
        condensedLabel="Corto"
        full={<pre>completo</pre>}
        fullLabel="Todo"
      />,
    );

    // The ends are labels BESIDE the switch, so the name still says what flipping it does.
    const control = ui.getByRole("switch", { name: "Mostrar la versión completa" });
    expect(control.getAttribute("data-sk-code-preview-density-input")).toBe("");
    expect(control.getAttribute("type")).toBe("checkbox");

    const edges = Array.from(ui.container.querySelectorAll(".sk-code-preview__density-edge"));
    expect(edges.map((edge) => [edge.getAttribute("data-density"), edge.textContent])).toEqual([
      ["condensed", "Corto"],
      ["full", "Todo"],
    ]);
  });

  it("actually flips which panel shows when the switch is used", () => {
    const ui = render(<CodePreviewDensity condensed={<pre>corto</pre>} full={<pre>completo</pre>} />);
    const root = ui.container.querySelector(".sk-code-preview")!;
    const control = ui.getByRole("switch");

    expect(root.getAttribute("data-sk-code-preview-density")).toBe("condensed");

    fireEvent.click(control);

    expect(root.getAttribute("data-sk-code-preview-density")).toBe("full");
    expect((control as HTMLInputElement).checked).toBe(true);
  });

  it("points aria-controls at whichever panel is current", () => {
    const ui = render(
      <CodePreviewDensity collapsible condensed={<pre>corto</pre>} full={<pre>completo</pre>} />,
    );
    const toggle = ui.container.querySelector(".sk-code-preview__toggle")!;
    const control = ui.getByRole("switch");
    const condensedPanel = ui.container.querySelector('[data-sk-code-preview-density-panel="condensed"]')!;
    const fullPanel = ui.container.querySelector('[data-sk-code-preview-density-panel="full"]')!;

    expect(toggle.getAttribute("aria-controls")).toBe(condensedPanel.id);

    fireEvent.click(control);

    expect(toggle.getAttribute("aria-controls")).toBe(fullPanel.id);
  });
});

describe("ComponentPreviewBare", () => {
  it("stages an example above its own source", () => {
    const ui = render(
      <ComponentPreviewBare
        code={
          <CodePreview>
            <pre>código</pre>
          </CodePreview>
        }
        note="variante ghost"
        stage={<button type="button">Guardar</button>}
        title="Botón"
      />,
    );
    const root = ui.container.querySelector(".sk-component-preview")!;

    expect(root.querySelector(".sk-component-preview__title")?.textContent).toBe("Botón");
    expect(root.querySelector(".sk-component-preview__note")?.textContent).toBe("variante ghost");
    expect(root.querySelector(".sk-component-preview__stage button")?.textContent).toBe("Guardar");
    // The bare form ships no binding switch and no screen presets: those belong to the docs site.
    expect(root.querySelector(".sk-component-preview__binding-tabs")).toBeNull();
    expect(root.querySelector(".sk-component-preview__screen-tabs")).toBeNull();
    expect(root.querySelector(".sk-code-preview")).toBeTruthy();
  });

  it("drops the header when there is nothing to caption", () => {
    const ui = render(<ComponentPreviewBare code={null} stage={<span>algo</span>} title="" />);
    expect(ui.container.querySelector(".sk-component-preview__header")).toBeNull();
  });
});
