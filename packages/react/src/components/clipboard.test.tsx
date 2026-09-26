import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Clipboard, CopyButton, type ClipboardStatus } from "./clipboard.js";

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

const settle = () => act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
});

describe("CopyButton", () => {
  it("copies its value and reports it, on the prop and the DOM alike", async () => {
    const statuses: ClipboardStatus[] = [];
    const events: string[] = [];
    const ui = render(
      <CopyButton copiedLabel="Copiado" label="Copiar comando" onStatusChange={(s) => statuses.push(s)} value="pnpm i" />,
    );
    const button = ui.getByRole("button");
    button.addEventListener("sk:clipboardstatuschange", (event) => events.push((event as CustomEvent).detail.status));
    expect(button.getAttribute("aria-label")).toBe("Copiar comando");

    fireEvent.click(button);
    await settle();

    expect(writeText).toHaveBeenCalledWith("pnpm i");
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("Copiado");
    expect(button.querySelector(".sk-copy-button__feedback")?.getAttribute("data-state")).toBe("open");
    expect(statuses).toEqual(["copied"]);
    expect(events).toEqual(["copied"]);
  });

  it("reads a target's text at the moment of the click", async () => {
    const ui = render(
      <>
        <pre id="snippet">antes</pre>
        <CopyButton label="Copiar" target="snippet" />
      </>,
    );
    ui.container.querySelector("#snippet")!.textContent = "después";

    fireEvent.click(ui.getByRole("button"));
    await settle();

    expect(writeText).toHaveBeenCalledWith("después");
  });

  it("says the write failed instead of claiming it copied", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
    const statuses: ClipboardStatus[] = [];
    const ui = render(
      <CopyButton errorLabel="No se pudo copiar" label="Copiar" onStatusChange={(s) => statuses.push(s)} value="x" />,
    );
    const button = ui.getByRole("button");

    fireEvent.click(button);
    await settle();

    expect(button.hasAttribute("data-error")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("No se pudo copiar");
    expect(statuses).toEqual(["copied", "error"]);
  });
});

describe("Clipboard", () => {
  it("names the field with its label and copies what it shows", async () => {
    const ui = render(<Clipboard fieldLabel="Enlace" label="Copiar enlace" value="https://example.com/s/1" />);
    const input = ui.getByLabelText("Enlace") as HTMLInputElement;

    expect(input.readOnly).toBe(true);
    expect(input.value).toBe("https://example.com/s/1");

    fireEvent.click(ui.getByRole("button", { name: "Copiar enlace" }));
    await settle();

    expect(writeText).toHaveBeenCalledWith("https://example.com/s/1");
  });
});
