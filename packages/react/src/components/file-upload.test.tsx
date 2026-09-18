import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileUpload } from "./file-upload.js";

function selectFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  // Zag's hidden input reads the selection on `input`, not `change` (file-upload.connect.mjs
  // `getHiddenInputProps().onInput`), and validates it asynchronously. The DOM only settles
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

  it("dispatches sk:fileuploadchange on the root for DOM parity with vanilla", async () => {
    const onFileChange = vi.fn();
    const ui = render(<FileUpload label="Subir" multiple onFileChange={onFileChange} />);
    const root = ui.container.querySelector(".sk-file-upload")!;
    const onDom = vi.fn();
    root.addEventListener("sk:fileuploadchange", onDom);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;
    const file = new File(["ok"], "chico.txt", { type: "text/plain" });

    selectFiles(input, [file]);

    await waitFor(() => expect(onFileChange).toHaveBeenCalled());
    expect(onDom).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ acceptedFiles: [file], rejectedFiles: [] }),
      }),
    );
  });

  it("omits the clear-all control until clearLabel is authored", async () => {
    const without = render(<FileUpload label="Subir" multiple />);
    const input = without.container.querySelector<HTMLInputElement>("input[type='file']")!;
    selectFiles(input, [new File(["ok"], "chico.txt")]);
    await waitFor(() => expect(without.container.querySelectorAll("li").length).toBe(1));
    expect(without.queryByRole("button", { name: /Quitar todos/i })).toBeNull();
    without.unmount();

    const withClear = render(<FileUpload clearLabel="Quitar todos" label="Subir" multiple />);
    const clearInput = withClear.container.querySelector<HTMLInputElement>("input[type='file']")!;
    selectFiles(clearInput, [new File(["ok"], "chico.txt")]);
    await waitFor(() =>
      expect(withClear.getByRole("button", { name: "Quitar todos" })).toBeTruthy(),
    );
  });
});