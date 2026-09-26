import { describe, expect, it } from "vitest";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { emitMarkup, emitReactSource } from "./emit.js";
import { sheetsForTree } from "./sheets-for-tree.js";
import { validateUsageTree } from "./validate.js";

/*
 * Sticker at the compiler's boundary: which trees the contract refuses, and the markup the emitter
 * owes authored HTML. The browser half (paint, motion, the two bindings side by side) lives in
 * `ai-gates/src/sticker.spec.ts`.
 */

const rules = (tree: UsageTree) => validateUsageTree(tree).problems.map((p) => p.rule);

const icon: UsageTree = { contract: "icon", signature: "Icon", options: { name: "settings" } };

describe("sticker: one source of artwork", () => {
  it("refuses a sticker with no artwork, which would be an empty silhouette", () => {
    expect(rules({ contract: "sticker", signature: "Sticker" })).toContain("missing-exactly-one");
  });

  it("refuses src and authored artwork together, two pictures in one sticker", () => {
    const tree: UsageTree = {
      contract: "sticker",
      signature: "Sticker",
      options: { src: "/star.png", alt: "Estrella" },
      children: icon,
    };
    expect(rules(tree)).toContain("ambiguous-exactly-one");
  });

  it("accepts either on its own", () => {
    expect(validateUsageTree({ contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "S" } }).valid).toBe(true);
    expect(validateUsageTree({ contract: "sticker", signature: "Sticker", children: icon }).valid).toBe(true);
  });
});

describe("sticker: the image's alt", () => {
  it("is owed once there is an image", () => {
    const tree: UsageTree = { contract: "sticker", signature: "Sticker", options: { src: "/s.png" } };
    expect(rules(tree)).toContain("missing-accessible-name");
  });

  it("may be empty, for decoration", () => {
    const tree: UsageTree = { contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "" } };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("is not asked of authored artwork, whose semantics are its own", () => {
    expect(rules({ contract: "sticker", signature: "Sticker", children: icon })).not.toContain("missing-accessible-name");
  });
});

describe("sticker: options", () => {
  it("refuses a state or origin outside the vocabulary, physical corners included", () => {
    expect(rules({ contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "", state: "stuck" } })).not.toEqual([]);
    expect(
      rules({ contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "", peelOrigin: "bottom-right" } }),
    ).not.toEqual([]);
  });
});

describe("sticker: emitted markup", () => {
  it("writes the src path with the image inside art, the copy in the hidden flap, and defaults on the root", () => {
    const markup = emitMarkup({ contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "Star" } });
    const host = new DOMParserLike(markup);
    expect(host.root).toMatch(/^<span\s+class="sk-sticker"/);
    expect(markup).toContain('data-state="idle"');
    expect(markup).toContain('data-peel-origin="block-end-inline-end"');
    expect(markup).toMatch(/class="sk-sticker__art"[^>]*>\s*<img[^>]*src="\/s\.png"[^>]*alt="Star"/);
    expect(markup).toMatch(/class="sk-sticker__flap"[^>]*aria-hidden="true"/);
    /* Two images: the one a reader meets, and the hidden copy with an empty alt. */
    expect(markup.match(/<img /g)).toHaveLength(2);
    /* An empty alt, which the emitter writes in its presence-only form (`alt`, the same as `alt=""`). */
    expect(markup).toMatch(/<img src="\/s\.png" alt(="")?>/);
    /* Never on the wrapper. */
    expect(host.root).not.toMatch(/\s(src|alt)=/);
  });

  it("maps every option to the attribute the contract names", () => {
    const markup = emitMarkup({
      contract: "sticker",
      signature: "Sticker",
      options: { src: "/s.png", alt: "", state: "peeled", peelOrigin: "block-start-inline-start" },
    });
    expect(markup).toContain('data-state="peeled"');
    expect(markup).toContain('data-peel-origin="block-start-inline-start"');
  });

  it("renders authored artwork twice, once flat and once in the flap, with no img of its own", () => {
    const markup = emitMarkup({ contract: "sticker", signature: "Sticker", options: { state: "applied" }, children: icon });
    expect(markup).not.toContain("<img");
    expect(markup.match(/sk-icon|data-sk-icon/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("emits React from the same tree through the published binding", () => {
    const source = emitReactSource({ contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "Star", state: "applied" } }).component;
    expect(source).toContain('from "@skryensya/react/sticker"');
    expect(source).toMatch(/<Sticker[^>]*state="applied"/);
  });

  it("asks for exactly its own stylesheet", () => {
    const { sheets, unplaced } = sheetsForTree({ contract: "sticker", signature: "Sticker", options: { src: "/s.png", alt: "" } });
    expect(sheets).toEqual(["@skryensya/core/components/sticker.css"]);
    expect(unplaced).toEqual([]);
  });
});

/** The opening tag of the emitted root, so an assertion about the wrapper cannot match its children. */
class DOMParserLike {
  readonly root: string;
  constructor(markup: string) {
    this.root = markup.slice(0, markup.indexOf(">") + 1);
  }
}
