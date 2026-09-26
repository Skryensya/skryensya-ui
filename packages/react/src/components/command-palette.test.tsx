import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./command-palette.js";

const items = [
  { href: "/componentes/boton", label: "Botón", section: "Componentes", group: "Acciones" },
  { href: "/componentes/dialogo", label: "Diálogo", section: "Componentes" },
  { href: "/tokens", label: "Tokens", context: "Fundamentos" },
];

const open = (ui: ReturnType<typeof render>) =>
  ui.container.querySelector<HTMLInputElement>("input[role='combobox']")!;

describe("CommandPalette", () => {
  it("claims nothing at rest: no options and no expanded popup", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);

    // The enhancer only fills the list from `open()`, so a palette at rest has none, and a combobox
    // announcing an expanded popup over an empty listbox is what this fixed.
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    expect(ui.container.querySelectorAll("[role='option']")).toHaveLength(0);
    expect(ui.container.querySelector<HTMLElement>(".sk-command-palette__empty")?.hidden).toBe(true);
    // WAI's combobox pattern requires `aria-controls` point at the listbox whether or not it is
    // visible right now. It used to be entirely absent.
    const listbox = ui.container.querySelector<HTMLElement>("[role='listbox']")!;
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox.id).toBeTruthy();
  });

  it("filters as the reader types and points at the first hit", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);

    fireEvent.change(input, { target: { value: "dialogo" } });

    const options = ui.container.querySelectorAll("[role='option']");
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain("Diálogo");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    // Active descendant instead of moving focus: the input keeps it while the list is walked.
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-0");
    expect(options[0].id).toBe("cmd-option-0");
    expect(options[0].getAttribute("aria-selected")).toBe("true");
  });

  it("shows the empty sentence only once a query has failed", () => {
    const ui = render(<CommandPalette emptyLabel="Nada por aquí." id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);
    const empty = ui.container.querySelector<HTMLElement>(".sk-command-palette__empty")!;

    fireEvent.change(input, { target: { value: "zzz" } });

    expect(empty.hidden).toBe(false);
    expect(empty.textContent).toBe("Nada por aquí.");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("labels each option with its own context line", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);

    // A blank query is the whole index, and a space is a blank query.
    fireEvent.change(open(ui), { target: { value: " " } });

    const contexts = Array.from(
      ui.container.querySelectorAll(".sk-command-palette__option-context"),
    ).map((node) => node.textContent);
    // section + group joins with the separator; an explicit context wins over both.
    expect(contexts).toEqual(["Componentes › Acciones", "Componentes", "Fundamentos"]);
    expect(
      ui.container.querySelector("[role='option']")?.getAttribute("data-href"),
    ).toBe("/componentes/boton");
  });

  it("reads the index from a JSON string, the way a usage tree passes it", () => {
    const ui = render(
      <CommandPalette id="cmd" items={JSON.stringify(items)} label="Buscar" open />,
    );

    fireEvent.change(open(ui), { target: { value: "tokens" } });

    expect(ui.container.querySelectorAll("[role='option']")).toHaveLength(1);
    expect(ui.container.querySelector("[role='option']")?.textContent).toContain("Tokens");
  });

  it("walks the listbox from the field, which never gives up focus", () => {
    const ui = render(<CommandPalette id="cmd" items={items} label="Buscar" open />);
    const input = open(ui);

    fireEvent.change(input, { target: { value: " " } });
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-0");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-1");

    fireEvent.keyDown(input, { key: "End" });
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-2");
    // The ends hold rather than wrapping, the same as the enhancer's own clamps.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-2");

    fireEvent.keyDown(input, { key: "Home" });
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-0");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.getAttribute("aria-activedescendant")).toBe("cmd-option-0");

    expect(document.activeElement === input || document.activeElement === document.body).toBe(true);
  });

  it("hands the chosen entry to onSelect, on Enter and on a click alike", () => {
    const chosen: string[] = [];
    const ui = render(
      <CommandPalette
        id="cmd"
        items={items}
        label="Buscar"
        onSelect={(entry) => chosen.push(entry.href ?? "")}
        open
      />,
    );
    const input = open(ui);

    fireEvent.change(input, { target: { value: "dialogo" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(chosen).toEqual(["/componentes/dialogo"]);

    fireEvent.change(input, { target: { value: "tokens" } });
    fireEvent.click(ui.container.querySelector("[role='option']")!);
    expect(chosen).toEqual(["/componentes/dialogo", "/tokens"]);
  });

  it("hands a command to onCommand and the DOM event, never to onSelect", () => {
    const selected: string[] = [];
    const commands: string[] = [];
    const events: string[] = [];
    const ui = render(
      <CommandPalette
        id="cmd"
        items={[...items, { command: "tour", label: "/tour" }]}
        label="Buscar"
        onCommand={(command) => commands.push(command)}
        onSelect={(entry) => selected.push(entry.href ?? "")}
        open
      />,
    );
    ui.container
      .querySelector("dialog")!
      .addEventListener("sk:commandpalettecommand", (event) => events.push((event as CustomEvent).detail.command));
    const input = open(ui);

    fireEvent.change(input, { target: { value: "tour" } });
    expect(ui.container.querySelectorAll("[role='option']")).toHaveLength(0);

    fireEvent.change(input, { target: { value: "/tou" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(commands).toEqual(["tour"]);
    expect(events).toEqual(["tour"]);
    expect(selected).toEqual([]);
  });

  it("activates nothing when a query matched nothing", () => {
    const chosen: string[] = [];
    const ui = render(
      <CommandPalette id="cmd" items={items} label="Buscar" onSelect={(entry) => chosen.push(entry.href ?? "")} open />,
    );
    const input = open(ui);

    fireEvent.change(input, { target: { value: "zzz" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(chosen).toEqual([]);
  });

  it("closes through the dialog form and names itself for the reader", () => {
    const ui = render(
      <CommandPalette
        footer={<span>↵ para abrir</span>}
        id="cmd"
        items={items}
        label="Buscar en la documentación"
        open
      />,
    );

    const dialog = ui.container.querySelector("dialog")!;
    expect(dialog.getAttribute("aria-label")).toBe("Buscar en la documentación");
    expect(dialog.hasAttribute("data-sk-command-palette")).toBe(true);
    expect(dialog.classList.contains("sk-dialog")).toBe(true);
    expect(dialog.classList.contains("sk-command-palette")).toBe(true);

    const close = dialog.querySelector<HTMLButtonElement>(".sk-command-palette__close")!;
    expect(close.getAttribute("aria-label")).toBe("Close");
    expect(close.closest("form")?.getAttribute("method")).toBe("dialog");
    expect(close.getAttribute("value")).toBe("cancel");

    expect(dialog.querySelector(".sk-command-palette__footer")?.textContent).toBe("↵ para abrir");
  });
});

/*
 * DIALOG VAUL, the contract's `vaul` option, ON by default in both bindings.
 *
 * The sheet is CSS (`dialog-vaul.css`) and cannot be seen from jsdom; what is tested is the markup
 * the stylesheet keys on and the drag this binding now owns. The verdict itself ("was that a
 * dismissal?") is `@skryensya/core/vaul-gesture`'s, covered there; these only prove the React shell
 * measures, flags and closes the way the Vanilla one does (vanilla/src/components/vaul.test.ts).
 */
describe("CommandPalette as Dialog Vaul", () => {
  let belowDesktop = true;

  beforeEach(() => {
    belowDesktop = true;
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      get matches() {
        return belowDesktop;
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const sheet = (ui: ReturnType<typeof render>) => {
    const dialog = ui.container.querySelector("dialog")!;
    // jsdom measures everything as 0; a 400px sheet makes the distances below mean something.
    dialog.getBoundingClientRect = () =>
      ({ bottom: 400, height: 400, left: 0, right: 400, top: 0, width: 400 }) as DOMRect;
    return dialog;
  };
  const handleOf = (dialog: HTMLElement) =>
    dialog.querySelector<HTMLElement>(":scope > [data-part='handle']")!;

  it("is a sheet by default, with a grab handle as a direct child", () => {
    const dialog = sheet(render(<CommandPalette id="cmd" items={items} label="Buscar" open />));

    expect(dialog.hasAttribute("data-sk-dialog-vaul")).toBe(true);
    expect(handleOf(dialog)?.getAttribute("aria-hidden")).toBe("true");
  });

  it("stays a centred box when the author opts out", () => {
    const dialog = sheet(render(<CommandPalette id="cmd" items={items} label="Buscar" open vaul={false} />));

    expect(dialog.hasAttribute("data-sk-dialog-vaul")).toBe(false);
    // Still in the markup, the same as the contract template: command-palette.css hides it here.
    expect(handleOf(dialog)).not.toBeNull();
  });

  it("follows the finger and closes past the threshold", () => {
    const dialog = sheet(render(<CommandPalette id="cmd" items={items} label="Buscar" open />));
    const handle = handleOf(dialog);

    fireEvent.pointerDown(handle, { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: 200, pointerId: 1 });

    expect(dialog.dataset.dragging).toBe("");
    expect(dialog.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("200px");
    expect(dialog.style.getPropertyValue("--sk-vaul-drag-progress")).toBe("0.5");

    fireEvent.pointerUp(window, { buttons: 0, clientY: 200, pointerId: 1 });

    expect(dialog.open).toBe(false);
    expect(dialog.dataset.dragging).toBeUndefined();
    expect(dialog.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("");
    expect(dialog.dataset.releasing).toBe("");
  });

  it("does not wire the grab above the desktop breakpoint", () => {
    belowDesktop = false;
    const dialog = sheet(render(<CommandPalette id="cmd" items={items} label="Buscar" open />));

    fireEvent.pointerDown(handleOf(dialog), { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(window, { buttons: 0, clientY: 300, pointerId: 1 });

    expect(dialog.open).toBe(true);
    expect(dialog.dataset.dragging).toBeUndefined();
  });

  it("does not drag at all when the author opts out", () => {
    const dialog = sheet(render(<CommandPalette id="cmd" items={items} label="Buscar" open vaul={false} />));

    fireEvent.pointerDown(handleOf(dialog), { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(window, { buttons: 0, clientY: 300, pointerId: 1 });

    expect(dialog.open).toBe(true);
  });
});
