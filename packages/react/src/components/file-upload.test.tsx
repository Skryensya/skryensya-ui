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

  /*
   * THE SURFACE OUTSIDE THE DROPZONE.
   *
   * jsdom has no `DragEvent` constructor and no real drag, so the events are built by hand with the
   * one field the implementation reads. That is honest rather than a shortcut: what is under test is
   * the bookkeeping (which target listens, what the overlay does, whether the machine sees the
   * files), and the browser's own drag gesture is what the ai-gates suite is for.
   */
  const fileDrag = (type: string, files: File[] = [], types: string[] = ["Files"]) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: { types, files, dropEffect: "none" } });
    return event;
  };

  it("takes a file dropped anywhere on the page when the scope says so", async () => {
    const ui = render(<FileUpload dropScope="page" label="Subir" multiple overlayLabel="Suelta" />);

    document.dispatchEvent(fileDrag("drop", [new File(["ok"], "soltado.txt")]));

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));
    expect(ui.container.querySelector("li")!.textContent).toContain("soltado.txt");
  });

  it("ignores a page drop when the scope is the default zone", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);

    document.dispatchEvent(fileDrag("drop", [new File(["ok"], "soltado.txt")]));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.container.querySelectorAll("li").length).toBe(0);
  });

  it("shows the overlay only while a file is over the page", async () => {
    const ui = render(<FileUpload dropScope="page" label="Subir" multiple overlayLabel="Suelta" />);
    const overlay = () => ui.container.querySelector<HTMLElement>("[data-sk-file-upload-overlay]")!;
    expect(overlay().hidden).toBe(true);

    document.dispatchEvent(fileDrag("dragenter"));
    await waitFor(() => expect(overlay().hidden).toBe(false));

    document.dispatchEvent(fileDrag("drop", [new File(["ok"], "soltado.txt")]));
    await waitFor(() => expect(overlay().hidden).toBe(true));
  });

  it("leaves the overlay alone for a drag that carries no files", async () => {
    const ui = render(<FileUpload dropScope="page" label="Subir" multiple overlayLabel="Suelta" />);

    document.dispatchEvent(fileDrag("dragenter", [], ["text/plain"]));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.container.querySelector<HTMLElement>("[data-sk-file-upload-overlay]")!.hidden).toBe(true);
  });

  it("writes the scope onto the root, and writes nothing for the default", () => {
    const zone = render(<FileUpload label="Subir" />);
    expect(zone.container.querySelector("[data-sk-file-upload]")!.hasAttribute("data-drop-scope")).toBe(false);
    zone.unmount();

    const page = render(<FileUpload dropScope="page" label="Subir" overlayLabel="Suelta" />);
    expect(page.container.querySelector("[data-sk-file-upload]")!.getAttribute("data-drop-scope")).toBe("page");
  });

  it("renders the hint only when there is something to state", () => {
    const bare = render(<FileUpload label="Subir" />);
    expect(bare.container.querySelector(".sk-file-upload__hint")).toBeNull();
    // The mark is no longer conditional: this control always has one. See the upload-role tests.
    expect(bare.container.querySelector(".sk-file-upload__icon")).not.toBeNull();
    bare.unmount();

    const full = render(<FileUpload hintLabel="PNG o JPG, hasta 5 MB" label="Subir" />);
    expect(full.container.querySelector(".sk-file-upload__hint")!.textContent).toBe("PNG o JPG, hasta 5 MB");
    expect(full.container.querySelector(".sk-file-upload__icon")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("badges a file that cannot show itself with its kind", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["hola"], "informe.pdf")]);

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));
    expect(ui.container.querySelector(".sk-file-upload__item-kind")!.textContent).toBe("PDF");
    // A glyph rather than a thumbnail, in the same frame either one would sit in: the frame is what
    // keeps every row's text starting at the same place.
    expect(ui.container.querySelector(".sk-file-upload__item-preview img")).toBeNull();
    expect(ui.container.querySelector(".sk-file-upload__item-preview svg")).not.toBeNull();
  });

  it("shows an image as itself, and lets go of the blob URL when the row does", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:sk-test");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File([""], "foto.png", { type: "image/png" })]);
    await waitFor(() =>
      expect(ui.container.querySelector(".sk-file-upload__item-preview img")).not.toBeNull(),
    );

    const img = ui.container.querySelector<HTMLImageElement>(".sk-file-upload__item-preview img")!;
    expect(img.getAttribute("src")).toBe("blob:sk-test");
    expect(img.getAttribute("alt")).toBe("");

    ui.unmount();
    expect(revoke).toHaveBeenCalledWith("blob:sk-test");
    vi.restoreAllMocks();
  });

  it("removes one file from the list and leaves the others", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "uno.txt"), new File(["b"], "dos.txt")]);
    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(2));

    fireEvent.click(ui.getByRole("button", { name: "Quitar uno.txt" }));

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));
    expect(ui.container.querySelector("li")!.textContent).toContain("dos.txt");
  });

  it("keeps its own accessible names instead of the machine's English defaults", () => {
    const ui = render(<FileUpload dropzoneLabel="Arrastra archivos aquí" label="Subir" />);

    // Zag's `defaultTranslations` would name this "dropzone", which is neither the language of this
    // component nor the text written on it.
    expect(ui.getByRole("button", { name: "Arrastra archivos aquí" })).toBeTruthy();
  });

  it("keeps the dropzone under the list, so the next file is dropped where the last one was", async () => {
    const ui = render(<FileUpload hintLabel="PNG o JPG" label="Subir" multiple />);
    const dropzone = ui.container.querySelector<HTMLElement>(".sk-file-upload__dropzone")!;
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "uno.txt")]);

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));
    expect(dropzone.hidden).toBe(false);
    expect(ui.getByRole("button", { name: "Elegir archivos" })).toBeTruthy();
  });

  it("hides the dropzone once no more files fit, and brings it back when one goes", async () => {
    const ui = render(<FileUpload label="Subir" maxFiles={2} multiple />);
    const dropzone = ui.container.querySelector<HTMLElement>(".sk-file-upload__dropzone")!;
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "uno.txt"), new File(["b"], "dos.txt")]);
    await waitFor(() => expect(dropzone.hidden).toBe(true));

    fireEvent.click(ui.getByRole("button", { name: "Quitar uno.txt" }));

    await waitFor(() => expect(dropzone.hidden).toBe(false));
  });

  it("moves focus to the next remove control when a row is taken out from under it", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "uno.txt"), new File(["b"], "dos.txt")]);
    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(2));

    const first = ui.getByRole("button", { name: "Quitar uno.txt" });
    first.focus();
    fireEvent.click(first);

    await waitFor(() =>
      expect(document.activeElement).toBe(ui.getByRole("button", { name: "Quitar dos.txt" })),
    );
  });

  it("falls back to the picker when the row removed was the last one", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "uno.txt")]);
    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));

    fireEvent.click(ui.getByRole("button", { name: "Quitar uno.txt" }));

    await waitFor(() =>
      expect(document.activeElement).toBe(ui.getByRole("button", { name: "Elegir archivos" })),
    );
  });

  it("announces the list politely, since nothing else says a file landed", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "uno.txt")]);

    await waitFor(() => expect(ui.container.querySelector("ul")!.getAttribute("aria-live")).toBe("polite"));
  });

  /*
   * THE BUG THIS EXISTS FOR: the machine's only public setter REPLACES the accepted list, so a
   * second drop used to erase the first file instead of joining it.
   */
  it("adds a dropped file to the ones already chosen", async () => {
    const ui = render(<FileUpload dropScope="page" label="Subir" multiple overlayLabel="Suelta" />);

    document.dispatchEvent(fileDrag("drop", [new File(["a"], "uno.txt")]));
    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));

    document.dispatchEvent(fileDrag("drop", [new File(["b"], "dos.txt")]));

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(2));
    expect(ui.container.textContent).toContain("uno.txt");
    expect(ui.container.textContent).toContain("dos.txt");
  });


  /*
   * VALIDATION, and what the reader is told about it: the limits before a file is chosen, the reason
   * with its number after one is refused.
   */
  it("states the limits in the dropzone without anyone typing them", () => {
    const ui = render(
      <FileUpload accept="image/*,.pdf" label="Subir" maxFileSize={5_000_000} maxFiles={3} multiple />,
    );

    expect(ui.container.querySelector(".sk-file-upload__hint")!.textContent).toBe(
      "Imágenes o PDF, hasta 5 MB cada uno",
    );
  });

  it("lets an author override that line, and never both", () => {
    const ui = render(
      <FileUpload accept="image/*" hintLabel="Solo fotos del carnet" label="Subir" maxFiles={2} multiple />,
    );

    const hints = ui.container.querySelectorAll(".sk-file-upload__hint");
    expect(hints.length).toBe(1);
    expect(hints[0]!.textContent).toBe("Solo fotos del carnet");
  });

  it("says nothing where there is nothing to say", () => {
    const ui = render(<FileUpload label="Subir" multiple />);

    expect(ui.container.querySelector(".sk-file-upload__hint")).toBeNull();
  });

  it("names the limit in the rejection, not just the refusal", async () => {
    const ui = render(<FileUpload label="Subir" maxFileSize={1000} multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File([new Uint8Array(5000)], "grande.bin")]);

    const alert = await waitFor(() => {
      const el = ui.container.querySelector("[role='alert']");
      if (!el) throw new Error("not rendered yet");
      return el;
    });
    expect(alert.textContent).toContain("máximo 1 kB");
  });

  it("marks the whole control while something stands refused", async () => {
    const ui = render(<FileUpload label="Subir" maxFileSize={1000} multiple />);
    const root = ui.container.querySelector<HTMLElement>("[data-sk-file-upload]")!;
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;
    expect(root.hasAttribute("data-invalid")).toBe(false);

    selectFiles(input, [new File([new Uint8Array(5000)], "grande.bin")]);
    await waitFor(() => expect(root.hasAttribute("data-invalid")).toBe(true));

    selectFiles(input, [new File(["ok"], "chico.txt")]);
    await waitFor(() => expect(root.hasAttribute("data-invalid")).toBe(false));
  });

  it("refuses the file that goes over the total, even when each one fits on its own", async () => {
    const ui = render(<FileUpload label="Subir" maxFileSize={1000} maxTotalSize={1200} multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [
      new File([new Uint8Array(800)], "uno.bin"),
      new File([new Uint8Array(800)], "dos.bin"),
    ]);

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));
    const alert = ui.container.querySelector("[role='alert']")!;
    expect(alert.textContent).toContain("dos.bin");
    expect(alert.textContent).toContain("peso total");
  });

  it("stacks the name over its own facts, and keeps the whole name reachable", async () => {
    const ui = render(<FileUpload label="Subir" multiple />);
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;

    selectFiles(input, [new File(["a"], "informe-final-consolidado-2026.pdf")]);

    await waitFor(() => expect(ui.container.querySelectorAll("li").length).toBe(1));
    const body = ui.container.querySelector(".sk-file-upload__item-body")!;
    const name = body.querySelector(".sk-file-upload__item-name")!;
    // Both lines live in the same stack: the name is no longer a column beside the size.
    expect(body.querySelector(".sk-file-upload__item-size")).not.toBeNull();
    expect(name.getAttribute("title")).toBe("informe-final-consolidado-2026.pdf");
  });

  /*
   * THE COUNT AND THE WEIGHT MOVED OUT of the line over the picker and into a tally over the list,
   * because they are state: what a person wants there is not the rule, it is how much is left.
   */
  it("counts where the choosing stands, once there is something to count", async () => {
    const ui = render(
      <FileUpload label="Subir" maxFiles={3} maxTotalSize={10_000_000} multiple />,
    );
    const input = ui.container.querySelector<HTMLInputElement>("input[type='file']")!;
    expect(ui.container.querySelector(".sk-file-upload__tally")).toBeNull();

    selectFiles(input, [
      new File([new Uint8Array(1_000_000)], "uno.bin"),
      new File([new Uint8Array(2_400_000)], "dos.bin"),
    ]);

    await waitFor(() =>
      expect(ui.container.querySelector(".sk-file-upload__tally")!.textContent).toBe(
        "2 de 3 archivos · 3,4 de 10 MB",
      ),
    );
  });

  /*
   * THE ROLE THIS COMPONENT IS NAMED FOR. It was published in all three icon sets and used by
   * nothing here: the mark was a slot nobody filled, so the empty state shipped without one while
   * the stylesheet kept drawing the circle meant to hold it.
   */
  it("draws the upload mark without being asked", () => {
    const ui = render(<FileUpload label="Subir" />);

    const icon = ui.container.querySelector(".sk-file-upload__icon")!;
    expect(icon.querySelector("svg")).not.toBeNull();
  });

  it("lets an author put their own mark there instead", () => {
    const ui = render(<FileUpload dropzoneIcon={<span data-testid="mine" />} label="Subir" />);

    const icons = ui.container.querySelectorAll(".sk-file-upload__icon");
    expect(icons.length).toBe(1);
    expect(icons[0]!.querySelector("[data-testid='mine']")).not.toBeNull();
  });
});
