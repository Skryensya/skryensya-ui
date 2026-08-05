import { fireEvent, waitFor } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { mountCombobox } from "./combobox.js";
import { mountFileUpload } from "./file-upload.js";
import { mountMenu } from "./menu.js";
import { mountNumberField } from "./number-field.js";
import { mountToolbar } from "./toolbar.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

describe("expanded Vanilla inventory", () => {
  it("enhances authored Menu markup and emits the selected value", async () => {
    const root = mount(`<div class="sk-menu" data-sk-menu aria-label="Acciones">
      <button data-sk-menu-trigger>Acciones</button>
      <div data-sk-menu-positioner>
        <div data-sk-menu-content>
          <div data-sk-menu-item data-value="rename">Renombrar</div>
        </div>
      </div>
    </div>`);
    const onSelect = vi.fn();
    root.addEventListener("sk-select", onSelect);

    expect(mountMenu(root)).toBe(1);
    expect(mountMenu(root)).toBe(0);
    const trigger = root.querySelector<HTMLElement>("[data-sk-menu-trigger]")!;
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("true"),
    );
    fireEvent.click(root.querySelector<HTMLElement>("[data-sk-menu-item]")!);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: "rename" } }),
    );
  });

  it("connects an authored nested Menu to its parent", async () => {
    const root =
      mount(`<div class="sk-menu" data-sk-menu data-open aria-label="Acciones">
      <button data-sk-menu-trigger>Acciones</button>
      <div data-sk-menu-positioner>
        <div data-sk-menu-content>
          <div class="sk-menu" data-sk-menu aria-label="Exportar">
            <button class="sk-menu__item" data-sk-menu-trigger>Exportar</button>
            <div data-sk-menu-positioner>
              <div data-sk-menu-content>
                <div data-sk-menu-item data-value="pdf">PDF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`);
    expect(mountMenu(root)).toBe(2);
    const nestedRoot = root.querySelectorAll<HTMLElement>("[data-sk-menu]")[0]!;
    const nestedTrigger = nestedRoot.querySelector<HTMLElement>(
      "[data-sk-menu-trigger]",
    )!;
    expect(nestedTrigger.getAttribute("role")).toBe("menuitem");
    nestedTrigger.focus();
    fireEvent.keyDown(nestedTrigger, { key: "ArrowRight" });
    await waitFor(() =>
      expect(nestedTrigger.getAttribute("aria-expanded")).toBe("true"),
    );
    expect(
      nestedRoot.querySelector('[data-value="pdf"]')?.getAttribute("role"),
    ).toBe("menuitem");
  });

  it("exposes an accessible authored Combobox contract", async () => {
    const root = mount(`<div data-sk-combobox>
      <label data-sk-combobox-label>País</label>
      <div data-sk-combobox-hint>Escribe para filtrar</div>
      <div data-sk-combobox-control>
        <input data-sk-combobox-input />
        <button
          data-sk-combobox-clear
          aria-label="Limpiar selección"
        >×</button>
        <button
          data-sk-combobox-trigger
          aria-label="Mostrar opciones"
        >Opciones</button>
      </div>
      <div data-sk-combobox-status role="status"></div>
      <div data-sk-combobox-positioner>
        <div data-sk-combobox-content>
          <div
            data-sk-combobox-item
            data-value="republica-dominicana"
            data-value-text="República Dominicana"
          >República Dominicana</div>
          <div
            data-sk-combobox-item
            data-value="japon"
            data-value-text="Japón"
          >Japón</div>
          <div data-sk-combobox-empty hidden>Sin resultados</div>
        </div>
      </div>
    </div>`);
    expect(mountCombobox(root)).toBe(1);
    const input = root.querySelector<HTMLInputElement>(
      "[data-sk-combobox-input]",
    )!;
    const hint = root.querySelector<HTMLElement>("[data-sk-combobox-hint]")!;
    const trigger = root.querySelector<HTMLButtonElement>(
      "[data-sk-combobox-trigger]",
    )!;
    const clear = root.querySelector<HTMLButtonElement>(
      "[data-sk-combobox-clear]",
    )!;
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
    expect(trigger.getAttribute("aria-label")).toBe("Mostrar opciones");
    fireEvent.click(input);
    fireEvent.input(input, { target: { value: "republica" } });
    await waitFor(() =>
      expect(
        root.querySelector<HTMLElement>('[data-value="japon"]')?.hidden,
      ).toBe(true),
    );
    expect(
      root.querySelector<HTMLElement>('[data-value="republica-dominicana"]')
        ?.hidden,
    ).toBe(false);
    fireEvent.input(input, { target: { value: "zz" } });
    await waitFor(() =>
      expect(
        root.querySelector<HTMLElement>("[data-sk-combobox-empty]")?.hidden,
      ).toBe(false),
    );
    expect(root.querySelector("[data-sk-combobox-status]")?.textContent).toBe(
      "Sin resultados",
    );
    // Typed text with no selection yet still offers the clear ✕: there is something to wipe.
    expect(clear.hidden).toBe(false);
    // Emptying the input with nothing selected hides it again: no text, no ✕.
    fireEvent.input(input, { target: { value: "" } });
    await waitFor(() => expect(clear.hidden).toBe(true));
    fireEvent.click(input);
    fireEvent.click(
      root.querySelector<HTMLElement>('[data-value="japon"]')!,
    );
    await waitFor(() => expect(clear.hidden).toBe(false));
    expect(clear.tabIndex).toBe(0);
    fireEvent.click(clear);
    await waitFor(() => expect(clear.hidden).toBe(true));
  });

  it("renders removable values for an authored multiple Combobox", async () => {
    const root = mount(`<div
      data-sk-combobox
      data-multiple
      data-value="do ar"
    >
      <label data-sk-combobox-label>Países</label>
      <div data-sk-combobox-control>
        <input data-sk-combobox-input />
        <button data-sk-combobox-trigger>Opciones</button>
      </div>
      <div data-sk-combobox-positioner>
        <div data-sk-combobox-content>
          <div
            data-sk-combobox-item
            data-value="do"
            data-value-text="Dominica"
          >Dominica</div>
          <div
            data-sk-combobox-item
            data-value="ar"
            data-value-text="Argentina"
          >Argentina</div>
        </div>
      </div>
    </div>`);
    expect(mountCombobox(root)).toBe(1);
    const selected = root.querySelector<HTMLElement>(
      "[data-sk-combobox-selected-items]",
    )!;
    expect(selected.textContent).toContain("Dominica");
    expect(selected.textContent).toContain("Argentina");
    const remove = selected.querySelector<HTMLButtonElement>(
      '[aria-label="Quitar Argentina"]',
    )!;
    expect(remove.classList.contains("sk-button")).toBe(true);
    expect(remove.classList.contains("sk-interactive")).toBe(true);
    expect(remove.getAttribute("data-icon-only")).toBe("");
    expect(remove.getAttribute("data-size")).toBe("sm");
    expect(remove.getAttribute("data-variant")).toBe("ghost");
    fireEvent.click(remove);
    await waitFor(() =>
      expect(selected.textContent).not.toContain("Argentina"),
    );
  });

  it("reports files selected through an authored FileUpload input", async () => {
    const root = mount(`<div data-sk-file-upload>
      <label data-sk-file-upload-label>Adjuntos</label>
      <div data-sk-file-upload-dropzone>
        <input data-sk-file-upload-input type="file" />
        <button data-sk-file-upload-trigger type="button">Elegir</button>
      </div>
    </div>`);
    const onChange = vi.fn();
    root.addEventListener("sk-file-change", onChange);
    expect(mountFileUpload(root)).toBe(1);
    const input = root.querySelector<HTMLInputElement>(
      "[data-sk-file-upload-input]",
    )!;
    const file = new File(["contenido"], "adjunto.txt", {
      type: "text/plain",
    });
    fireEvent.input(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({ acceptedFiles: [file] }),
        }),
      ),
    );
  });

  it("increments NumberField through the shared machine", async () => {
    const root = mount(`<div data-sk-number-field>
      <label data-sk-number-field-label>Cantidad</label>
      <div data-sk-number-field-control>
        <button data-sk-number-field-decrement aria-label="Disminuir">−</button>
        <input data-sk-number-field-input value="2" />
        <button data-sk-number-field-increment aria-label="Aumentar">+</button>
      </div>
    </div>`);
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", onChange);
    expect(mountNumberField(root)).toBe(1);
    const increment = root.querySelector<HTMLElement>(
      "[data-sk-number-field-increment]",
    )!;
    fireEvent.pointerDown(increment, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(increment, { button: 0, pointerType: "mouse" });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { value: "3", valueAsNumber: 3 } }),
      ),
    );
  });

  it("moves focus through an authored Toolbar with arrow keys", () => {
    const root = mount(`<div data-sk-toolbar aria-label="Formato">
      <button>Negrita</button><button>Cursiva</button>
    </div>`);
    expect(mountToolbar(root)).toBe(1);
    const controls = root.querySelectorAll<HTMLButtonElement>("button");
    controls[0]?.focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(controls[1]);
  });
});
