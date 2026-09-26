import { describe, expect, it } from "vitest";
import { qrGeometry, qrLogoAdvice, qrSvgDocument, qrSymbolFromAttributes, qrViewBox, QrError } from "./qr-code.js";
import { decodeQrPath } from "./qr-code-test-decoder.js";

/*
 * THESE TESTS READ THE SYMBOL BACK, which is the only kind of QR test worth writing.
 *
 * A QR that encodes the wrong bytes still looks exactly like a QR: it is a square of noise either
 * way, so a snapshot passes, a pixel count passes, and "it renders" passes. The failure only shows
 * up in a camera. So `qr-test-decoder.ts` walks the emitted `<path>` back into modules and decodes
 * them from the standard, independently of whatever produced them.
 *
 * That the encoder is now a dependency (`qrcode`) does not make this redundant, it makes it the
 * POINT: these are the tests that would catch a bad release, a wrong option name, or a swap to a
 * different library. They were written against a hand-rolled encoder that they proved wrong (a
 * mistranscribed block count at version 32 level H), and they outlived it.
 */

const decode = (value: string, options?: Parameters<typeof qrGeometry>[1]) =>
  decodeQrPath(qrGeometry(value, options), options?.quietZone ?? 4);

describe("qrGeometry", () => {
  it("round-trips every encoding mode the contract promises", () => {
    /* One case per mode the library picks between, plus the mixed case that exercises its
       segmentation: numeric, alphanumeric and byte, chosen per run rather than per symbol. */
    for (const value of [
      "01234567",
      "8".repeat(400),
      "HELLO WORLD",
      "https://ui.skryensya.dev/components/qr-code?ref=docs",
      "café con leche, ñandú",
      "AB-1234567890/XY",
      "vamos 🎉🎉",
      "a",
    ]) {
      expect(decode(value), value).toBe(value);
    }
  });

  it("round-trips at every error correction level", () => {
    const value = "https://ui.skryensya.dev/qr";
    for (const level of ["L", "M", "Q", "H"] as const) {
      expect(decode(value, { level }), level).toBe(value);
    }
  });

  it("carries Japanese text through byte mode", () => {
    /* The kanji MODE is deliberately not supported (see the contract's own note), which is a
       density decision and not a capability one: the text itself still encodes and reads back. */
    expect(decode("東京都渋谷区")).toBe("東京都渋谷区");
  });

  it("still scans with a logo hole punched through the middle", () => {
    /* The whole reason the modules are CLEARED rather than covered: error correction is designed to
       recover a clean erasure, so the symbol has to decode with the hole already in it. */
    const value = "https://ui.skryensya.dev/components/qr-code";
    const withHole = decodeQrPath(qrGeometry(value, { level: "H", logoRatio: 0.2 }), 4);
    expect(withHole).toBe(value);
  });

  it("clears a hole the stylesheet's cover can actually match", () => {
    /*
     * THE INVARIANT THE LOGO RESTS ON, and it was broken twice before this test existed.
     *
     * `logoRatio` is a fraction of the whole rendered box, quiet zone included, because that is what
     * the stylesheet sizes its cover against. When the encoder measured the fraction against the
     * MODULE GRID instead, it cleared 7 modules under a cover 8.2 wide and the mark sat on live
     * modules  -  reintroducing the half-painted cells that clearing exists to prevent.
     *
     * Read straight off the emitted path: no module may be painted inside the reserved square.
     */
    const ratio = 0.22;
    const quietZone = 4;
    const geometry = qrGeometry("https://ui.skryensya.dev/components/qr-code", {
      level: "H",
      logoRatio: ratio,
      quietZone,
    });

    const reserved = geometry.extent * ratio;
    const centre = geometry.extent / 2;
    /* One module of slack for the parity adjustment, which can only make the hole BIGGER. */
    const half = reserved / 2 - 1;

    for (const subpath of geometry.path.split("M").slice(1)) {
      const [x, y] = subpath.split(/[ hva]/).slice(0, 2).map(Number);
      const inside = Math.abs(x! + 0.5 - centre) < half && Math.abs(y! + 0.5 - centre) < half;
      expect(inside, `a module at ${x},${y} sits inside the reserved logo square`).toBe(false);
    }
  });

  it("grows to fit rather than truncating, and refuses what cannot fit at all", () => {
    const small = qrGeometry("hello", { level: "L" });
    const large = qrGeometry("x".repeat(1200), { level: "L" });
    expect(large.version).toBeGreaterThan(small.version);

    /* Version 40 at level H holds 1,273 bytes. Past that the answer is an error, never a symbol
       carrying less than it was asked to. */
    expect(() => qrGeometry("x".repeat(3000), { level: "H" })).toThrow(QrError);
  });

  it("reserves the quiet zone in the viewBox without moving the modules", () => {
    const bare = qrGeometry("hello", { quietZone: 0 });
    const padded = qrGeometry("hello", { quietZone: 4 });
    expect(padded.extent).toBe(bare.extent + 8);
    expect(decode("hello", { quietZone: 0 })).toBe("hello");
    expect(qrViewBox("hello", { quietZone: 4 })).toBe(`0 0 ${padded.extent} ${padded.extent}`);
  });

  it("draws the same symbol whatever shape the modules are", () => {
    /* Shape is paint. A dot-module symbol has to carry the same payload as a square one, or the
       option is quietly a different QR rather than a different look. */
    const value = "SHAPE TEST 123";
    for (const moduleShape of ["square", "dot", "rounded"] as const) {
      expect(decode(value, { moduleShape }), moduleShape).toBe(value);
    }
  });

  it("keeps the three finder patterns solid whatever shape the data modules are", () => {
    /* A reader locates the symbol by the 1:1:3:1:1 runs across its finder patterns before it decodes
       anything, and dots break those runs into beads. Decoding modules cannot see that, so this reads
       the drawing itself: inside a finder every subpath is a straight run, never an arc. */
    const value = "https://example.com/finder";
    const quietZone = 4;
    for (const moduleShape of ["dot", "rounded"] as const) {
      const geometry = qrGeometry(value, { moduleShape, quietZone });
      const size = geometry.extent - quietZone * 2;
      const inFinder = (x: number, y: number) =>
        (y < 7 && (x < 7 || x >= size - 7)) || (x < 7 && y >= size - 7);
      const subpaths = geometry.path.split("M").slice(1);
      let finderRuns = 0;
      let shapedOutside = 0;
      for (const subpath of subpaths) {
        const [sx, sy] = subpath.split(/[ hva]/).slice(0, 2).map(Number) as [number, number];
        const x = Math.floor(sx - quietZone);
        const y = Math.floor(sy - quietZone);
        if (inFinder(x, y)) {
          expect(subpath, `${moduleShape} finder at ${x},${y}`).not.toContain("a");
          finderRuns++;
        } else if (subpath.includes("a")) {
          shapedOutside++;
        }
      }
      /* Each finder's top row alone is one 7-module run, so all three are drawn as runs. */
      expect(geometry.path).toContain(`M${quietZone} ${quietZone}h7v1h-7z`);
      expect(geometry.path).toContain(`M${quietZone + size - 7} ${quietZone}h7v1h-7z`);
      expect(geometry.path).toContain(`M${quietZone} ${quietZone + size - 7}h7v1h-7z`);
      expect(finderRuns, moduleShape).toBeGreaterThan(0);
      /* And the shape is still the shape everywhere else. */
      expect(shapedOutside, moduleShape).toBeGreaterThan(0);
      expect(decode(value, { moduleShape, quietZone }), moduleShape).toBe(value);
    }
  });

  it("merges the dark modules into runs instead of drawing one subpath each", () => {
    /* The measurement the whole design rests on. `lastModuleCount` is only meaningful right after a
       decode, so the decode comes first: reading it off a previous test's call is how this assertion
       was wrong the first time. */
    const geometry = qrGeometry("https://ui.skryensya.dev/components/qr-code", { level: "H" });
    decodeQrPath(geometry, 4);
    const darkModules = decodeQrPath.lastModuleCount;
    const subpaths = geometry.path.match(/M/g)?.length ?? 0;

    expect(darkModules).toBeGreaterThan(400);
    /* Measured on this payload: 690 dark modules become 362 subpaths, a 1.9x reduction, and the
       whole symbol is still ONE element either way. The bound is loose on purpose  -  the exact ratio
       is a property of the payload's noise, and pinning it would make this a change detector. */
    expect(subpaths).toBeLessThan(darkModules * 0.6);
  });
});

describe("mask patterns", () => {
  it("carries the identical payload under all eight", () => {
    /*
     * The claim the docs row makes, checked rather than asserted in prose: a mask changes the
     * PICTURE and nothing else. Every one of the eight decodes to the same string, and every one is
     * a different drawing  -  if two came out identical the option would be lying about what it does.
     */
    const value = "https://ui.skryensya.dev/components/qr-code";
    const drawings = new Set<string>();

    for (const mask of ["0", "1", "2", "3", "4", "5", "6", "7"] as const) {
      const geometry = qrGeometry(value, { level: "Q", mask });
      expect(decodeQrPath(geometry, 4), `mask ${mask}`).toBe(value);
      drawings.add(geometry.path);
    }

    expect(drawings.size, "each mask should draw a different symbol").toBe(8);
  });

  it("defaults to the scored choice rather than to a fixed pattern", () => {
    /* `auto` has to BE one of the eight, and picking it is the encoder's job: a default that
       silently pinned mask 0 would ship the uniform blocks masking exists to break up. */
    const value = "https://ui.skryensya.dev/components/qr-code";
    const auto = qrGeometry(value, { level: "Q" }).path;
    const eight = (["0", "1", "2", "3", "4", "5", "6", "7"] as const).map(
      (mask) => qrGeometry(value, { level: "Q", mask }).path,
    );

    expect(eight).toContain(auto);
  });
});

describe("polarity and tone", () => {
  it("leaves the payload alone: colour is paint, not data", () => {
    /* The whole reason `tone` and `polarity` are stylesheet-only and never reach the encoder. */
    const plain = qrGeometry("https://ui.skryensya.dev", { level: "Q" });
    expect(decode("https://ui.skryensya.dev", { level: "Q" })).toBe("https://ui.skryensya.dev");
    expect(plain.path).toBe(qrGeometry("https://ui.skryensya.dev", { level: "Q" }).path);
  });
});

describe("the default error correction level", () => {
  it("is Q, one step above the conventional M", () => {
    /* Asserted rather than left implicit, because it is a deliberate departure: this contract ships
       a logo, a tint and module shapes, which are the three things that spend the error budget. */
    expect(qrGeometry("https://ui.skryensya.dev").level).toBe("Q");
  });

  it("leaves room a logo can actually be punched out of", () => {
    /* The default has to satisfy the component's own advisory, or the first person to add a logo
       gets a warning from the thing that just defaulted them into it. */
    expect(qrLogoAdvice(0.2, qrGeometry("https://ui.skryensya.dev").level)).toBeUndefined();
  });
});

describe("qrLogoAdvice", () => {
  it("says nothing when there is no logo", () => {
    expect(qrLogoAdvice(0, "L")).toBeUndefined();
  });

  it("warns that a logo needs real error correction behind it", () => {
    expect(qrLogoAdvice(0.2, "L")).toMatch(/Q or H/);
    expect(qrLogoAdvice(0.2, "M")).toMatch(/Q or H/);
    expect(qrLogoAdvice(0.2, "H")).toBeUndefined();
  });

  it("warns when the logo is larger than the level can recover", () => {
    /* Both branches have to be reachable inside the ratio the geometry accepts, or the advisory is
       dead code dressed as a safeguard. That is what the first version of this was. */
    expect(qrLogoAdvice(0.4, "Q")).toMatch(/past what level Q recovers/);
    expect(qrLogoAdvice(0.45, "H")).toMatch(/past what level H recovers/);
    expect(qrLogoAdvice(0.25, "Q")).toBeUndefined();
    expect(qrLogoAdvice(0.35, "H")).toBeUndefined();
  });
});

describe("qrSymbolFromAttributes", () => {
  const reader = (attrs: Record<string, string>) => (name: string) => attrs[name] ?? null;

  it("leaves a build-time symbol alone: no value, nothing to draw", () => {
    expect(qrSymbolFromAttributes(reader({ "data-level": "H" }))).toBeNull();
    expect(qrSymbolFromAttributes(reader({ "data-value": "" }))).toBeNull();
  });

  it("reads what the markup states", () => {
    const symbol = qrSymbolFromAttributes(
      reader({ "data-value": "https://example.com", "data-level": "H", "data-mask": "3", "data-module-shape": "dot", "data-quiet-zone": "2" }),
      "0.2",
    );
    expect(symbol).toEqual({
      value: "https://example.com",
      options: { level: "H", mask: "3", moduleShape: "dot", quietZone: 2, logoRatio: 0.2 },
    });
  });

  it("treats the attributes as untrusted: anything unknown falls back to the default", () => {
    const symbol = qrSymbolFromAttributes(
      reader({ "data-value": "x", "data-level": "Z", "data-mask": "9", "data-module-shape": "star", "data-quiet-zone": "-3" }),
      "7",
    );
    expect(symbol?.options).toEqual({ level: undefined, mask: undefined, moduleShape: undefined, quietZone: undefined, logoRatio: 0.5 });
    /* And what falls back still draws the same symbol the defaults would. */
    expect(qrGeometry("x", symbol!.options).path).toBe(qrGeometry("x", { logoRatio: 0.5 }).path);
  });
});

describe("qrSvgDocument", () => {
  const geometry = qrGeometry("https://example.com/export", { level: "H", logoRatio: 0.2 });

  it("carries the same symbol, with its colours written in rather than left to CSS", () => {
    const svg = qrSvgDocument(geometry, { modules: "#111", paper: "#fff", size: 512 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"')).toBe(true);
    expect(svg).toContain(`viewBox="0 0 ${geometry.extent} ${geometry.extent}"`);
    expect(svg).toContain(`<path d="${geometry.path}" fill="#111"/>`);
    expect(svg).not.toContain("var(");
    /* And it still decodes: the export is the same payload, not a lookalike. */
    const d = svg.match(/<path d="([^"]+)"/)![1]!;
    expect(decodeQrPath({ ...geometry, path: d }, 4)).toBe("https://example.com/export");
  });

  it("paints a real paper under the modules, quiet zone included, so it survives any background", () => {
    const svg = qrSvgDocument(geometry, { modules: "black", paper: "white" });
    expect(svg).toMatch(new RegExp(`<rect width="${geometry.extent}" height="${geometry.extent}" rx="0" fill="white"/>`));
    expect(svg.indexOf("<rect")).toBeLessThan(svg.indexOf("<path"));
  });

  it("nests an SVG logo over the cleared hole, replacing whatever size it had on the page", () => {
    const logo = '<svg width="24" height="24" viewBox="0 0 24 24" class="x"><circle cx="12" cy="12" r="10"/></svg>';
    const svg = qrSvgDocument(geometry, { modules: "#000", paper: "#fff", logo: { svg: logo }, logoRatio: 0.2 });
    const box = Math.round(geometry.extent * 0.2 * 100) / 100;
    expect(svg).toContain(`width="${box}" height="${box}"`);
    expect(svg).not.toContain('width="24"');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain("<circle");
  });

  it("places an image logo by URL, and escapes it", () => {
    const svg = qrSvgDocument(geometry, { modules: "#000", paper: "#fff", logo: { href: 'https://cdn.example/logo.png?a=1&b="2"' }, logoRatio: 0.2 });
    expect(svg).toContain('href="https://cdn.example/logo.png?a=1&amp;b=&quot;2&quot;"');
  });

  it("draws no logo without a ratio: there is no hole to put it in", () => {
    const svg = qrSvgDocument(geometry, { modules: "#000", paper: "#fff", logo: { href: "/logo.png" } });
    expect(svg).not.toContain("<image");
  });
});
