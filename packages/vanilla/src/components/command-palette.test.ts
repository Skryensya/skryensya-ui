import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectCommandPalette, mountCommandPalette } from "./command-palette.js";

const entries = [
  { href: "/componentes/boton", label: "Botón", section: "Componentes", group: "Acciones" },
  { href: "/componentes/dialogo", label: "Diálogo", section: "Componentes" },
  { href: "/tokens", label: "Tokens", context: "Fundamentos" },
];

/*
 * The palette's list is EMPTY in the markup and the enhancer fills it from `open()`. That is the
 * fact the React binding was written to match, so both halves agree about the state every reader
 * sees first: a combobox that does not claim an expanded popup over nothing.
 */
function markup({ root = "", index = entries, hint = "" } = {}) {
  document.body.innerHTML = `
    <button data-sk-command-palette-open aria-controls="cmd" type="button">Buscar</button>
    <script id="cmd-index" type="application/json">${JSON.stringify(index)}</script>
    <dialog class="sk-command-palette" data-sk-command-palette data-sk-command-palette-index="cmd-index" id="cmd" ${root}>
      <div class="sk-command-palette__search">
        <input class="sk-command-palette__input" data-sk-command-palette-input role="combobox" type="text" />
        ${hint}
      </div>
      <ul class="sk-command-palette__list" data-sk-command-palette-list role="listbox"></ul>
      <p class="sk-command-palette__empty" data-sk-command-palette-empty hidden>Sin resultados.</p>
    </dialog>`;
  return document.querySelector<HTMLDialogElement>("dialog")!;
}

const input = () => document.querySelector<HTMLInputElement>("[data-sk-command-palette-input]")!;
const trigger = () => document.querySelector<HTMLElement>("[data-sk-command-palette-open]")!;
const options = () =>
  Array.from(document.querySelectorAll<HTMLElement>(".sk-command-palette__option"));
const selected = () =>
  options().findIndex((option) => option.getAttribute("aria-selected") === "true");

let assign: ReturnType<typeof vi.fn>;

beforeEach(() => {
  assign = vi.fn();
  // jsdom refuses to navigate, and the palette's whole job at the end is to navigate.
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { assign, href: "http://localhost/" },
  });
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("CommandPalette Vanilla contracts", () => {
  it("requires the platform's dialog and the authored parts", () => {
    document.body.innerHTML = `<div data-sk-command-palette></div>`;
    expect(() =>
      connectCommandPalette(document.querySelector<HTMLElement>("[data-sk-command-palette]")!),
    ).toThrow(/must be a <dialog>/);

    document.body.innerHTML = `<dialog data-sk-command-palette></dialog>`;
    expect(() => connectCommandPalette(document.querySelector<HTMLElement>("dialog")!)).toThrow(
      /authored input and list/,
    );
  });

  it("opens from its trigger and fills the list only then", () => {
    const root = markup();
    expect(mountCommandPalette(document)).toBe(1);
    expect(mountCommandPalette(document)).toBe(0);

    expect(options()).toHaveLength(0);

    fireEvent.click(trigger());

    expect(root.open).toBe(true);
    expect(options()).toHaveLength(3);
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    // The combobox itself, not just the external trigger: `input` carries `role="combobox"`, so
    // it is what a screen reader questions about expansion — it used to stay stuck at "false".
    expect(input().getAttribute("aria-expanded")).toBe("true");
    // The first hit is pointed at, not focused: the input keeps focus while the list is walked.
    expect(input().getAttribute("aria-activedescendant")).toBe("cmd-option-0");
    expect(selected()).toBe(0);
  });

  it("filters as the reader types, and says when nothing matched", () => {
    markup();
    mountCommandPalette(document);
    fireEvent.click(trigger());
    const empty = document.querySelector<HTMLElement>("[data-sk-command-palette-empty]")!;

    fireEvent.input(input(), { target: { value: "dialogo" } });

    expect(options().map((option) => option.textContent)).toEqual(["DiálogoComponentes"]);
    expect(empty.hidden).toBe(true);

    fireEvent.input(input(), { target: { value: "zzz" } });

    expect(options()).toHaveLength(0);
    expect(empty.hidden).toBe(false);
    expect(input().hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("gives each option the context line the entry asked for", () => {
    markup();
    mountCommandPalette(document);
    fireEvent.click(trigger());

    const contexts = Array.from(
      document.querySelectorAll(".sk-command-palette__option-context"),
    ).map((node) => node.textContent);
    // section + group joins with the separator; an explicit context wins over both.
    expect(contexts).toEqual(["Componentes › Acciones", "Componentes", "Fundamentos"]);
    expect(options()[0].dataset.href).toBe("/componentes/boton");
  });

  it("walks the list with the keyboard and stops at both ends", () => {
    markup();
    mountCommandPalette(document);
    fireEvent.click(trigger());

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(selected()).toBe(1);
    expect(input().getAttribute("aria-activedescendant")).toBe("cmd-option-1");

    fireEvent.keyDown(input(), { key: "End" });
    expect(selected()).toBe(2);
    // The end is the end: a listbox over a filtered index does not wrap round.
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(selected()).toBe(2);

    fireEvent.keyDown(input(), { key: "Home" });
    expect(selected()).toBe(0);
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    expect(selected()).toBe(0);
  });

  it("goes where Enter and a click point", () => {
    markup();
    mountCommandPalette(document);
    fireEvent.click(trigger());

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(assign).toHaveBeenCalledWith("/componentes/dialogo");

    // A click anywhere inside the option counts, not only on the row itself.
    fireEvent.click(options()[2].querySelector(".sk-command-palette__option-label")!);
    expect(assign).toHaveBeenLastCalledWith("/tokens");
  });

  it("dismisses on the backdrop and drops the trigger's claim", () => {
    const root = markup();
    mountCommandPalette(document);
    fireEvent.click(trigger());

    fireEvent.click(root);

    expect(root.open).toBe(false);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("starts each opening from a clean query", () => {
    markup();
    mountCommandPalette(document);
    fireEvent.click(trigger());
    fireEvent.input(input(), { target: { value: "zzz" } });

    fireEvent.click(document.querySelector("dialog")!);
    fireEvent.click(trigger());

    expect(input().value).toBe("");
    expect(options()).toHaveLength(3);
  });

  it("survives an index that is missing or not JSON", () => {
    markup({ index: [] });
    document.getElementById("cmd-index")!.textContent = "{not json";
    mountCommandPalette(document);

    fireEvent.click(trigger());

    // A broken index is an empty palette, not a thrown error on page load.
    expect(options()).toHaveLength(0);
  });

  it("binds a hotkey only when the markup opts in, and badges it", () => {
    const root = markup({
      hint: '<kbd data-sk-command-palette-hint>⌘K</kbd><kbd data-sk-command-palette-hint>Esc</kbd>',
      root: 'data-sk-command-palette-hotkey="mod+k"',
    });
    mountCommandPalette(document);

    const [hotkeyHint, escHint] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sk-command-palette-hint]"),
    );
    expect(hotkeyHint.textContent).toBeTruthy();
    // Esc is the platform's, not this palette's, so the badge filler leaves it alone.
    expect(escHint.textContent).toBe("Esc");

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(root.open).toBe(true);
  });

  it("leaves the hotkey alone when nothing asked for one", () => {
    const root = markup();
    mountCommandPalette(document);

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    // A docs demo must not steal ⌘K from the site chrome's own palette.
    expect(root.open).toBe(false);
  });

  it("unbinds everything it wired", () => {
    const root = markup();
    const dispose = connectCommandPalette(root);

    dispose();
    fireEvent.click(trigger());

    expect(root.open).toBe(false);
  });
});
