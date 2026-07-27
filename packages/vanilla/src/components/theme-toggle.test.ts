import { themeToggleAttrs, themeToggleEvents } from "@skryensya/core/theme-toggle";
import { afterEach, describe, expect, it } from "vitest";
import { mountThemeToggle } from "./theme-toggle.js";

function mount() {
  document.body.innerHTML = `<button
      class="sk-button sk-interactive sk-theme-toggle"
      data-sk-theme-toggle
      data-variant="ghost"
      data-icon-only
      type="button"
      aria-label="Color mode: system"
      data-sk-theme-toggle-label-system="Color mode: system"
      data-sk-theme-toggle-label-light="Color mode: light"
      data-sk-theme-toggle-label-dark="Color mode: dark"
    >
      <span data-sk-theme-toggle-icon="system"></span>
      <span data-sk-theme-toggle-icon="light"></span>
      <span data-sk-theme-toggle-icon="dark"></span>
    </button>`;
  const root = document.querySelector<HTMLButtonElement>(`[${themeToggleAttrs.root}]`);
  if (!root) throw new Error("Expected ThemeToggle root.");
  return root;
}

afterEach(() => {
  document.documentElement.removeAttribute("data-scheme");
  document.documentElement.style.colorScheme = "";
  document.body.innerHTML = "";
});

describe("ThemeToggle Vanilla contracts", () => {
  it("mounts once and cycles system → light → dark on click", () => {
    const root = mount();
    expect(mountThemeToggle(document)).toBe(1);
    expect(mountThemeToggle(document)).toBe(0);

    root.click();
    expect(document.documentElement.getAttribute("data-scheme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(root.getAttribute("data-scheme")).toBe("light");
    expect(root.getAttribute("aria-label")).toBe("Color mode: light");

    root.click();
    expect(document.documentElement.getAttribute("data-scheme")).toBe("dark");

    root.click();
    expect(document.documentElement.getAttribute("data-scheme")).toBe("system");
    expect(document.documentElement.style.colorScheme).toBe("light dark");
  });

  it("dispatches sk-theme-toggle-change with the new mode", () => {
    const root = mount();
    mountThemeToggle(root);
    let seen: string | undefined;
    root.addEventListener(themeToggleEvents.change, ((event: CustomEvent<{ value: string }>) => {
      seen = event.detail.value;
    }) as EventListener);

    root.click();
    expect(seen).toBe("light");
  });

  it("keeps every ThemeToggle in sync when one cycles", () => {
    document.body.innerHTML = `<button
      class="sk-button sk-interactive sk-theme-toggle"
      data-sk-theme-toggle
      data-variant="ghost"
      data-icon-only
      type="button"
      aria-label="Color mode: system"
      data-sk-theme-toggle-label-system="Color mode: system"
      data-sk-theme-toggle-label-light="Color mode: light"
      data-sk-theme-toggle-label-dark="Color mode: dark"
    >
      <span data-sk-theme-toggle-icon="system"></span>
      <span data-sk-theme-toggle-icon="light"></span>
      <span data-sk-theme-toggle-icon="dark"></span>
    </button>
    <button
      class="sk-button sk-interactive sk-theme-toggle"
      data-sk-theme-toggle
      data-variant="ghost"
      data-icon-only
      type="button"
      aria-label="Color mode: system"
      data-sk-theme-toggle-label-system="Color mode: system"
      data-sk-theme-toggle-label-light="Color mode: light"
      data-sk-theme-toggle-label-dark="Color mode: dark"
    >
      <span data-sk-theme-toggle-icon="system"></span>
      <span data-sk-theme-toggle-icon="light"></span>
      <span data-sk-theme-toggle-icon="dark"></span>
    </button>`;
    const [first, second] = Array.from(
      document.querySelectorAll<HTMLButtonElement>(`[${themeToggleAttrs.root}]`),
    );
    expect(mountThemeToggle(document)).toBe(2);

    first!.click();
    expect(document.documentElement.getAttribute("data-scheme")).toBe("light");
    expect(first!.getAttribute("data-scheme")).toBe("light");
    expect(second!.getAttribute("data-scheme")).toBe("light");
    expect(second!.getAttribute("aria-label")).toBe("Color mode: light");

    second!.click();
    expect(document.documentElement.getAttribute("data-scheme")).toBe("dark");
    expect(first!.getAttribute("data-scheme")).toBe("dark");
    expect(second!.getAttribute("data-scheme")).toBe("dark");
  });
});
