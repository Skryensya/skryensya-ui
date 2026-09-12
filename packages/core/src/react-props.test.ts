import { describe, expect, it } from "vitest";
import { buttonContract } from "./button.js";
import { comboboxAttrs } from "./combobox.js";
import { getContract, getSignature } from "./registry.js";
import { parseInlineStyle, splitInlineStyle } from "./inline-style.js";
import { jsxPropName, resolveReactProps } from "./react-props.js";
import { rootSelectorFor, selectorsFor } from "./selectors.js";
import type { UsageTree } from "./usage-tree.js";

/*
 * THE MODULES THAT EXIST BECAUSE TWO COPIES DISAGREED, TESTED AT THE SEAM THEY CREATED.
 *
 * `resolveReactProps` was written to collapse two walks that had each shipped a bug the other had
 * already fixed. Its own docstring names three of them. Until this file, none of those three had a
 * regression test and no test anywhere imported this module: the emitter's output was well covered
 * (`ai-compiler/src/emit.test.ts`), the live island had one assertion in the whole repository, and
 * the property the module was created to guarantee was asserted nowhere.
 *
 * These test the RESOLVER, which is the seam both adapters now cross. What each adapter then does
 * with the result (print it, or hand it to createElement) is serialization and stays theirs.
 */

const resolve = (contractId: string, signatureId: string, tree: Omit<UsageTree, "contract" | "signature">) => {
  const contract = getContract(contractId)!;
  const signature = getSignature(contract, signatureId)!;
  return resolveReactProps({ contract: contractId, signature: signatureId, ...tree } as UsageTree, contract, signature);
};

describe("resolveReactProps", () => {
  it("keeps a number a number, which is the bug that printed defaultValue=\"65\"", () => {
    const { props } = resolve("number-field", "NumberField", { options: { defaultValue: 65 } });
    const entry = props.find((p) => p.name === "defaultValue");
    expect(entry?.value).toBe(65);
    expect(typeof entry?.value).toBe("number");
  });

  it("parses an authored style string into an object, never passes the string on", () => {
    const { style } = resolve("badge", "Badge", { attrs: { style: "--sk-badge-bg: red; color: white" } });
    /* React throws at runtime on a string `style`; both paths used to hit that from their own copy. */
    expect(style).toEqual({ "--sk-badge-bg": "red", color: "white" });
  });

  it("gives a styleProperty option BOTH a style entry and the named prop", () => {
    /* Sidebar reads the named prop and builds its own style entry; Carousel reads `style`. Passing
     * only one of the two left one of them with nothing. */
    const { props, style } = resolve("sidebar", "Sidebar", { options: { minInlineSize: "12rem" } });
    expect(style).toMatchObject({ "--sk-sidebar-min-inline-size": "12rem" });
    expect(props.find((p) => p.name === "minInlineSize")?.value).toBe("12rem");
  });

  it("lets an authored style win over an option style for the same property", () => {
    /* The two paths disagreed here and nobody noticed: the snippet let the author win (last key in
     * one object literal), the island let the option win (spread order). Decided once, here. */
    const { style } = resolve("sidebar", "Sidebar", {
      options: { minInlineSize: "12rem" },
      attrs: { style: "--sk-sidebar-min-inline-size: 99rem" },
    });
    expect(style?.["--sk-sidebar-min-inline-size"]).toBe("99rem");
  });

  it("renames an option to the binding's own prop when the contract says so", () => {
    const { props } = resolve("typography", "Heading", { options: { headingSize: "h3" } });
    /* `headingSize` is `size` on the React component; the contract declares the remap. */
    expect(props.map((p) => p.name)).toContain("size");
    expect(props.map((p) => p.name)).not.toContain("headingSize");
  });

  it("is declaration-driven, so props come back in the contract's own order", () => {
    const declared = Object.keys(buttonContract.options);
    const { props } = resolve("button", "Button.action", { options: { tone: "danger", variant: "soft" } });
    const names = props.map((p) => p.name);
    const positions = names.map((n) => declared.indexOf(n)).filter((i) => i >= 0);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("carries the declaration through, so a serializer can tell a default from a value", () => {
    const { props } = resolve("button", "Button.action", { options: { tone: "danger" } });
    expect(props.find((p) => p.name === "tone")?.option?.default).toBe("neutral");
  });

  it("omits an option the tree never gave", () => {
    const { props } = resolve("badge", "Badge", { options: {} });
    expect(props).toEqual([]);
  });
});

describe("jsxPropName", () => {
  it("uses React's spelling for the handful that differ", () => {
    expect(jsxPropName("class")).toBe("className");
    expect(jsxPropName("for")).toBe("htmlFor");
    expect(jsxPropName("tabindex")).toBe("tabIndex");
  });

  it("leaves aria-* and data-* hyphenated, which JSX wants", () => {
    expect(jsxPropName("aria-label")).toBe("aria-label");
    expect(jsxPropName("data-sk-menu")).toBe("data-sk-menu");
  });
});

describe("inline style", () => {
  it("camelCases an ordinary property and leaves a custom property verbatim", () => {
    /* React only recognises a custom property when the key is written exactly as authored. */
    expect(parseInlineStyle("--sk-avatar-bg: red; block-size: 12rem")).toEqual([
      ["--sk-avatar-bg", "red"],
      ["blockSize", "12rem"],
    ]);
  });

  it("leaves every name alone for the binding that speaks CSS", () => {
    /* Markup emission borrowing the camelCasing turned `block-size` into `blockSize` inside a real
     * style attribute, which a browser ignores in silence. */
    expect(splitInlineStyle("block-size: 12rem")).toEqual([["block-size", "12rem"]]);
  });

  it("splits on the first colon only, so a url or a time survives", () => {
    expect(splitInlineStyle("background: url(http://x/y.png)")).toEqual([
      ["background", "url(http://x/y.png)"],
    ]);
  });

  it("drops a declaration with no value rather than inventing one", () => {
    expect(splitInlineStyle("color:; block-size: 1px")).toEqual([["block-size", "1px"]]);
  });
});

describe("selectors", () => {
  it("wraps every mount attribute and keeps the keys", () => {
    const selector = selectorsFor(comboboxAttrs);
    expect(selector.input).toBe("[data-sk-combobox-input]");
    expect(Object.keys(selector)).toEqual(Object.keys(comboboxAttrs));
  });

  it("gives a mount shim the one string it needs", () => {
    expect(rootSelectorFor(comboboxAttrs)).toBe("[data-sk-combobox]");
  });
});
