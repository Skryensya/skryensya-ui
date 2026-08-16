import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button.js";

/** jsdom ships no clipboard, so each test says explicitly which of the two paths it is on. */
function stubClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

function renderWithSource(ui: React.ReactElement, text = "pnpm add @skryensya/react") {
  const source = document.createElement("pre");
  source.id = "snippet";
  source.textContent = text;
  document.body.append(source);
  return { source, ...render(ui) };
}

afterEach(() => {
  document.getElementById("snippet")?.remove();
  stubClipboard();
  vi.useRealTimers();
});

describe("CopyButton", () => {
  it("copies whatever the target holds at click time", async () => {
    const writeText = vi.fn(async () => {});
    stubClipboard(writeText);
    const ui = renderWithSource(<CopyButton target="snippet" />);

    // The target is an id and not a string on purpose: what gets copied is what is on screen now.
    ui.source.textContent = "pnpm add @skryensya/vanilla";
    fireEvent.click(ui.getByRole("button", { name: "Copiar" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("pnpm add @skryensya/vanilla"));
  });

  it("announces the copy once and shows the flag", async () => {
    stubClipboard(async () => {});
    const ui = renderWithSource(<CopyButton target="snippet" />);
    const button = ui.getByRole("button", { name: "Copiar" });

    fireEvent.click(button);

    await waitFor(() => expect(button.getAttribute("data-sk-copy-button-state")).toBe("copied"));
    expect(button.getAttribute("aria-label")).toBe("Copiado");
    expect(button.querySelector("[data-sk-copy-button-label]")?.textContent).toBe("Copiado");

    // The flag is the visible half of the same sentence, hidden from the reader that hears the label.
    const flag = button.querySelector<HTMLElement>("[data-sk-copy-button-feedback]")!;
    expect(flag.getAttribute("data-state")).toBe("open");
    expect(flag.getAttribute("aria-hidden")).toBe("true");
  });

  it("falls back to an error when the target is not on the page", async () => {
    const writeText = vi.fn(async () => {});
    stubClipboard(writeText);
    const ui = render(<CopyButton target="missing" />);
    const button = ui.getByRole("button", { name: "Copiar" });

    fireEvent.click(button);

    await waitFor(() => expect(button.getAttribute("data-sk-copy-button-state")).toBe("error"));
    expect(writeText).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-label")).toBe("No se pudo copiar");
  });

  it("reports the error when a rejected clipboard has no fallback under it", async () => {
    stubClipboard(async () => {
      throw new Error("denied");
    });
    const ui = renderWithSource(<CopyButton errorLabel="Bloqueado" target="snippet" />);
    const button = ui.getByRole("button", { name: "Copiar" });

    // No `document.execCommand` in jsdom, so the pre-clipboard path fails too and the button says so.
    fireEvent.click(button);

    await waitFor(() => expect(button.getAttribute("data-sk-copy-button-state")).toBe("error"));
    expect(button.querySelector("[data-sk-copy-button-label]")?.textContent).toBe("Bloqueado");
  });

  it("returns to idle when the feedback window closes", async () => {
    vi.useFakeTimers();
    stubClipboard(async () => {});
    const ui = renderWithSource(<CopyButton target="snippet" />);
    const button = ui.getByRole("button", { name: "Copiar" });

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button.getAttribute("data-sk-copy-button-state")).toBe("copied");

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    // Absence is what idle means here, the same as a button the enhancer has not reached.
    expect(button.hasAttribute("data-sk-copy-button-state")).toBe(false);
    expect(button.querySelector("[data-sk-copy-button-label]")?.textContent).toBe("Copiar");
    expect(button.querySelector("[data-sk-copy-button-feedback]")?.hasAttribute("data-state")).toBe(false);
  });

  it("resolves the contract's paint defaults instead of leaving them absent", () => {
    const ui = render(<CopyButton target="snippet" />);
    const button = ui.getByRole("button", { name: "Copiar" });

    expect(button.getAttribute("type")).toBe("button");
    expect(button.classList.contains("sk-copy-button")).toBe(true);
    expect(button.classList.contains("sk-icon-toggle")).toBe(true);
    expect(button.classList.contains("sk-button")).toBe(true);
    expect(button.classList.contains("sk-interactive")).toBe(true);
    expect(button.getAttribute("data-size")).toBe("md");
    expect(button.getAttribute("data-variant")).toBe("neutral");
    expect(button.hasAttribute("data-icon-only")).toBe(false);
    expect(button.getAttribute("data-sk-copy-button-target")).toBe("snippet");

    // Both faces ship and Icon Toggle reveals one: authored markup has no runtime to swap them.
    expect(button.querySelector('[data-face="idle"][data-sk-copy-button-icon="idle"] svg')).toBeTruthy();
    expect(button.querySelector('[data-face="copied"][data-sk-copy-button-icon="copied"] svg')).toBeTruthy();
  });

  it("wires the flag through the Anclaje pattern's classes", () => {
    const ui = render(<CopyButton target="snippet" />);
    const button = ui.getByRole("button", { name: "Copiar" });

    // The classes are unconditional: `patterns/anchored.css` is correct with or without the API,
    // only the per-instance names are a browser question, and jsdom answers no to that one.
    expect(button.classList.contains("sk-anchor")).toBe(true);
    const flag = button.querySelector<HTMLElement>("[data-sk-copy-button-feedback]")!;
    expect(flag.classList.contains("sk-copy-button__feedback")).toBe(true);
    expect(flag.classList.contains("sk-anchored")).toBe(true);
    expect(flag.getAttribute("data-sk-placement")).toBe("inline-start");
    expect(flag.querySelector(".sk-anchored-arrow")).toBeTruthy();
  });
});
