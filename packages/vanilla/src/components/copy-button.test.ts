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
    ><span data-sk-copy-button-label>Copiar</span><span
      class="sk-copy-button__feedback sk-anchored"
      data-sk-copy-button-feedback
      data-sk-placement="inline-start"
      aria-hidden="true"
    ><span data-sk-copy-button-feedback-text="copied">Copiado</span><span
      data-sk-copy-button-feedback-text="error">Error</span><span class="sk-anchored-arrow"></span></span></button>
  `;
  const root = document.querySelector<HTMLButtonElement>("[data-sk-copy-button]");
  if (!root) throw new Error("Expected CopyButton root.");
  return root;
}

/** Runs `body` as if the browser had CSS Anchor Positioning, which jsdom does not. */
function withAnchorPositioning(body: () => void): void {
  const previous = CSS.supports;
  CSS.supports = ((property: string) => property.startsWith("anchor-name")) as typeof CSS.supports;
  try {
    body();
  } finally {
    CSS.supports = previous;
  }
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
    const flag = root.querySelector<HTMLElement>("[data-sk-copy-button-feedback]");

    expect(mountCopyButton(document)).toBe(1);
    expect(mountCopyButton(document)).toBe(0);
    root.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("pnpm add @skryensya/core");
    expect(root.getAttribute("data-sk-copy-button-state")).toBe("copied");
    expect(root.getAttribute("aria-label")).toBe("Código copiado");
    expect(label?.textContent).toBe("Copiado");
    /* The Anclaje pattern's own word for open; the stylesheet reads no other. */
    expect(flag?.getAttribute("data-state")).toBe("open");

    vi.advanceTimersByTime(1_800);
    expect(root.hasAttribute("data-sk-copy-button-state")).toBe(false);
    expect(root.getAttribute("aria-label")).toBe("Copiar código");
    expect(label?.textContent).toBe("Copiar");
    /* REMOVED, not set to "closed": the pattern reads an absent state as closed, which is how
       un-mounted markup and a settled button end up looking the same. */
    expect(flag?.hasAttribute("data-state")).toBe(false);
  });

  it("names the anchor tying one button to its own flag", () => {
    /* Stubbed rather than assumed: jsdom has no `CSS.supports` at all, so the enhancer would take
       its no-anchor-positioning path and write nothing, which is the case below. */
    withAnchorPositioning(() => {
      const root = button();
      const flag = root.querySelector<HTMLElement>("[data-sk-copy-button-feedback]");

      mountCopyButton(root);

      /* Written on BOTH, which is what the browser needs to place one against the other, and unique
         per instance: a page of docs holds a copy button per code block. */
      const name = root.style.getPropertyValue("--sk-anchored-name");
      expect(name).toMatch(/^--sk-anchor-/);
      expect(flag?.style.getPropertyValue("--sk-anchored-name")).toBe(name);
      /* The box's own name, which its arrow measures to flip on the same threshold. */
      expect(flag?.style.getPropertyValue("--sk-anchored-box-name")).toBe(`${name}-box`);
    });
  });

  it("names no anchor where the browser cannot place one", () => {
    /* A missing target, so the outcome is painted synchronously and the assertion needs no await:
       what is being read here is the anchor wiring, not the clipboard. */
    const root = button("missing");
    const flag = root.querySelector<HTMLElement>("[data-sk-copy-button-feedback]");

    mountCopyButton(root);
    root.click();

    /* There is no machine here to position the flag instead, so the stylesheet chooses not to draw
       it rather than to draw it in the wrong place. Everything else still works: the state lands on
       the root, the icon swaps and the live region announces. */
    expect(root.style.getPropertyValue("--sk-anchored-name")).toBe("");
    expect(flag?.style.getPropertyValue("--sk-anchored-name")).toBe("");
    expect(root.getAttribute("data-sk-copy-button-state")).toBe("error");
  });

  it("reports an authored target that does not exist", () => {
    const root = button("missing");
    const label = root.querySelector<HTMLElement>("[data-sk-copy-button-label]");
    const flag = root.querySelector<HTMLElement>("[data-sk-copy-button-feedback]");

    mountCopyButton(root);
    root.click();

    expect(root.getAttribute("data-sk-copy-button-state")).toBe("error");
    expect(root.getAttribute("aria-label")).toBe("No se pudo copiar");
    expect(label?.textContent).toBe("Error");
    /* One "open" for both outcomes. WHICH sentence the flag shows is the stylesheet's job, off the
       state attribute already on the root, so the enhancer never picks between them. */
    expect(flag?.getAttribute("data-state")).toBe("open");
  });
});
