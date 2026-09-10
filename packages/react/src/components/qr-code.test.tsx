import { qrGeometry } from "@skryensya/core/qr-code";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QRCode } from "./qr-code.js";

/*
 * The React binding's own job is small on purpose: the geometry comes from Core, so what is left to
 * test here is that the component asks for the right symbol and names it correctly. The question of
 * whether that symbol actually decodes belongs to `@skryensya/core`'s own suite, which reads it back
 * through an independent decoder; repeating it here would test the same function twice.
 */
describe("QRCode", () => {
  it("paints the same geometry the markup emitter would", () => {
    /* The claim the whole two-binding arrangement rests on: one encoder, called from both sides. */
    const ui = render(<QRCode label="Open the site" value="https://ui.skryensya.dev" />);
    const path = ui.container.querySelector("path");

    expect(path?.getAttribute("d")).toBe(qrGeometry("https://ui.skryensya.dev").path);
  });

  it("names the code by what it does, not by its value", () => {
    /* A QR labelled with its own URL is read out character by character, which is worse than no
       label; the contract requires the caller to say what scanning it accomplishes. */
    const ui = render(<QRCode label="Menu of the day" value="https://example.test/menu" />);
    const root = ui.getByRole("img", { name: "Menu of the day" });

    expect(root.className).toContain("sk-qr-code");
    expect(root.textContent).not.toContain("https://");
  });

  it("hides the symbol itself from assistive technology", () => {
    /* The `<svg>` is a picture of the payload, and the root already carries the name: exposing the
       inner graphic would announce a second, nameless image. */
    const ui = render(<QRCode label="Open the site" value="https://ui.skryensya.dev" />);
    const svg = ui.container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
  });

  it("re-encodes when the value changes", () => {
    const ui = render(<QRCode label="Open" value="first" />);
    const before = ui.container.querySelector("path")?.getAttribute("d");

    ui.rerender(<QRCode label="Open" value="second" />);
    const after = ui.container.querySelector("path")?.getAttribute("d");

    expect(after).not.toBe(before);
    expect(after).toBe(qrGeometry("second").path);
  });

  it("renders a logo only when one is given", () => {
    const without = render(<QRCode label="Open" value="https://ui.skryensya.dev" />);
    expect(without.container.querySelector(".sk-qr-code__logo")).toBeNull();

    const withLogo = render(
      <QRCode label="Open" logo={<span>logo</span>} logoRatio={0.2} value="https://ui.skryensya.dev" />,
    );
    expect(withLogo.container.querySelector(".sk-qr-code__logo")?.textContent).toBe("logo");
  });

  it("clears the modules behind a logo rather than covering them", () => {
    /* The hole has to be in the PATH, not merely hidden by a box on top: a scanner reads the
       modules, and half-covered ones are noise where cleared ones are a recoverable erasure. */
    const plain = qrGeometry("https://ui.skryensya.dev", { level: "H" });
    const holed = qrGeometry("https://ui.skryensya.dev", { level: "H", logoRatio: 0.2 });

    expect(holed.path).not.toBe(plain.path);
    expect(holed.path.length).toBeLessThan(plain.path.length);
  });

  it("serializes size onto the attribute the stylesheet reads", () => {
    const ui = render(<QRCode label="Open" size="lg" value="https://ui.skryensya.dev" />);
    expect(ui.getByRole("img", { name: "Open" }).getAttribute("data-size")).toBe("lg");
  });
});
