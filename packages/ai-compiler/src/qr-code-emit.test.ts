import { describe, expect, it } from "vitest";
import { emitMarkup, emitReactSource } from "./emit.js";
import { validateUsageTree } from "./validate.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * The QRCode contract end to end, because it is the first user of `attrComputed` and the only place in
 * the catalogue where an ATTRIBUTE rather than a collection or a style comes out of a computation.
 */
const tree: UsageTree = {
  contract: "qr-code",
  signature: "QRCode",
  options: { value: "https://ui.skryensya.dev", label: "Open the site", level: "Q" },
};

describe("qr-code emission", () => {
  it("is valid against its contract", () => {
    const problems = validateUsageTree(tree).problems.filter((p) => p.severity === "error");
    expect(problems.map((p) => `${p.path}: ${p.message}`)).toEqual([]);
  });

  it("computes the path and viewBox into the markup, and states what it encodes", () => {
    const markup = emitMarkup(tree, { fillDefaults: false });

    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Open the site"');
    expect(markup).toMatch(/viewBox="0 0 \d+ \d+"/);
    expect(markup).toMatch(/<path[^>]*d="M/);
    /* The value and the level are attributes: the Vanilla enhancer reads them to redraw the symbol
       when they change, and mounts on `data-sk-qr-code`. */
    expect(markup).toContain('data-value="https://ui.skryensya.dev"');
    expect(markup).toContain('data-level="Q"');
    expect(markup).toContain("data-sk-qr-code");
  });

  it("emits a React component that computes the same symbol at render", () => {
    const { component } = emitReactSource(tree, { component: "Example" });

    expect(component).toContain('from "@skryensya/react/qr-code"');
    expect(component).toContain("<QRCode");
    expect(component).toContain('value="https://ui.skryensya.dev"');
    /* The React side takes the VALUE and computes the geometry itself, so the snippet must not
       carry a baked path: that would be a symbol frozen at build time in a live component. */
    expect(component).not.toContain("viewBox");
  });
});
