import { fireEvent, waitFor } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountFileUpload } from "./file-upload.js";

/*
 * The exact shape `fileUploadContract`'s template (core/src/file-upload.ts) emits: a labelled root,
 * a non-interactive dropzone, the real (visually hidden) file input, and a trigger button. `clear`
 * is NOT part of that template. It is an author's own opt-in extra the Svelte enhancer only wires
 * when present (see FileUpload.svelte's `if (clear)` guard). Covered by its own test below.
 */
function markup({ clear = false, multiple = true, maxFileSize = "" } = {}): HTMLElement {
  document.body.innerHTML = `<div data-sk-file-upload${maxFileSize ? ` data-max-file-size="${maxFileSize}"` : ""}>
    <label data-sk-file-upload-label>Subir archivos</label>
    <div data-sk-file-upload-dropzone>
      <span>Arrastra un archivo o haz clic</span>
    </div>
    <input data-sk-file-upload-input type="file" ${multiple ? "multiple" : ""} />
    <button class="sk-file-upload__trigger sk-button sk-interactive" data-sk-file-upload-trigger type="button">Elegir archivo</button>
    ${clear ? '<button data-sk-file-upload-clear type="button" hidden>Quitar</button>' : ""}
  </div>`;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountFileUpload(document)).toBe(1);
  flushSync();
  return root;
}

const parts = (root: HTMLElement) => ({
  dropzone: root.querySelector<HTMLElement>("[data-sk-file-upload-dropzone]")!,
  input: root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]")!,
  trigger: root.querySelector<HTMLButtonElement>("[data-sk-file-upload-trigger]")!,
  clear: root.querySelector<HTMLButtonElement>("[data-sk-file-upload-clear]"),
});

/** Zag's hidden input reads the selection on `input`, not `change`. Same API the React binding's
 *  own `file-upload.test.tsx` documents (`getHiddenInputProps().onInput`), same underlying machine. */
function selectFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  fireEvent.input(input);
}

/*
 * `getDropzoneProps()`'s own `openFilePicker` action (checked against the installed
 * `@zag-js/file-upload` machine) forwards the hidden input's `.click()` behind a real
 * `requestAnimationFrame`, not synchronously. The same deferred-action shape `menu.test.ts` and
 * `number-field.test.ts` both document for their own machines.
 */
const tick = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-file-upload]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("FileUpload vanilla enhancer", () => {
  /*
   * The dropzone holds NO nested interactive descendants (core/file-upload.ts's own doc: a button
   * cannot contain another interactive control, so the real input/trigger are its SIBLINGS). But
   * the dropzone itself is a genuine custom button, not decoration: `role="button"` on a non-native
   * element is only correct WITH keyboard operability (WAI's own Button pattern), so this asserts
   * both halves. The tab stop and the role: not just the role alone.
   */
  it("wires the dropzone as a real, tabbable button, and the trigger as a native one", () => {
    const root = markup();
    const { dropzone, trigger } = parts(root);
    expect(dropzone.getAttribute("role")).toBe("button");
    expect(dropzone.tabIndex).toBe(0);
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("opens the file picker from the dropzone via Enter or Space, not just a pointer click", async () => {
    const root = markup();
    const { dropzone, input } = parts(root);
    const openPicker = vi.fn();
    input.addEventListener("click", openPicker);

    fireEvent.keyDown(dropzone, { key: "Enter" });
    flushSync();
    await tick();
    expect(openPicker).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(dropzone, { key: " " });
    flushSync();
    await tick();
    expect(openPicker).toHaveBeenCalledTimes(2);
  });

  it("selecting a valid file emits sk:fileuploadchange with it accepted", () => {
    const root = markup();
    const { input } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk:fileuploadchange", handler);
    const file = new File(["ok"], "chico.txt", { type: "text/plain" });

    selectFiles(input, [file]);
    flushSync();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ acceptedFiles: [file], rejectedFiles: [] }),
      }),
    );
  });

  it("selecting an oversized file emits sk:fileuploadchange with it rejected instead of accepted", () => {
    const root = markup({ maxFileSize: "10" });
    const { input } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk:fileuploadchange", handler);
    const big = new File(["x".repeat(100)], "grande.txt", { type: "text/plain" });

    selectFiles(input, [big]);
    flushSync();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ acceptedFiles: [] }) }),
    );
    const [call] = handler.mock.calls;
    const rejected = (call![0] as CustomEvent).detail.rejectedFiles;
    expect(rejected).toHaveLength(1);
    expect(rejected[0].file).toBe(big);
  });

  it("keeps the clear trigger hidden until a file is accepted, and shows it once one is", () => {
    const root = markup({ clear: true });
    const { input, clear } = parts(root);
    expect(clear!.hidden).toBe(true);

    selectFiles(input, [new File(["ok"], "chico.txt")]);
    flushSync();

    expect(clear!.hidden).toBe(false);
  });

  it("clicking the clear trigger empties the accepted files and re-hides itself", () => {
    const root = markup({ clear: true });
    const { input, clear } = parts(root);
    selectFiles(input, [new File(["ok"], "chico.txt")]);
    flushSync();
    expect(clear!.hidden).toBe(false);

    fireEvent.click(clear!);
    flushSync();

    expect(clear!.hidden).toBe(true);
  });

  it("does nothing without an authored dropzone/input/trigger to scan", () => {
    document.body.innerHTML = `<div data-sk-file-upload><label data-sk-file-upload-label>Subir</label></div>`;
    // The mount still runs; it simply has nothing to connect, and must not throw doing it.
    expect(mountFileUpload(document)).toBe(1);
  });

  it("stops the machine when the mount is destroyed", () => {
    const root = markup();
    const { input } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk:fileuploadchange", handler);

    destroyMount(root);
    selectFiles(input, [new File(["ok"], "chico.txt")]);
    flushSync();

    expect(handler).not.toHaveBeenCalled();
  });
});

/*
 * THE SURFACE OUTSIDE THE ROOT, the enhancer's half.
 *
 * The enhancer renders nothing, so what is observable here is not a list of files: it is the one
 * attribute it toggles (`hidden` on the authored overlay) and the event the machine dispatches once
 * it has accepted what was dropped. Both are exactly what a consumer of this binding reads.
 */
function dropMarkup({ scope = "page" } = {}): HTMLElement {
  document.body.innerHTML = `
  <div data-sk-file-upload data-drop-scope="${scope}">
    <label data-sk-file-upload-label>Subir archivos</label>
    <div data-sk-file-upload-dropzone><span>Arrastra un archivo</span></div>
    <input data-sk-file-upload-input type="file" multiple />
    <button class="sk-file-upload__trigger sk-button sk-interactive" data-sk-file-upload-trigger type="button">Elegir archivo</button>
    <div data-sk-file-upload-overlay hidden aria-hidden="true">
      <div class="sk-file-upload__overlay-body">Suelta para subir</div>
    </div>
  </div>`;
  expect(mountFileUpload(document)).toBe(1);
  flushSync();
  return document.querySelector<HTMLElement>("[data-sk-file-upload]")!;
}

const fileDrag = (type: string, files: File[] = [], types: string[] = ["Files"]): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", { value: { types, files, dropEffect: "none" } });
  return event;
};

describe("FileUpload vanilla drop scopes", () => {
  it("accepts a file dropped anywhere on the page", async () => {
    const root = dropMarkup();
    const changed = vi.fn();
    root.addEventListener("sk:fileuploadchange", changed);

    document.dispatchEvent(fileDrag("drop", [new File(["ok"], "soltado.txt")]));

    await waitFor(() => expect(changed).toHaveBeenCalled());
    const detail = (changed.mock.calls[0]![0] as CustomEvent).detail;
    expect(detail.acceptedFiles.map((file: File) => file.name)).toEqual(["soltado.txt"]);
  });

  it("shows the authored overlay while a file is over the page, and hides it on drop", async () => {
    const root = dropMarkup();
    const overlay = root.querySelector<HTMLElement>("[data-sk-file-upload-overlay]")!;
    expect(overlay.hidden).toBe(true);

    document.dispatchEvent(fileDrag("dragenter"));
    expect(overlay.hidden).toBe(false);

    document.dispatchEvent(fileDrag("drop", [new File(["ok"], "soltado.txt")]));
    expect(overlay.hidden).toBe(true);
  });

  it("ignores a drag with no files in it", () => {
    const root = dropMarkup();
    const overlay = root.querySelector<HTMLElement>("[data-sk-file-upload-overlay]")!;

    document.dispatchEvent(fileDrag("dragenter", [], ["text/plain"]));

    expect(overlay.hidden).toBe(true);
  });

  it("leaves the page alone when no scope is authored", async () => {
    document.body.innerHTML = `<div data-sk-file-upload>
      <label data-sk-file-upload-label>Subir</label>
      <div data-sk-file-upload-dropzone><span>Arrastra</span></div>
      <input data-sk-file-upload-input type="file" multiple />
      <button data-sk-file-upload-trigger type="button">Elegir</button>
    </div>`;
    expect(mountFileUpload(document)).toBe(1);
    flushSync();
    const root = document.querySelector<HTMLElement>("[data-sk-file-upload]")!;
    const changed = vi.fn();
    root.addEventListener("sk:fileuploadchange", changed);

    document.dispatchEvent(fileDrag("drop", [new File(["ok"], "soltado.txt")]));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(changed).not.toHaveBeenCalled();
  });
});

/*
 * THE CHOSEN FILES, in the binding that used to show none of them.
 *
 * jsdom has no `URL.createObjectURL`, so the image case stubs it: what is under test is which of the
 * two cells a row draws, not the browser's blob plumbing.
 */
describe("FileUpload vanilla chosen-file list", () => {
  const rows = (root: HTMLElement) => Array.from(root.querySelectorAll("li.sk-file-upload__item"));

  it("shows nothing until a file is chosen", () => {
    const root = markup();

    expect(rows(root)).toEqual([]);
  });

  it("lists every accepted file with its name and its size", async () => {
    const root = markup();
    const { input } = parts(root);

    selectFiles(input, [new File(["hola"], "informe.pdf"), new File(["x"], "notas.txt")]);

    await waitFor(() => expect(rows(root).length).toBe(2));
    expect(rows(root)[0]!.textContent).toContain("informe.pdf");
    expect(root.querySelector(".sk-file-upload__item-size")!.textContent!.trim()).not.toBe("");
  });

  it("badges a file that cannot show itself with its kind", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["hola"], "informe.pdf")]);

    await waitFor(() => expect(rows(root).length).toBe(1));
    expect(root.querySelector(".sk-file-upload__item-kind")!.textContent).toBe("PDF");
    // A glyph placeholder rather than a thumbnail, in the same frame either one would sit in.
    expect(root.querySelector(".sk-file-upload__item-preview img")).toBeNull();
    expect(root.querySelector(".sk-file-upload__item-preview [data-sk-icon='file']")).not.toBeNull();
  });

  it("shows an image as itself", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:sk-test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const root = markup();

    selectFiles(parts(root).input, [new File([""], "foto.png", { type: "image/png" })]);

    await waitFor(() => expect(rows(root).length).toBe(1));
    const img = root.querySelector<HTMLImageElement>(".sk-file-upload__item-preview img")!;
    expect(img.getAttribute("src")).toBe("blob:sk-test");
    // Decorative: the row already says the file's name in text.
    expect(img.getAttribute("alt")).toBe("");
    expect(createObjectURL).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("removes one file from the list without touching the rest", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["a"], "uno.txt"), new File(["b"], "dos.txt")]);
    await waitFor(() => expect(rows(root).length).toBe(2));

    const remove = root.querySelectorAll<HTMLButtonElement>(".sk-file-upload__item-delete")[0]!;
    remove.click();

    await waitFor(() => expect(rows(root).length).toBe(1));
    expect(rows(root)[0]!.textContent).toContain("dos.txt");
  });

  /*
   * THE NAME IS THE `aria-label`, not the content: the machine writes one, and an `aria-label` beats
   * whatever is inside the button. Left to its own defaults it writes "delete file uno.txt", in
   * English, which is what this asserts is no longer the case.
   */
  it("names each remove control after its own file, in this component's language", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["a"], "uno.txt")]);

    await waitFor(() => expect(rows(root).length).toBe(1));
    const remove = root.querySelector(".sk-file-upload__item-delete")!;
    expect(remove.getAttribute("aria-label")).toBe("Quitar uno.txt");
  });

  it("lets the dropzone be announced as the instruction written on it", () => {
    const root = markup();

    // Not "dropzone", the machine's own English default, which would also break label-in-name.
    expect(parts(root).dropzone.getAttribute("aria-label")).toBe("Arrastra un archivo o haz clic");
  });

  it("says why a file was rejected instead of dropping it silently", async () => {
    const root = markup({ maxFileSize: "10" });

    selectFiles(parts(root).input, [new File(["x".repeat(100)], "grande.txt")]);

    const alert = await waitFor(() => {
      const el = root.querySelector("[role='alert']");
      if (!el) throw new Error("not rendered yet");
      return el;
    });
    expect(alert.textContent).toContain("grande.txt");
    expect(alert.textContent).toContain("pesa demasiado");
  });
});

describe("FileUpload vanilla dropzone and list together", () => {
  const rows = (root: HTMLElement) => Array.from(root.querySelectorAll("li.sk-file-upload__item"));

  it("keeps the dropzone under the list, so the next file goes where the last one did", async () => {
    const root = markup();
    const { dropzone, input } = parts(root);

    selectFiles(input, [new File(["a"], "uno.txt")]);

    await waitFor(() => expect(rows(root).length).toBe(1));
    expect(dropzone.hidden).toBe(false);
  });

  it("hides the dropzone once no more files fit, and brings it back when one goes", async () => {
    document.body.innerHTML = `<div data-sk-file-upload data-max-files="2">
      <label data-sk-file-upload-label>Subir</label>
      <div data-sk-file-upload-dropzone><span>Arrastra</span></div>
      <input data-sk-file-upload-input type="file" multiple />
      <button data-sk-file-upload-trigger type="button">Elegir</button>
    </div>`;
    expect(mountFileUpload(document)).toBe(1);
    flushSync();
    const root = document.querySelector<HTMLElement>("[data-sk-file-upload]")!;
    const dropzone = root.querySelector<HTMLElement>("[data-sk-file-upload-dropzone]")!;
    const input = root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]")!;

    selectFiles(input, [new File(["a"], "uno.txt"), new File(["b"], "dos.txt")]);
    await waitFor(() => expect(dropzone.hidden).toBe(true));

    root.querySelector<HTMLButtonElement>(".sk-file-upload__item-delete")!.click();

    await waitFor(() => expect(dropzone.hidden).toBe(false));
  });

  it("moves focus to the next remove control when a row is taken from under it", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["a"], "uno.txt"), new File(["b"], "dos.txt")]);
    await waitFor(() => expect(rows(root).length).toBe(2));

    const removers = root.querySelectorAll<HTMLButtonElement>(".sk-file-upload__item-delete");
    removers[0]!.focus();
    removers[0]!.click();

    await waitFor(() => expect(rows(root).length).toBe(1));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        root.querySelector(".sk-file-upload__item-delete"),
      ),
    );
  });

  it("falls back to the picker once the last row is gone", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["a"], "uno.txt")]);
    await waitFor(() => expect(rows(root).length).toBe(1));

    root.querySelector<HTMLButtonElement>(".sk-file-upload__item-delete")!.click();

    await waitFor(() => expect(document.activeElement).toBe(parts(root).trigger));
  });

  it("announces the list politely, since nothing else says a file landed", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["a"], "uno.txt")]);

    await waitFor(() =>
      expect(root.querySelector("ul.sk-file-upload__item-group")!.getAttribute("aria-live")).toBe("polite"),
    );
  });
});

describe("FileUpload vanilla validation", () => {
  /** The shell as the emitter writes it for a control with real limits on it. */
  function limited({ accept = "image/*,.pdf", extra = "" } = {}): HTMLElement {
    document.body.innerHTML = `<div data-sk-file-upload data-max-files="3" data-max-file-size="1000" ${extra}>
      <label data-sk-file-upload-label>Subir</label>
      <div data-sk-file-upload-dropzone><span>Arrastra</span></div>
      <input data-sk-file-upload-input type="file" accept="${accept}" multiple />
      <button class="sk-file-upload__trigger" data-sk-file-upload-trigger type="button">Elegir</button>
    </div>`;
    expect(mountFileUpload(document)).toBe(1);
    flushSync();
    return document.querySelector<HTMLElement>("[data-sk-file-upload]")!;
  }

  it("states the limits in the dropzone without anyone typing them", () => {
    const root = limited();

    expect(root.querySelector(".sk-file-upload__hint")!.textContent).toBe(
      "Imágenes o PDF, hasta 1 kB cada uno",
    );
  });

  it("leaves a hint the author wrote exactly as they wrote it", () => {
    document.body.innerHTML = `<div data-sk-file-upload data-max-file-size="1000">
      <label data-sk-file-upload-label>Subir</label>
      <div data-sk-file-upload-dropzone>
        <span>Arrastra</span>
        <p class="sk-file-upload__hint">Solo fotos del carnet</p>
      </div>
      <input data-sk-file-upload-input type="file" multiple />
      <button class="sk-file-upload__trigger" data-sk-file-upload-trigger type="button">Elegir</button>
    </div>`;
    expect(mountFileUpload(document)).toBe(1);
    flushSync();
    const root = document.querySelector<HTMLElement>("[data-sk-file-upload]")!;

    const hints = root.querySelectorAll(".sk-file-upload__hint");
    expect(hints.length).toBe(1);
    expect(hints[0]!.textContent).toBe("Solo fotos del carnet");
  });

  it("adds no hint where there is nothing to state", () => {
    const root = markup();

    expect(root.querySelector(".sk-file-upload__hint")).toBeNull();
  });

  it("names the limit in the rejection, not just the refusal", async () => {
    const root = limited();

    selectFiles(root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]")!, [
      new File([new Uint8Array(5000)], "grande.png", { type: "image/png" }),
    ]);

    const alert = await waitFor(() => {
      const el = root.querySelector("[role='alert']");
      if (!el) throw new Error("not rendered yet");
      return el;
    });
    expect(alert.textContent).toContain("máximo 1 kB");
  });

  it("marks the whole control while something stands refused", async () => {
    const root = limited();

    selectFiles(root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]")!, [
      new File([new Uint8Array(5000)], "grande.png", { type: "image/png" }),
    ]);

    await waitFor(() => expect(root.hasAttribute("data-invalid")).toBe(true));
  });

  it("refuses the file that goes over the total, even when each one fits on its own", async () => {
    const root = limited({ accept: "", extra: 'data-max-total-size="1200"' });

    selectFiles(root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]")!, [
      new File([new Uint8Array(800)], "uno.bin"),
      new File([new Uint8Array(800)], "dos.bin"),
    ]);

    await waitFor(() => expect(root.querySelectorAll("li.sk-file-upload__item").length).toBe(1));
    expect(root.querySelector("[role='alert']")!.textContent).toContain("peso total");
  });
});

describe("FileUpload vanilla row layout", () => {
  it("stacks the name over its own facts, and keeps the whole name reachable", async () => {
    const root = markup();

    selectFiles(parts(root).input, [new File(["a"], "informe-final-consolidado-2026.pdf")]);

    await waitFor(() => expect(root.querySelectorAll("li.sk-file-upload__item").length).toBe(1));
    const body = root.querySelector(".sk-file-upload__item-body")!;
    expect(body.querySelector(".sk-file-upload__item-name")!.getAttribute("title")).toBe(
      "informe-final-consolidado-2026.pdf",
    );
    expect(body.querySelector(".sk-file-upload__item-size")).not.toBeNull();
  });
});

describe("FileUpload vanilla tally", () => {
  it("counts where the choosing stands, once there is something to count", async () => {
    document.body.innerHTML = `<div data-sk-file-upload data-max-files="3" data-max-total-size="10000000">
      <label data-sk-file-upload-label>Subir</label>
      <div data-sk-file-upload-dropzone><span>Arrastra</span></div>
      <input data-sk-file-upload-input type="file" multiple />
      <button class="sk-file-upload__trigger" data-sk-file-upload-trigger type="button">Elegir</button>
    </div>`;
    expect(mountFileUpload(document)).toBe(1);
    flushSync();
    const root = document.querySelector<HTMLElement>("[data-sk-file-upload]")!;
    expect(root.querySelector(".sk-file-upload__tally")).toBeNull();

    selectFiles(root.querySelector<HTMLInputElement>("[data-sk-file-upload-input]")!, [
      new File([new Uint8Array(1_000_000)], "uno.bin"),
      new File([new Uint8Array(2_400_000)], "dos.bin"),
    ]);

    await waitFor(() =>
      expect(root.querySelector(".sk-file-upload__tally")!.textContent).toBe(
        "2 de 3 archivos · 3,4 de 10 MB",
      ),
    );
  });
});

describe("FileUpload vanilla dropzone mark", () => {
  it("keeps the authored upload mark, which the emitter writes by default", () => {
    document.body.innerHTML = `<div data-sk-file-upload>
      <label data-sk-file-upload-label>Subir</label>
      <div data-sk-file-upload-dropzone>
        <span class="sk-file-upload__icon" aria-hidden="true">
          <span data-sk-icon="upload" data-sk-icon-size="lg"></span>
        </span>
        <span>Arrastra</span>
      </div>
      <input data-sk-file-upload-input type="file" multiple />
      <button class="sk-file-upload__trigger" data-sk-file-upload-trigger type="button">Elegir</button>
    </div>`;
    expect(mountFileUpload(document)).toBe(1);
    flushSync();
    const root = document.querySelector<HTMLElement>("[data-sk-file-upload]")!;

    // The enhancer patches attributes and must not touch the mark the author (or the emitter) wrote.
    expect(root.querySelector(".sk-file-upload__icon [data-sk-icon='upload'], .sk-file-upload__icon svg")).not.toBeNull();
  });
});
