import { qrCodeAttrs, qrCodeParts, qrGeometry } from "@skryensya/core/qr-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QrExportError, connectQrCode, downloadQrCode, mountQrCode, qrCodeToBlob, qrCodeToSvg } from "./qr-code.js";

/*
 * The Vanilla half of QRCode, for a symbol drawn at runtime. What matters is that it is the SAME
 * symbol: every assertion on geometry compares against `qrGeometry` itself, the function the emitter
 * and React call, rather than against a fixture that could agree with a wrong encoder.
 */

const shell = (attrs = "", path = "") => `
  <div class="sk-qr-code" data-sk-qr-code role="img" aria-label="Abrir tu enlace" ${attrs}>
    <svg class="sk-qr-code__frame" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path class="sk-qr-code__modules" fill="currentColor"${path}></path>
    </svg>
  </div>`;

const root = () => document.querySelector<HTMLElement>(".sk-qr-code")!;
const d = () => document.querySelector(`.${qrCodeParts.modules}`)!.getAttribute("d");
const viewBox = () => document.querySelector(`.${qrCodeParts.frame}`)!.getAttribute("viewBox");
/* MutationObserver callbacks run as a microtask. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("QRCode (Vanilla): drawn at runtime", () => {
  it("draws the value with the same geometry every other binding uses", () => {
    document.body.innerHTML = shell('data-value="https://example.com/u/42" data-level="H"');
    mountQrCode(document);
    const expected = qrGeometry("https://example.com/u/42", { level: "H" });
    expect(d()).toBe(expected.path);
    expect(viewBox()).toBe(`0 0 ${expected.extent} ${expected.extent}`);
  });

  it("reads shape, mask, quiet zone and the logo ratio the way the contract names them", () => {
    document.body.innerHTML = shell(
      'data-value="hola" data-module-shape="dot" data-mask="2" data-quiet-zone="1" style="--sk-qr-code-logo-ratio: 0.2"',
    );
    mountQrCode(document);
    expect(d()).toBe(qrGeometry("hola", { moduleShape: "dot", mask: "2", quietZone: 1, logoRatio: 0.2 }).path);
  });

  it("draws again when the value changes, without re-mounting", async () => {
    document.body.innerHTML = shell('data-value="primero"');
    mountQrCode(document);
    const first = d();
    root().setAttribute("data-value", "segundo");
    await settle();
    expect(d()).not.toBe(first);
    expect(d()).toBe(qrGeometry("segundo").path);
  });

  it("follows a change of level or shape too", async () => {
    document.body.innerHTML = shell('data-value="nivel"');
    mountQrCode(document);
    root().setAttribute("data-level", "L");
    await settle();
    expect(d()).toBe(qrGeometry("nivel", { level: "L" }).path);
    root().setAttribute("data-module-shape", "rounded");
    await settle();
    expect(d()).toBe(qrGeometry("nivel", { level: "L", moduleShape: "rounded" }).path);
  });

  it("does not encode a symbol drawn at build time a second time, but redraws it when it changes", async () => {
    /* A deliberately wrong path, so "left alone" is observable: re-encoding on load would replace it. */
    document.body.innerHTML = shell('data-value="emitido"', ' d="M4 4h7v1h-7z"');
    mountQrCode(document);
    expect(d()).toBe("M4 4h7v1h-7z");
    root().setAttribute("data-value", "cambiado");
    await settle();
    expect(d()).toBe(qrGeometry("cambiado").path);
  });

  it("does nothing on markup with no value to draw", () => {
    document.body.innerHTML = shell();
    mountQrCode(document);
    expect(d()).toBeNull();
  });

  it("empties the drawing and marks the root when the value cannot be encoded, never keeping the old code", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = shell('data-value="corto"');
    mountQrCode(document);
    expect(d()).not.toBe("");
    root().setAttribute("data-value", "x".repeat(5000));
    await settle();
    expect(d()).toBe("");
    expect(root().hasAttribute(qrCodeAttrs.error)).toBe(true);
    expect(warn).toHaveBeenCalledOnce();
    /* And it recovers as soon as the value fits again. */
    root().setAttribute("data-value", "corto");
    await settle();
    expect(d()).toBe(qrGeometry("corto").path);
    expect(root().hasAttribute(qrCodeAttrs.error)).toBe(false);
  });

  it("stops following changes once disconnected", async () => {
    document.body.innerHTML = shell('data-value="antes"');
    const disconnect = connectQrCode(root());
    disconnect();
    root().setAttribute("data-value", "después");
    await settle();
    expect(d()).toBe(qrGeometry("antes").path);
  });

  it("does nothing on markup without the frame, rather than inventing it", () => {
    document.body.innerHTML = `<div class="sk-qr-code" data-sk-qr-code data-value="x"></div>`;
    expect(() => mountQrCode(document)).not.toThrow();
    expect(root().querySelector("svg")).toBeNull();
  });
});

describe("QRCode (Vanilla): export", () => {
  const drawn = () => {
    document.body.innerHTML = shell('data-value="https://example.com/export" data-level="H"');
    mountQrCode(document);
    return root();
  };

  it("exports the symbol as it is drawn, as a self-contained SVG", () => {
    const svg = qrCodeToSvg(drawn(), { size: 512 });
    const { path, extent } = qrGeometry("https://example.com/export", { level: "H" });
    expect(svg).toContain('width="512" height="512"');
    expect(svg).toContain(`viewBox="0 0 ${extent} ${extent}"`);
    expect(svg).toContain(`<path d="${path}"`);
    /* No token survives into a file: colours are literal, and the paper is painted. */
    expect(svg).not.toContain("var(");
    expect(svg).toContain("<rect");
  });

  it("carries an SVG logo along, sized to the cleared hole", () => {
    document.body.innerHTML = shell('data-value="logo" data-level="H" style="--sk-qr-code-logo-ratio: 0.2"').replace(
      "</svg>\n  </div>",
      '</svg><div class="sk-qr-code__logo"><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg></div>\n  </div>',
    );
    mountQrCode(document);
    const svg = qrCodeToSvg(root());
    expect(svg).toContain("<circle");
    expect(svg).not.toContain('width="24"');
    expect(qrCodeToSvg(root(), { includeLogo: false })).not.toContain("<circle");
  });

  it("reads the standard polarity for a file, and leaves the component's own attribute as it was", () => {
    const qr = drawn();
    qr.setAttribute("data-polarity", "auto");
    const seen: (string | null)[] = [];
    const observer = new MutationObserver((records) => records.forEach((r) => seen.push((r.target as Element).getAttribute("data-polarity"))));
    observer.observe(qr, { attributes: true, attributeFilter: ["data-polarity"] });
    qrCodeToSvg(qr);
    observer.takeRecords().forEach((r) => seen.push((r.target as Element).getAttribute("data-polarity")));
    observer.disconnect();
    expect(qr.getAttribute("data-polarity")).toBe("auto");
    /* `as-drawn` does not touch it at all. */
    qrCodeToSvg(qr, { polarity: "as-drawn" });
    expect(qr.getAttribute("data-polarity")).toBe("auto");
  });

  it("refuses to export a symbol that has nothing drawn", () => {
    document.body.innerHTML = shell();
    expect(() => qrCodeToSvg(root())).toThrow(QrExportError);
  });

  it("downloads an SVG with the type's own extension", async () => {
    const created = vi.fn(() => "blob:qr");
    const revoked = vi.fn();
    Object.assign(URL, { createObjectURL: created, revokeObjectURL: revoked });
    const clicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this);
    });
    await downloadQrCode(drawn(), { type: "image/svg+xml", fileName: "invitacion" });
    expect(clicks).toHaveLength(1);
    expect(clicks[0]!.download).toBe("invitacion.svg");
    expect(clicks[0]!.href).toBe("blob:qr");
    const blob = (created.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("image/svg+xml");
    /* The link does not stay in the page. */
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("says so, rather than failing silently, where no canvas exists for a raster", async () => {
    /* jsdom has no canvas: exactly the case where only SVG can be produced. */
    await expect(qrCodeToBlob(drawn(), { type: "image/png" })).rejects.toThrow(QrExportError);
  });
});
