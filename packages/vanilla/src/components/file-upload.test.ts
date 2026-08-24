import { fireEvent } from "@testing-library/dom";
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
      <span>Arrastrá un archivo o hacé click</span>
    </div>
    <input data-sk-file-upload-input type="file" ${multiple ? "multiple" : ""} />
    <button data-sk-file-upload-trigger type="button">Elegir archivo</button>
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

  it("selecting a valid file emits sk-file-change with it accepted", () => {
    const root = markup();
    const { input } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk-file-change", handler);
    const file = new File(["ok"], "chico.txt", { type: "text/plain" });

    selectFiles(input, [file]);
    flushSync();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ acceptedFiles: [file], rejectedFiles: [] }),
      }),
    );
  });

  it("selecting an oversized file emits sk-file-change with it rejected instead of accepted", () => {
    const root = markup({ maxFileSize: "10" });
    const { input } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk-file-change", handler);
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
    root.addEventListener("sk-file-change", handler);

    destroyMount(root);
    selectFiles(input, [new File(["ok"], "chico.txt")]);
    flushSync();

    expect(handler).not.toHaveBeenCalled();
  });
});
