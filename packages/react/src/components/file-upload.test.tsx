import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileUpload } from "./file-upload.js";

function selectFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  // Zag's hidden input reads the selection on `input`, not `change` (file-upload.connect.mjs
  // `getHiddenInputProps().onInput`), and validates it asynchronously — the DOM only settles
  // after a microtask, which is what `waitFor` below is for.
  fireEvent.input(input);
}

describe("FileUpload", () => {
  it("announces a rejected file's reason instead of failing silently", async () => {
    const ui = render(<FileUpload label="Subir" maxFileSize={10} multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;
    const big = new File(["x".repeat(100)], "grande.txt", { type: "text/plain" });

    selectFiles(input, [big]);

    const alert = await waitFor(() => {
      const el = ui.container.querySelector("[role='alert']");
      if (!el) throw new Error("not rendered yet");
      return el;
    });
    expect(alert.textContent).toContain("grande.txt");
    expect(alert.textContent).toContain("pesa demasiado");
  });

  it("clears the rejection message once a valid selection follows", async () => {
    const ui = render(<FileUpload label="Subir" maxFileSize={10} multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;
    const big = new File(["x".repeat(100)], "grande.txt", { type: "text/plain" });
    const small = new File(["ok"], "chico.txt", { type: "text/plain" });

    selectFiles(input, [big]);
    await waitFor(() => expect(ui.container.querySelector("[role='alert']")).not.toBeNull());

    selectFiles(input, [small]);
    await waitFor(() => expect(ui.container.querySelector("[role='alert']")).toBeNull());
  });
});
