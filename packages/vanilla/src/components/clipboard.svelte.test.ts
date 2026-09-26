import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountClipboard } from "./clipboard.js";

const faces = `
  <span class="sk-copy-button__icon" data-face="idle" aria-hidden="true"></span>
  <span class="sk-copy-button__icon" data-face="copied" aria-hidden="true"></span>
  <span class="sk-copy-button__label" data-sk-clipboard-status aria-live="polite"></span>
  <span class="sk-copy-button__feedback sk-anchored" data-sk-clipboard-feedback aria-hidden="true">
    <span data-sk-clipboard-feedback-text="copied">Copiado</span>
    <span data-sk-clipboard-feedback-text="error">No se pudo copiar</span>
  </span>`;

const copyButton = (attrs: string) =>
  `<button class="sk-copy-button sk-button" data-sk-clipboard data-sk-clipboard-trigger type="button" aria-label="Copiar" ${attrs}>${faces}</button>`;

const settle = async () => {
  flushSync();
  await Promise.resolve();
  await Promise.resolve();
  flushSync();
};

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  expect(mountClipboard(document)).toBe(1);
  return document.querySelector<HTMLElement>("[data-sk-clipboard]")!;
}

describe("Clipboard (@zag-js/clipboard), vanilla", () => {
  it("copies its value, then shows, says and flags that it did", async () => {
    const button = mount(copyButton('value="pnpm add @skryensya/core"'));
    const events: string[] = [];
    button.addEventListener("sk:clipboardstatuschange", (event) => events.push((event as CustomEvent).detail.status));

    fireEvent.click(button);
    await settle();

    expect(writeText).toHaveBeenCalledWith("pnpm add @skryensya/core");
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(button.hasAttribute("data-error")).toBe(false);
    expect(button.getAttribute("aria-label")).toBe("Copiado");
    expect(button.querySelector("[data-sk-clipboard-status]")!.textContent).toBe("Copiado");
    expect(button.querySelector("[data-sk-clipboard-feedback]")!.getAttribute("data-state")).toBe("open");
    expect(events).toEqual(["copied"]);
  });

  it("reads a target's text at the moment of the click, not at mount", async () => {
    document.body.innerHTML = "";
    const button = mount(`<pre id="snippet">antes</pre>${copyButton('data-target="snippet"')}`);
    document.getElementById("snippet")!.textContent = "después";

    fireEvent.click(button);
    await settle();

    expect(writeText).toHaveBeenCalledWith("después");
  });

  it("says the write failed instead of claiming it copied", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
    const button = mount(copyButton('value="secreto"'));
    const events: string[] = [];
    button.addEventListener("sk:clipboardstatuschange", (event) => events.push((event as CustomEvent).detail.status));

    fireEvent.click(button);
    await settle();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await settle();

    expect(button.hasAttribute("data-error")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("No se pudo copiar");
    expect(button.querySelector("[data-sk-clipboard-status]")!.textContent).toBe("No se pudo copiar");
    expect(events).toEqual(["copied", "error"]);
  });

  it("wires the field: its label names it, and the button copies what it shows", async () => {
    const root = mount(`
      <div class="sk-clipboard" data-sk-clipboard>
        <label class="sk-clipboard__label">Enlace</label>
        <div class="sk-clipboard__control">
          <input class="sk-clipboard__input sk-input" data-sk-clipboard-input type="text" readonly value="https://example.com/s/1" />
          ${copyButton("").replace(" data-sk-clipboard ", " ")}
        </div>
      </div>`);
    await settle();
    const input = root.querySelector<HTMLInputElement>("input")!;
    const label = root.querySelector("label")!;

    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.readOnly).toBe(true);

    fireEvent.click(root.querySelector("button")!);
    await settle();

    expect(writeText).toHaveBeenCalledWith("https://example.com/s/1");
    expect(root.hasAttribute("data-copied")).toBe(true);
  });
});
