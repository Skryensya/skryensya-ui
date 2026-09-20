import { describe, expect, it } from "vitest";
import {
  describeAccept,
  dropzoneHiddenAt,
  fileDropTarget,
  fileKindLabel,
  filesAfterDrop,
  fileUploadErrorMessage,
  fileUploadLimitsLabel,
  fileUploadTallyLabel,
  formatFileSize,
  maxTotalSizeValidator,
  isPreviewableImage,
  observeFileDrop,
  removeFileLabel,
} from "./file-upload.js";

describe("fileUploadErrorMessage", () => {
  it("names every error code in prose", () => {
    expect(fileUploadErrorMessage("FILE_TOO_LARGE")).toBe("el archivo pesa demasiado");
    expect(fileUploadErrorMessage("FILE_TOO_SMALL")).toBe("el archivo pesa muy poco");
    expect(fileUploadErrorMessage("FILE_INVALID_TYPE")).toBe("el tipo de archivo no está permitido");
    expect(fileUploadErrorMessage("TOO_MANY_FILES")).toBe("hay más archivos de los permitidos");
    expect(fileUploadErrorMessage("FILE_EXISTS")).toBe("ese archivo ya fue elegido");
    expect(fileUploadErrorMessage("TOTAL_TOO_LARGE")).toBe("no cabe: se pasa del peso total");
  });

  /*
   * THE LIMIT BELONGS IN THE MESSAGE. "Pesa demasiado" says a file was refused; adding the number
   * says what to do about it, which is the whole job of the sentence.
   */
  it("names the limit that was broken when it knows it", () => {
    expect(fileUploadErrorMessage("FILE_TOO_LARGE", { maxFileSize: 5_000_000 })).toBe(
      "el archivo pesa demasiado (máximo 5 MB)",
    );
    expect(fileUploadErrorMessage("TOO_MANY_FILES", { maxFiles: 3 })).toBe(
      "hay más archivos de los permitidos (máximo 3)",
    );
    expect(fileUploadErrorMessage("FILE_INVALID_TYPE", { accept: "image/png,.pdf" })).toBe(
      "el tipo de archivo no está permitido (se aceptan PNG o PDF)",
    );
    expect(fileUploadErrorMessage("TOTAL_TOO_LARGE", { maxTotalSize: 20_000_000 })).toBe(
      "no cabe: se pasa del peso total (máximo 20 MB)",
    );
  });

  it("says nothing about a limit it was not given, rather than an empty parenthesis", () => {
    expect(fileUploadErrorMessage("FILE_TOO_LARGE", {})).toBe("el archivo pesa demasiado");
    expect(fileUploadErrorMessage("TOO_MANY_FILES", { maxFiles: Number.POSITIVE_INFINITY })).toBe(
      "hay más archivos de los permitidos",
    );
  });

  it("falls back to a generic reason for an unknown code", () => {
    expect(fileUploadErrorMessage("FILE_INVALID")).toBe("el archivo no es válido");
    expect(fileUploadErrorMessage("something-new-zag-adds-later")).toBe("el archivo no es válido");
  });
});

/*
 * THE DROP SURFACE, over a bare `EventTarget`.
 *
 * Node has no DOM, and this needs none: `observeFileDrop` only ever calls `addEventListener` on
 * what it is given, which is why its parameter says `EventTarget` rather than naming DOM types it
 * does not use. The four behaviours below are the four bugs every hand-rolled version of this has,
 * so they are worth a test each rather than one happy path.
 */
const fileDrag = (type: string, files: File[] = [], types: string[] = ["Files"]): Event => {
  const event = new Event(type, { cancelable: true });
  Object.defineProperty(event, "dataTransfer", { value: { types, files, dropEffect: "none" } });
  return event;
};

const surface = () => {
  const target = new EventTarget();
  const seen: string[] = [];
  const dropped: File[][] = [];
  const stop = observeFileDrop(target, {
    onDragEnter: () => seen.push("enter"),
    onDragOver: () => seen.push("over"),
    onDragLeave: () => seen.push("leave"),
    onDrop: (files) => dropped.push(files),
  });
  return { target, seen, dropped, stop };
};

describe("observeFileDrop", () => {
  it("announces one enter for a drag that crosses several children", () => {
    const { target, seen } = surface();

    // Entering a child fires `dragenter` for the child BEFORE `dragleave` for the parent, which is
    // what makes the naive boolean flicker.
    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("dragleave"));

    expect(seen).toEqual(["enter"]);
  });

  it("leaves only once the drag is out of every nested element", () => {
    const { target, seen } = surface();

    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("dragleave"));
    target.dispatchEvent(fileDrag("dragleave"));

    expect(seen).toEqual(["enter", "leave"]);
  });

  it("ignores a drag that carries no files", () => {
    const { target, seen, dropped } = surface();
    const text = () => fileDrag("dragenter", [], ["text/plain"]);

    target.dispatchEvent(text());
    target.dispatchEvent(fileDrag("drop", [new File(["x"], "x.txt")], ["text/plain"]));

    expect(seen).toEqual([]);
    expect(dropped).toEqual([]);
  });

  it("cancels dragover, which is what stops the browser navigating to the dropped file", () => {
    const { target } = surface();
    const over = fileDrag("dragover");

    target.dispatchEvent(over);

    expect(over.defaultPrevented).toBe(true);
  });

  it("hands the dropped files over, and reports the surface as left", () => {
    const { target, seen, dropped } = surface();
    const file = new File(["hello"], "notes.txt");

    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("drop", [file]));

    expect(dropped).toEqual([[file]]);
    expect(seen).toEqual(["enter", "leave"]);
  });

  it("drops out of a sticky state: a drop resets the counter rather than decrementing it", () => {
    const { target, seen } = surface();

    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("drop", [new File(["a"], "a.txt")]));
    target.dispatchEvent(fileDrag("dragenter"));

    expect(seen).toEqual(["enter", "leave", "enter"]);
  });

  it("stops listening when torn down", () => {
    const { target, seen, dropped, stop } = surface();

    stop();
    target.dispatchEvent(fileDrag("dragenter"));
    target.dispatchEvent(fileDrag("drop", [new File(["a"], "a.txt")]));

    expect(seen).toEqual([]);
    expect(dropped).toEqual([]);
  });
});

describe("what a chosen file shows before it is sent", () => {
  it("previews anything the browser can paint, and nothing else", () => {
    expect(isPreviewableImage(new File([""], "foto.png", { type: "image/png" }))).toBe(true);
    expect(isPreviewableImage(new File([""], "animado.gif", { type: "image/gif" }))).toBe(true);
    expect(isPreviewableImage(new File([""], "informe.pdf", { type: "application/pdf" }))).toBe(false);
    // A file the OS could not type is not an image on the strength of its name alone.
    expect(isPreviewableImage(new File([""], "foto.png", { type: "" }))).toBe(false);
  });

  it("badges a non-image with its kind, upper case and short", () => {
    expect(fileKindLabel("informe.pdf")).toBe("PDF");
    expect(fileKindLabel("Contrato.DOCX")).toBe("DOCX");
    expect(fileKindLabel("backup.tar.gz")).toBe("GZ");
    // Longer than four is not an extension any more, so it is cut rather than allowed to widen the row.
    expect(fileKindLabel("captura.screenshot")).toBe("SCRE");
  });

  it("falls back to a generic mark rather than a fragment of the name", () => {
    expect(fileKindLabel("LEEME")).toBe("FILE");
    expect(fileKindLabel("termina.en.punto.")).toBe("FILE");
    // A dotfile's leading dot names the file, it does not introduce an extension.
    expect(fileKindLabel(".gitignore")).toBe("FILE");
  });

  it("names the remove control after the file it removes", () => {
    expect(removeFileLabel("informe.pdf")).toBe("Quitar informe.pdf");
  });
});

/*
 * WHICH NODE LISTENS. No DOM in this runner, and none needed: the only branch is the scope, and the
 * stub answers the one property the `page` branch reads.
 */
describe("fileDropTarget", () => {
  const doc = {} as Document;
  const root = { ownerDocument: doc } as unknown as Element;

  it("leaves a zone-scoped control to the machine's own dropzone", () => {
    expect(fileDropTarget("zone", root)).toBeNull();
    expect(fileDropTarget(undefined, root)).toBeNull();
  });

  it("is the whole document for page scope", () => {
    expect(fileDropTarget("page", root)).toBe(doc);
  });
});

/*
 * THE DROPZONE STAYS UNTIL IT CANNOT TAKE ANOTHER FILE. Hiding it on the first one, which an earlier
 * revision did, breaks the thing people do most here: dropping a second file where they dropped the
 * first.
 */
describe("dropzoneHiddenAt", () => {
  it("keeps the dropzone while there is still room", () => {
    expect(dropzoneHiddenAt(0, 3)).toBe(false);
    expect(dropzoneHiddenAt(2, 3)).toBe(false);
  });

  it("hides it once the limit is reached, so it cannot invite a rejected drop", () => {
    expect(dropzoneHiddenAt(3, 3)).toBe(true);
    expect(dropzoneHiddenAt(4, 3)).toBe(true);
  });

  it("never hides it when there is no limit to reach", () => {
    expect(dropzoneHiddenAt(99, undefined)).toBe(false);
    expect(dropzoneHiddenAt(99, Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("filesAfterDrop", () => {
  /*
   * A SECOND DROP ADDS. The machine's only public setter replaces outright, so without this a
   * dropped file silently erased everything chosen before it.
   */
  it("keeps what was already chosen", () => {
    const first = new File(["a"], "uno.txt");
    const second = new File(["b"], "dos.txt");

    expect(filesAfterDrop([first], [second]).map((file) => file.name)).toEqual([
      "uno.txt",
      "dos.txt",
    ]);
  });

  it("is just the dropped files when nothing was chosen yet", () => {
    const file = new File(["a"], "uno.txt");

    expect(filesAfterDrop([], [file])).toEqual([file]);
  });
});

describe("formatFileSize", () => {
  it("reads the way a file manager reads", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(5_000_000)).toBe("5 MB");
    expect(formatFileSize(4_200_000)).toBe("4,2 MB");
    expect(formatFileSize(2_000_000_000)).toBe("2 GB");
  });

  it("drops a decimal that would only ever be zero", () => {
    expect(formatFileSize(1000)).toBe("1 kB");
    expect(formatFileSize(1_050_000)).toBe("1,1 MB");
  });
});

describe("describeAccept", () => {
  it("turns the attribute's syntax into words somebody says", () => {
    expect(describeAccept("image/*")).toBe("imágenes");
    expect(describeAccept(".pdf")).toBe("PDF");
    expect(describeAccept("image/png,image/jpeg")).toBe("PNG o JPEG");
    expect(describeAccept("image/*,.pdf,.docx")).toBe("imágenes, PDF o DOCX");
  });

  it("says one kind once, however many ways it was written", () => {
    expect(describeAccept("image/png,.png")).toBe("PNG");
  });

  it("is empty when nothing was restricted", () => {
    expect(describeAccept("")).toBe("");
    expect(describeAccept("  ,  ")).toBe("");
  });
});

/*
 * THE LINE OVER THE PICKER says what this control takes, and only that. The count and the weight
 * are state, and they live in the tally below.
 */
describe("fileUploadLimitsLabel", () => {
  it("reads as a sentence, not as a spec sheet", () => {
    expect(
      fileUploadLimitsLabel({ accept: "image/*,.pdf", maxFileSize: 5_000_000, multiple: true }),
    ).toBe("Imágenes o PDF, hasta 5 MB cada uno");
  });

  it("drops the per-file wording when only one file can be chosen", () => {
    expect(fileUploadLimitsLabel({ accept: ".pdf", maxFileSize: 5_000_000 })).toBe(
      "PDF, hasta 5 MB",
    );
  });

  it("leaves out the count and the total, which belong to the tally", () => {
    const line = fileUploadLimitsLabel({
      accept: "image/*",
      maxFileSize: 5_000_000,
      maxFiles: 3,
      maxTotalSize: 10_000_000,
      multiple: true,
    });

    expect(line).toBe("Imágenes, hasta 5 MB cada uno");
    expect(line).not.toContain("3");
    expect(line).not.toContain("10 MB");
  });

  it("says nothing where there is nothing to say", () => {
    expect(fileUploadLimitsLabel({})).toBe("");
    expect(fileUploadLimitsLabel({ maxFileSize: Number.POSITIVE_INFINITY })).toBe("");
  });
});

/*
 * THE TALLY answers the question the static line could not: how much is left.
 */
describe("fileUploadTallyLabel", () => {
  const file = (size: number, name = `${size}.bin`) => new File([new Uint8Array(size)], name);

  it("says nothing before anything is chosen", () => {
    expect(fileUploadTallyLabel([], { maxFiles: 3 })).toBe("");
  });

  it("counts against the limits when there are limits", () => {
    expect(
      fileUploadTallyLabel([file(1_000_000), file(2_400_000)], {
        maxFiles: 3,
        maxTotalSize: 10_000_000,
      }),
    ).toBe("2 de 3 archivos · 3,4 de 10 MB");
  });

  it("still says where you stand with no limits to count against", () => {
    expect(fileUploadTallyLabel([file(1_000_000)])).toBe("1 archivo · 1 MB");
  });
});

/*
 * THE RULE THE MACHINE DOES NOT HAVE. The batch tally is the whole subtlety: Zag hands the same
 * `details` to every file in one selection, and `details.acceptedFiles` never grows as it walks
 * them, so summing that alone lets a batch through one file at a time.
 */
describe("maxTotalSizeValidator", () => {
  const file = (size: number, name = `${size}.bin`) =>
    new File([new Uint8Array(size)], name);

  it("accepts a file that fits in what is left", () => {
    const validate = maxTotalSizeValidator(1000);

    expect(validate(file(400), { acceptedFiles: [file(500)] })).toBeNull();
  });

  it("rejects the file that would go over", () => {
    const validate = maxTotalSizeValidator(1000);

    expect(validate(file(600), { acceptedFiles: [file(500)] })).toEqual(["TOTAL_TOO_LARGE"]);
  });

  it("counts the files earlier in the same batch, which the machine does not", () => {
    const validate = maxTotalSizeValidator(1000);
    const batch = { acceptedFiles: [] as File[] };

    expect(validate(file(400, "a.bin"), batch)).toBeNull();
    expect(validate(file(400, "b.bin"), batch)).toBeNull();
    // 400 + 400 + 400 is over 1000, even though each one on its own fits.
    expect(validate(file(400, "c.bin"), batch)).toEqual(["TOTAL_TOO_LARGE"]);
  });

  it("starts each new batch from what is actually held", () => {
    const validate = maxTotalSizeValidator(1000);

    expect(validate(file(900, "a.bin"), { acceptedFiles: [] })).toBeNull();
    // A second selection, with the first file now accepted: only 100 left.
    expect(validate(file(200, "b.bin"), { acceptedFiles: [file(900, "a.bin")] })).toEqual([
      "TOTAL_TOO_LARGE",
    ]);
  });
});
