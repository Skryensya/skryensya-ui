import { describe, expect, it } from "vitest";
import { fileUploadErrorMessage } from "./file-upload.js";

describe("fileUploadErrorMessage", () => {
  it("names every Zag error code in prose", () => {
    expect(fileUploadErrorMessage("FILE_TOO_LARGE")).toBe("el archivo pesa demasiado");
    expect(fileUploadErrorMessage("FILE_TOO_SMALL")).toBe("el archivo pesa muy poco");
    expect(fileUploadErrorMessage("FILE_INVALID_TYPE")).toBe("el tipo de archivo no está permitido");
    expect(fileUploadErrorMessage("TOO_MANY_FILES")).toBe("hay más archivos de los permitidos");
    expect(fileUploadErrorMessage("FILE_EXISTS")).toBe("ese archivo ya fue elegido");
  });

  it("falls back to a generic reason for an unknown code", () => {
    expect(fileUploadErrorMessage("FILE_INVALID")).toBe("el archivo no es válido");
    expect(fileUploadErrorMessage("something-new-zag-adds-later")).toBe("el archivo no es válido");
  });
});
