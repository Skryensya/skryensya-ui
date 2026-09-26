import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ContractTemplate } from "./contract.js";
import { stickerContract, stickerParts } from "./sticker.js";

const css = readFileSync(fileURLToPath(new URL("../css/components/sticker.css", import.meta.url)), "utf8");
const signature = stickerContract.signatures.Sticker;

/** Every template node, depth first, so a test can ask where a part or option lands. */
function nodes(node: ContractTemplate): ContractTemplate[] {
  return [node, ...(node.children ?? []).flatMap(nodes)];
}

/** One rule's declarations, by its exact selector. */
function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `no rule for ${selector}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("\n  }", start));
}

describe("the sticker contract", () => {
  it("takes its artwork one way, never both and never neither", () => {
    expect(signature.exactlyOneOf).toEqual([["src", "children"]]);
  });

  it("puts src and alt on the image and never on the wrapper", () => {
    const images = nodes(signature.template).filter((n) => n.element === "img");
    expect(images).toHaveLength(2);
    expect(images.every((n) => n.whenGiven === "src")).toBe(true);
    expect(images[0]!.options).toEqual(["src", "alt"]);
    /* The flap's copy is hidden and says nothing, explicitly. */
    expect(images[1]!.options).toEqual(["src"]);
    expect(images[1]!.attrs).toEqual({ alt: "" });
    expect((signature.template as ContractTemplate).options).toBeUndefined();
  });

  it("owes an alt whenever it is given a src, and invents no name otherwise", () => {
    expect(stickerContract.a11y).toHaveLength(1);
    expect(stickerContract.a11y[0]!.when).toEqual({ src: "present" });
    expect(stickerContract.a11y[0]!.requiresOneOf).toEqual(["alt"]);
    const attrs = nodes(signature.template).flatMap((n) => Object.keys(n.attrs ?? {}));
    expect(attrs).not.toContain("role");
    expect(attrs).not.toContain("aria-label");
    expect(attrs).not.toContain("tabindex");
  });

  it("hides the lifting copy from assistive tech and nothing else", () => {
    const flap = nodes(signature.template).find((n) => n.part === "flap")!;
    expect(flap.attrs).toEqual({ "aria-hidden": "true" });
    const hidden = nodes(signature.template).filter((n) => n.attrs?.["aria-hidden"] !== undefined);
    expect(hidden).toEqual([flap]);
  });

  it("lays the artwork down twice, the same part, once flat and once inside the flap", () => {
    const [art, flap] = signature.template.children!;
    expect(art!.part).toBe("art");
    expect(flap!.part).toBe("flap");
    expect(flap!.children!.map((n) => n.part)).toEqual(["art"]);
    /* Every part the contract names is used, and nothing else is. */
    const used = new Set(nodes(signature.template).flatMap((n) => (n.part ? [n.part] : [])));
    expect([...used].sort()).toEqual(Object.keys(stickerParts).sort());
  });

  it("maps state and the peel origin to attributes, in logical vocabulary", () => {
    expect(stickerContract.options.state).toMatchObject({
      values: ["idle", "peeled", "applied"],
      default: "idle",
      attr: "data-state",
    });
    expect(stickerContract.options.peelOrigin.attr).toBe("data-peel-origin");
    for (const origin of stickerContract.options.peelOrigin.values) {
      expect(origin).toMatch(/^block-(start|end)-inline-(start|end)$/);
    }
  });

  it("has no enhancer to mount: state is an attribute and CSS plays it", () => {
    expect("mount" in signature).toBe(false);
  });
});

describe("the sticker stylesheet", () => {
  it("draws the edge and the shadow from the artwork's alpha, never from its box", () => {
    /* A box treatment is exactly what this component exists not to be. */
    expect(css).not.toMatch(/\bbox-shadow\s*:/);
    expect(css).not.toMatch(/\b(border|outline)(-[a-z]+)?\s*:/);
    expect(css).not.toMatch(/\bbackground(-color)?\s*:/);
    /* Eight chained drop-shadows, four on the axes and four on the diagonals. */
    const edge = css.slice(css.indexOf("--sticker-edge:"), css.indexOf(";", css.indexOf("--sticker-edge:")));
    expect(edge.match(/drop-shadow\(/g)).toHaveLength(8);
    expect(rule(".sk-sticker__art")).toContain("filter: var(--sticker-edge) var(--sticker-shadow)");
  });

  it("paints every state from one attribute, so a change of state is a change of attribute", () => {
    for (const state of ["peeled", "applied"]) expect(css).toContain(`.sk-sticker[data-state="${state}"]`);
    /* `idle` is the unqualified root: the default paints without the attribute having to match. */
    expect(rule(".sk-sticker")).toMatch(/--sticker-lift: 0\.5;/);
  });

  it("times its motion with intent tokens only, never a primitive or a literal", () => {
    expect(css).not.toMatch(/--scale-(duration|easing)-/);
    const transitions = css.match(/transition:[^;]+;/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions) {
      expect(t).not.toMatch(/cubic-bezier|\d+ms/);
      for (const duration of t.match(/var\(--motion-[a-z-]+-duration\)/g) ?? []) {
        expect(duration).toMatch(/--motion-(state-change|drag|release)-duration/);
      }
    }
    expect(rule('.sk-sticker[data-state="peeled"]')).toContain("--motion-drag-duration");
    expect(rule('.sk-sticker[data-state="applied"]')).toContain("--motion-release-duration");
  });

  it("drops the travel under reduced motion instead of dropping the states", () => {
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/transition: none/);
    expect(reduced).not.toMatch(/--sticker-(peel|lift|contact):/);
  });

  it("declares a public styling hook for every --sk-sticker-* it sets, and only those", () => {
    const declared = [...new Set([...css.matchAll(/(--sk-sticker-[a-z-]+)\s*:/g)].map((m) => m[1]))].sort();
    expect(declared).toEqual([...stickerContract.hooks].sort());
  });
});
