import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Window } from "./window.js";

describe("Window", () => {
  it("opens from its trigger as a non-modal dialog named by its title", async () => {
    const ui = render(
      <Window title="Inspector" trigger="Open inspector">
        <p>Body</p>
      </Window>,
    );

    expect(ui.queryByRole("dialog")).toBeNull();
    fireEvent.click(ui.getByRole("button", { name: "Open inspector" }));

    const dialog = await ui.findByRole("dialog", { name: "Inspector" });
    // Non-modal on purpose: the page beside it stays usable, and nothing may claim otherwise.
    expect(dialog.hasAttribute("aria-modal")).toBe(false);
    expect(dialog.getAttribute("data-state")).toBe("open");
  });

  it("names its controls with the labels it is given, not Zag's English", async () => {
    const ui = render(
      <Window
        closeLabel="Cerrar"
        defaultOpen
        maximizeLabel="Maximizar"
        minimizeLabel="Minimizar"
        restoreLabel="Restaurar"
        title="Ventana"
        trigger="Abrir"
      >
        <p>Cuerpo</p>
      </Window>,
    );

    await ui.findByRole("dialog");
    expect(ui.getByRole("button", { name: "Cerrar" })).toBeTruthy();
    expect(ui.getByRole("button", { name: "Minimizar" })).toBeTruthy();
    expect(ui.getByRole("button", { name: "Maximizar" })).toBeTruthy();
    expect(ui.queryByRole("button", { name: "Close Window" })).toBeNull();
  });

  it("closes from its close control and reports it on the root", async () => {
    const onOpenChange = vi.fn();
    const ui = render(
      <Window defaultOpen onOpenChange={onOpenChange} title="Inspector" trigger="Open">
        <p>Body</p>
      </Window>,
    );
    const root = ui.container.querySelector(".sk-window")!;
    const seen: boolean[] = [];
    root.addEventListener("sk:windowopenchange", ((event: CustomEvent<{ open: boolean }>) => {
      seen.push(event.detail.open);
    }) as EventListener);

    await ui.findByRole("dialog");
    fireEvent.click(ui.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(ui.queryByRole("dialog")).toBeNull());
    expect(onOpenChange).toHaveBeenCalledWith({ open: false });
    expect(seen).toEqual([false]);
  });

  it("maximizes, swaps to a restore control, and reports the stage", async () => {
    const onStageChange = vi.fn();
    const ui = render(
      <Window defaultOpen onStageChange={onStageChange} title="Inspector" trigger="Open">
        <p>Body</p>
      </Window>,
    );

    const dialog = await ui.findByRole("dialog");
    // By its stage, not its name: a `hidden` element has no accessible name to query by.
    const stage = (value: string) =>
      document.querySelector<HTMLButtonElement>(`.sk-window__stage[data-stage="${value}"]`)!;
    const restore = stage("default");
    expect(restore.getAttribute("aria-label")).toBe("Restore");
    expect(restore.hidden).toBe(true);

    fireEvent.click(ui.getByRole("button", { name: "Maximize" }));

    await waitFor(() => expect(dialog.hasAttribute("data-maximized")).toBe(true));
    expect(onStageChange).toHaveBeenCalledWith({ stage: "maximized" });
    expect(restore.hidden).toBe(false);
    expect(stage("maximized").hidden).toBe(true);
  });

  it("hides the stage controls when it cannot be resized", async () => {
    const ui = render(
      <Window defaultOpen resizable={false} title="Inspector" trigger="Open">
        <p>Body</p>
      </Window>,
    );

    await ui.findByRole("dialog");
    expect(ui.queryByRole("button", { name: "Minimize" })).toBeNull();
    expect(ui.queryByRole("button", { name: "Maximize" })).toBeNull();
    for (const handle of document.querySelectorAll(".sk-window__resize")) {
      expect(handle.hasAttribute("data-disabled")).toBe(true);
    }
  });

  it("leaves the layer to the stylesheet and keeps the stack order", async () => {
    const ui = render(
      <Window defaultOpen title="Inspector" trigger="Open">
        <p>Body</p>
      </Window>,
    );

    await ui.findByRole("dialog");
    const positioner = document.querySelector<HTMLElement>(".sk-window__positioner")!;
    expect(positioner.style.zIndex).toBe("");
    expect(positioner.style.getPropertyValue("--z-index")).not.toBe("");
  });
});
