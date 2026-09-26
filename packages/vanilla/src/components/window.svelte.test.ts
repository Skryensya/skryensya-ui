import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountWindow } from "./window.js";

/*
 * The enhancer renders nothing: it scans the authored parts and patches Zag's props onto them. The
 * markup below is what the contract's template emits, trimmed of the icon spans.
 */
function markup(root = "") {
  const stage = (value: string, label: string) =>
    `<button class="sk-window__stage sk-button sk-interactive" data-sk-window-stage type="button" data-stage="${value}" aria-label="${label}"></button>`;
  const handles = ["n", "e", "s", "w", "ne", "se", "sw", "nw"]
    .map((axis) => `<div class="sk-window__resize" data-sk-window-resize data-axis="${axis}"></div>`)
    .join("");
  document.body.innerHTML = `<div class="sk-window" data-sk-window ${root}>
    <button class="sk-window__trigger sk-button sk-interactive" data-sk-window-trigger type="button">Abrir</button>
    <div class="sk-window__positioner" data-sk-window-positioner>
      <div class="sk-window__content" data-sk-window-content>
        <div class="sk-window__drag" data-sk-window-drag>
          <div class="sk-window__header" data-sk-window-header>
            <h2 class="sk-window__title" data-sk-window-title>Inspector</h2>
            <div class="sk-window__controls" data-sk-window-controls>
              ${stage("minimized", "Minimizar")}${stage("maximized", "Maximizar")}${stage("default", "Restaurar")}
              <button class="sk-window__close sk-button sk-interactive" data-sk-window-close type="button" aria-label="Cerrar"></button>
            </div>
          </div>
        </div>
        <div class="sk-window__body" data-sk-window-body><p>Cuerpo</p></div>
        ${handles}
      </div>
    </div>
  </div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-window]")!;
  expect(mountWindow(document)).toBe(1);
  return element;
}

const part = (name: string) => document.querySelector<HTMLElement>(`[data-sk-window-${name}]`)!;
const stageControl = (stage: string) =>
  document.querySelector<HTMLElement>(`[data-sk-window-stage][data-stage="${stage}"]`)!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Window Vanilla contracts", () => {
  it("mounts on the attribute it scans for, and only once", () => {
    markup();
    expect(document.querySelector("[data-sk-window-ready]")).toBeTruthy();
    expect(mountWindow(document)).toBe(0);
  });

  it("opens from its trigger as a non-modal dialog named by its title", async () => {
    markup();
    expect(part("content").hidden).toBe(true);

    fireEvent.click(part("trigger"));

    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("open"));
    expect(part("content").getAttribute("role")).toBe("dialog");
    expect(part("content").hasAttribute("aria-modal")).toBe(false);
    expect(part("content").getAttribute("aria-labelledby")).toBe(part("title").id);
  });

  it("keeps the authored labels over Zag's English", async () => {
    markup("data-default-open");
    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("open"));

    expect(part("close").getAttribute("aria-label")).toBe("Cerrar");
    expect(stageControl("minimized").getAttribute("aria-label")).toBe("Minimizar");
    expect(stageControl("default").getAttribute("aria-label")).toBe("Restaurar");
  });

  it("closes from its close control and announces it", async () => {
    const root = markup("data-default-open");
    const onOpenChange = vi.fn();
    root.addEventListener("sk:windowopenchange", onOpenChange);
    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("open"));

    fireEvent.click(part("close"));

    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("closed"));
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ detail: { open: false } }));
  });

  it("maximizes and swaps its stage controls", async () => {
    const root = markup("data-default-open");
    const onStageChange = vi.fn();
    root.addEventListener("sk:windowstagechange", onStageChange);
    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("open"));
    expect(stageControl("default").hidden).toBe(true);

    fireEvent.click(stageControl("maximized"));

    await waitFor(() => expect(part("content").hasAttribute("data-maximized")).toBe(true));
    expect(stageControl("default").hidden).toBe(false);
    expect(stageControl("maximized").hidden).toBe(true);
    expect(onStageChange).toHaveBeenCalledWith(expect.objectContaining({ detail: { stage: "maximized" } }));
  });

  it("hides the stage controls and disables the handles when it cannot be resized", async () => {
    markup('data-default-open data-resizable="false"');
    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("open"));

    expect(stageControl("minimized").hidden).toBe(true);
    expect(stageControl("maximized").hidden).toBe(true);
    for (const handle of document.querySelectorAll("[data-sk-window-resize]")) {
      expect(handle.hasAttribute("data-disabled")).toBe(true);
    }
  });

  it("reads its opening size from the root", async () => {
    markup('data-default-open data-default-width="480" data-default-height="300"');
    await waitFor(() => expect(part("content").getAttribute("data-state")).toBe("open"));

    await waitFor(() => expect(part("positioner").style.getPropertyValue("--width")).toBe("480px"));
    expect(part("positioner").style.getPropertyValue("--height")).toBe("300px");
    // The layer is the stylesheet's; only the stack order survives.
    expect(part("positioner").style.zIndex).toBe("");
  });
});
