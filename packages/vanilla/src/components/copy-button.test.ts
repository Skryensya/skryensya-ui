import { afterEach, describe, expect, it, vi } from "vitest";
import { mountCopyButton } from "./copy-button.js";

function button(target = "source"): HTMLButtonElement {
  document.body.innerHTML = `
    <code id="source">pnpm add @skryensya/core</code>
    <button
      data-sk-copy-button
      data-sk-copy-button-target="${target}"
      data-sk-copy-button-success-label="Copiado"
      data-sk-copy-button-error-label="Error"
      data-sk-copy-button-success-aria-label="Código copiado"
      data-sk-copy-button-error-aria-label="No se pudo copiar"
      aria-label="Copiar código"
    ><span data-sk-copy-button-label>Copiar</span></button>
  `;
  const root = document.querySelector<HTMLButtonElement>("[data-sk-copy-button]");
  if (!root) throw new Error("Expected CopyButton root.");
  return root;
}

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
});

describe("CopyButton Vanilla contracts", () => {
  it("copies its authored target, announces success and resets", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const root = button();
    const label = root.querySelector<HTMLElement>("[data-sk-copy-button-label]");

    expect(mountCopyButton(document)).toBe(1);
    expect(mountCopyButton(document)).toBe(0);
    root.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("pnpm add @skryensya/core");
    expect(root.getAttribute("data-sk-copy-button-state")).toBe("copied");
    expect(root.getAttribute("aria-label")).toBe("Código copiado");
    expect(label?.textContent).toBe("Copiado");

    vi.advanceTimersByTime(1_800);
    expect(root.hasAttribute("data-sk-copy-button-state")).toBe(false);
    expect(root.getAttribute("aria-label")).toBe("Copiar código");
    expect(label?.textContent).toBe("Copiar");
  });

  it("reports an authored target that does not exist", () => {
    const root = button("missing");
    const label = root.querySelector<HTMLElement>("[data-sk-copy-button-label]");

    mountCopyButton(root);
    root.click();

    expect(root.getAttribute("data-sk-copy-button-state")).toBe("error");
    expect(root.getAttribute("aria-label")).toBe("No se pudo copiar");
    expect(label?.textContent).toBe("Error");
  });
});
