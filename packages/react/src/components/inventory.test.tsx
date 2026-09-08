import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./breadcrumb.js";
import { Combobox } from "./combobox.js";
import { Calendar } from "./calendar.js";
import { DatePicker } from "./date-picker.js";
import { EmptyState } from "./empty-state.js";
import { FileUpload } from "./file-upload.js";
import { Icon } from "./icon.js";
import { Menu } from "./menu.js";
import { NumberField } from "./number-field.js";
import { SplitButton } from "./split-button.js";
import { TimeField } from "./time-field.js";
import { Popover } from "./popover.js";
import { Toolbar } from "./toolbar.js";
import { TreeView } from "./tree-view.js";

describe("expanded component inventory", () => {
  it("marks only the current breadcrumb item as the current page", () => {
    const ui = render(
      <Breadcrumb
        items={[{ href: "/", label: "Inicio" }, { label: "Proyectos" }]}
      />,
    );
    expect(ui.getByRole("link", { name: "Inicio" }).getAttribute("href")).toBe(
      "/",
    );
    expect(ui.getByText("Proyectos").getAttribute("aria-current")).toBe("page");
  });

  it("moves toolbar focus with orientation-aware arrow keys", () => {
    const ui = render(
      <Toolbar label="Formato">
        <button type="button">Negrita</button>
        <button type="button">Cursiva</button>
      </Toolbar>,
    );
    const bold = ui.getByRole("button", { name: "Negrita" });
    const italic = ui.getByRole("button", { name: "Cursiva" });
    bold.focus();
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(italic);
  });

  it("opens Menu and reports the selected action", async () => {
    const onSelect = vi.fn();
    const ui = render(
      <Menu
        items={[{ label: "Renombrar", value: "rename" }]}
        label="Acciones"
        onSelect={onSelect}
        trigger="Acciones"
      />,
    );
    fireEvent.click(ui.getByRole("button", { name: "Acciones" }));
    fireEvent.click(await ui.findByRole("menuitem", { name: "Renombrar" }));
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({ value: "rename" }),
    );
  });

  it("opens a nested Menu with the submenu arrow key", async () => {
    const onSelect = vi.fn();
    const ui = render(
      <Menu
        defaultOpen
        items={[
          {
            label: "Exportar",
            value: "export",
            children: [{ label: "PDF", value: "pdf" }],
          },
        ]}
        label="Acciones"
        onSelect={onSelect}
        trigger="Acciones"
      />,
    );
    const submenu = await ui.findByRole("menuitem", { name: /Exportar/ });
    submenu.focus();
    fireEvent.keyDown(submenu, { key: "ArrowRight" });
    fireEvent.click(await ui.findByRole("menuitem", { name: "PDF" }));
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({ value: "pdf" }),
    );
  });

  it("filters Combobox suggestions without requiring accents", async () => {
    const ui = render(
      <Combobox
        items={[
          {
            label: "República Dominicana",
            value: "republica-dominicana",
          },
          { label: "Japón", value: "japon" },
        ]}
        label="País"
      />,
    );
    const input = ui.getByRole("combobox", { name: "País" });
    fireEvent.click(input);
    fireEvent.input(input, { target: { value: "republica" } });
    expect(
      await ui.findByRole("option", {
        name: "República Dominicana",
      }),
    ).toBeTruthy();
    expect(ui.queryByRole("option", { name: "Japón" })).toBeNull();
  });
  it("wires Combobox help, errors and localized actions", () => {
    const ui = render(
      <Combobox
        defaultValue={["do"]}
        error="Selecciona un país admitido"
        hint="Escribe para filtrar"
        items={[{ label: "Dominica", value: "do" }]}
        label="País"
        required
      />,
    );
    const input = ui.getByRole("combobox", { name: "País" });
    const hint = ui.getByText("Escribe para filtrar");
    const error = ui.getByText("Selecciona un país admitido");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual(
      expect.arrayContaining([hint.id, error.id]),
    );
    expect(input.getAttribute("aria-errormessage")).toBe(error.id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    // The chevron is decorative, not a second control (see combobox.tsx's own note): no
    // accessible name, `aria-hidden`, and it composes none of Button's contract.
    const trigger = ui.container.querySelector(".sk-combobox__trigger")!;
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger.getAttribute("aria-hidden")).toBe("true");
    expect(trigger.classList.contains("sk-button")).toBe(false);
    const clear = ui.getByRole("button", { name: "Limpiar selección" });
    expect(clear.tabIndex).toBe(0);
    expect(clear.classList.contains("sk-button")).toBe(true);
    expect(clear.classList.contains("sk-interactive")).toBe(true);
    expect(clear.getAttribute("data-icon-only")).toBe("");
    expect(clear.getAttribute("data-size")).toBe("sm");
    expect(clear.getAttribute("data-variant")).toBe("ghost");
  });

  it("shows and removes values from a multiple Combobox", async () => {
    const ui = render(
      <Combobox
        defaultValue={["do", "ar"]}
        items={[
          { label: "Dominica", value: "do" },
          { label: "Argentina", value: "ar" },
        ]}
        label="Países"
        multiple
      />,
    );
    const selected = ui.getByRole("list", {
      name: "Valores seleccionados",
    });
    expect(selected.textContent).toContain("Dominica");
    expect(selected.textContent).toContain("Argentina");
    const remove = ui.getByRole("button", { name: "Quitar Argentina" });
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

  it("renders DatePicker as a localized calendar contract", async () => {
    const ui = render(
      <DatePicker label="Llegada" locale="es-DO" timeZone="UTC" />,
    );
    expect(ui.getByText("Llegada")).toBeTruthy();
    expect(ui.container.querySelector(".sk-date-picker__input")).toBeTruthy();
    expect(document.querySelector(".sk-date-picker__content")).toBeTruthy();

    const weekdays = Array.from(
      document.querySelectorAll<HTMLElement>(".sk-calendar__table-header abbr"),
    );
    expect(weekdays.map((day) => day.textContent)).toEqual([
      "Do",
      "Lu",
      "Ma",
      "Mi",
      "Ju",
      "Vi",
      "Sá",
    ]);
    expect(weekdays.map((day) => day.title)).toEqual([
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ]);

    // The view-trigger only escalates the view (day → month → year) with the calendar open: the machine
    // ignores VIEW.TOGGLE in the idle state, just as it ignored month/year changes when it was not open.
    const trigger = ui.container.querySelector<HTMLButtonElement>(
      ".sk-date-picker__trigger",
    );
    if (!trigger) throw new Error("calendar trigger missing");
    expect(trigger.classList.contains("sk-button")).toBe(true);
    expect(trigger.classList.contains("sk-interactive")).toBe(true);
    expect(trigger.getAttribute("data-icon-only")).toBe("");
    expect(trigger.getAttribute("data-size")).toBe("sm");
    expect(trigger.getAttribute("data-variant")).toBe("ghost");
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(
        document
          .querySelector(".sk-date-picker__content")
          ?.getAttribute("data-state"),
      ).toBe("open");
    });

    // The header is one button, not two selects: a click escalates day → month → year.
    const viewTrigger = () =>
      document.querySelector<HTMLButtonElement>(".sk-calendar__view-trigger");
    if (!viewTrigger()) throw new Error("calendar view trigger missing");

    fireEvent.click(viewTrigger()!); // día → mes
    await waitFor(() => {
      expect(document.querySelector(".sk-calendar__month-grid")).toBeTruthy();
    });
    fireEvent.click(viewTrigger()!); // mes → año
    await waitFor(() => {
      expect(document.querySelector(".sk-calendar__year-grid")).toBeTruthy();
    });
    const selectableYearCell = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".sk-calendar__cell-trigger"),
    ).find((cell) => !cell.disabled);
    if (!selectableYearCell) throw new Error("no selectable year cell in the decade grid");
    const chosenYear = selectableYearCell.textContent?.trim();
    fireEvent.click(selectableYearCell); // back to the month view in the chosen year
    await waitFor(() => {
      expect(document.querySelector(".sk-calendar__month-grid")).toBeTruthy();
    });
    const januaryCell = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".sk-calendar__cell-trigger"),
    ).find((cell) => cell.textContent?.trim().toLowerCase().startsWith("ene"));
    if (!januaryCell) throw new Error("january month cell missing");
    fireEvent.click(januaryCell); // back to the day view in January of the chosen year

    await waitFor(() => {
      expect(
        Array.from(
          document.querySelectorAll<HTMLButtonElement>(".sk-calendar__cell-trigger"),
        ).some((day) => day.getAttribute("aria-label")?.includes(`enero de ${chosenYear}`)),
      ).toBe(true);
    });

    const selectableDay = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".sk-calendar__cell-trigger"),
    ).find(
      (day) =>
        !day.disabled &&
        day.getAttribute("aria-label")?.includes(`enero de ${chosenYear}`),
    );
    if (!selectableDay) throw new Error("selectable calendar day missing");
    fireEvent.click(selectableDay);

    const clear = await waitFor(() => {
      const element = ui.container.querySelector<HTMLButtonElement>(
        ".sk-date-picker__clear",
      );
      expect(element).toBeTruthy();
      return element!;
    });
    expect(clear.getAttribute("aria-label")).toBe("Limpiar");
    // A real icon, not the `×` glyph this asserted while React drew one and the enhancer mounted
    // the other: the two bindings were showing different marks on the same button.
    expect(clear.querySelector("svg")?.getAttribute("data-icon")).toBe("close");
    expect(clear.classList.contains("sk-button")).toBe(true);
    expect(clear.classList.contains("sk-interactive")).toBe(true);
    expect(clear.getAttribute("data-icon-only")).toBe("");
    expect(clear.getAttribute("data-size")).toBe("sm");
    expect(clear.getAttribute("data-variant")).toBe("ghost");

    // Hidden once there is nothing to clear, not removed: the enhancer patches authored markup and
    // can only toggle `hidden`, so both bindings do that and land on the same DOM. `hidden` keeps it
    // out of the accessibility tree exactly as absence did.
    fireEvent.click(clear);
    await waitFor(() => {
      expect(
        ui.container.querySelector<HTMLElement>(".sk-date-picker__clear")?.hidden,
      ).toBe(true);
    });
  });

  it("labels a standalone Calendar without an input", () => {
    const ui = render(<Calendar label="Disponibilidad" locale="es-DO" />);
    const label = ui.getByText("Disponibilidad");
    const calendar = ui.container.querySelector(".sk-calendar");
    expect(calendar?.getAttribute("aria-labelledby")).toBe(label.id);
    expect(ui.container.querySelector(".sk-date-picker")).toBeNull();
    expect(ui.container.querySelector(".sk-date-picker__positioner")).toBeNull();
  });

  it("expands and selects TreeView nodes through tree semantics", async () => {
    const onSelectionChange = vi.fn();
    const ui = render(
      <TreeView
        defaultExpandedValue={["src"]}
        label="Archivos"
        branchIcon={<Icon name="folder" size="sm" />}
        leafIcon={<Icon name="file" size="sm" />}
        nodes={[
          {
            id: "src",
            label: "src",
            children: [{ id: "index", label: "index.ts" }],
          },
        ]}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(ui.container.querySelectorAll('[data-icon="folder"]')).toHaveLength(1);
    expect(ui.container.querySelectorAll('[data-icon="file"]')).toHaveLength(1);
    fireEvent.click(ui.getByRole("treeitem", { name: "index.ts" }));
    await waitFor(() =>
      expect(onSelectionChange).toHaveBeenCalledWith({
        selectedValue: ["index"],
      }),
    );
  });

  it("increments NumberField and reports both serialized and numeric values", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <NumberField
        defaultValue="2"
        label="Cantidad"
        onValueChange={onValueChange}
      />,
    );
    const increment = ui.getByRole("button", { name: "Aumentar" });
    const decrement = ui.getByRole("button", { name: "Disminuir" });
    for (const stepper of [decrement, increment]) {
      expect(stepper.classList.contains("sk-button")).toBe(true);
      expect(stepper.classList.contains("sk-interactive")).toBe(true);
      expect(stepper.getAttribute("data-icon-only")).toBe("");
      expect(stepper.getAttribute("data-size")).toBe("sm");
      expect(stepper.getAttribute("data-variant")).toBe("ghost");
    }
    fireEvent.pointerDown(increment, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(increment, { button: 0, pointerType: "mouse" });
    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith({
        value: "3",
        valueAsNumber: 3,
      }),
    );
  });

  it("keeps TimeField's segmented contract and the bare popover's native one", () => {
    const ui = render(
      <>
        <TimeField label="Hora de reunión" locale="en-US" name="meeting" />
        {/* The bare surface: `Popover.bare` in the contract. It replaced a separate `Popup`
            component that aliased popover's own parts under a second name. */}
        <Popover bare trigger="Filtros">
          <label>
            <input type="checkbox" /> Activos
          </label>
        </Popover>
      </>,
    );
    // No `@zag-js/time-picker` machine exists, so TimeField is its own segmented
    // `role="group"` of `role="spinbutton"`s, not a real `type="time"` input.
    expect(ui.getByRole("group", { name: "Hora de reunión" })).toBeTruthy();
    expect(ui.getByRole("spinbutton", { name: "Hora" })).toBeTruthy();
    expect(
      ui.getByRole("button", { name: "Filtros" }).hasAttribute("popovertarget"),
    ).toBe(true);
  });

  it("keeps EmptyState content and SplitButton actions explicit", async () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const ui = render(
      <>
        <EmptyState
          title="Sin proyectos"
          actions={<button type="button">Crear</button>}
        />
        <SplitButton
          menuItems={[{ label: "Guardar copia", value: "copy" }]}
          menuLabel="Más opciones"
          onClick={onClick}
          onSelect={onSelect}
        >
          Guardar
        </SplitButton>
      </>,
    );
    expect(ui.getByRole("heading", { name: "Sin proyectos" })).toBeTruthy();
    fireEvent.click(ui.getByRole("button", { name: "Guardar" }));
    expect(onClick).toHaveBeenCalledOnce();
    fireEvent.click(ui.getByRole("button", { name: "Más opciones" }));
    fireEvent.click(await ui.findByRole("menuitem", { name: "Guardar copia" }));
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({ value: "copy" }),
    );
  });

  it("disables both SplitButton actions as one control", () => {
    const ui = render(
      <SplitButton
        disabled
        menuItems={[{ label: "Guardar copia", value: "copy" }]}
        menuLabel="Más opciones"
      >
        Guardar
      </SplitButton>,
    );
    expect(
      ui.getByRole("button", { name: "Guardar" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      ui.getByRole("button", { name: "Más opciones" }).hasAttribute("disabled"),
    ).toBe(true);
    const trigger = ui.getByRole("button", { name: "Más opciones" });
    expect(trigger.hasAttribute("data-weld-start")).toBe(true);
    expect(trigger.hasAttribute("data-icon-only")).toBe(true);
    // The trigger pairs with the action on BOTH axes now, not just emphasis.
    expect(trigger.getAttribute("data-variant")).toBe("solid");
    expect(trigger.getAttribute("data-tone")).toBe("accent");
  });

  it("forwards multiple native files through FileUpload", async () => {
    const onFileChange = vi.fn();
    const ui = render(
      <FileUpload label="Adjuntos" multiple onFileChange={onFileChange} />,
    );
    const input = ui.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    const secondFile = new File(["world"], "world.txt", {
      type: "text/plain",
    });
    fireEvent.input(input, { target: { files: [file, secondFile] } });
    await waitFor(() =>
      expect(onFileChange).toHaveBeenCalledWith(
        expect.objectContaining({ acceptedFiles: [file, secondFile] }),
      ),
    );
  });
});
