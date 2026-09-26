import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import type { Invariant } from "./case.js";
import { evalCases } from "./index.js";
import { brokenInvariants, malformedInvariants } from "./invariants.js";

/*
 * The predicates, one question each, against a small tree whose answers can be read off by eye.
 * `run.ts` covers the other half: every reference tree passes its own invariants, and every
 * counterexample validates and still breaks one.
 */

const heading: UsageTree = { contract: "typography", signature: "Heading", children: "Hi" };
const link = (href: string): UsageTree => ({ contract: "list", signature: "ListItemLink", options: { href }, slots: { title: href } });
const page: UsageTree = {
  contract: "layout",
  signature: "Stack",
  children: [
    { contract: "hero", signature: "Hero", children: { contract: "layout", signature: "Stack", children: [heading] } },
    { contract: "list", signature: "List", children: [link("#a"), link("mailto:x@example.com"), link("/c")] },
    {
      contract: "tabs",
      signature: "Tabs",
      attrs: { "aria-label": "T" },
      slots: { items: [{ options: { value: "a" }, slots: { label: "A", children: { contract: "button", signature: "Button.navigation", options: { href: "#x" }, children: "Go" } } }] },
    },
  ],
};
const broken = (invariant: Omit<Invariant, "because">) => brokenInvariants(page, [{ ...invariant, because: "why" } as Invariant]);

describe("uses and avoids", () => {
  it("uses: at least one of them, anywhere", () => {
    expect(broken({ uses: ["Switch", "Heading"] })).toEqual([]);
    expect(broken({ uses: ["Switch"] })).toEqual(["uses none of Switch: why"]);
  });

  it("avoids: none of them, anywhere, including inside a collection entry", () => {
    expect(broken({ avoids: ["Switch"] })).toEqual([]);
    expect(broken({ avoids: ["Switch", "Button.navigation"] })).toEqual(["uses Button.navigation: why"]);
  });
});

describe("count", () => {
  it("counts every node of the signatures, together", () => {
    expect(broken({ count: { signature: "ListItemLink", min: 3 } })).toEqual([]);
    expect(broken({ count: { signature: "ListItemLink", min: 4 } })).toEqual(["has 3 ListItemLink, needs at least 4: why"]);
    expect(broken({ count: { signature: ["ListItemLink", "Button.navigation"], exactly: 4 } })).toEqual([]);
    expect(broken({ count: { signature: "ListItemLink", max: 2 } })).toEqual(["has 3 ListItemLink, allows at most 2: why"]);
    expect(broken({ count: { signature: "ListItemLink", exactly: 2 } })).toEqual(["has 3 ListItemLink, needs exactly 2: why"]);
  });
});

describe("contains", () => {
  it("looks at any depth below the ancestor, and only below it", () => {
    expect(broken({ contains: { ancestor: "Hero", descendant: "Heading" } })).toEqual([]);
    expect(broken({ contains: { ancestor: "Tabs", descendant: "Button.navigation" } })).toEqual([]);
    expect(broken({ contains: { ancestor: "Hero", descendant: "ListItemLink" } })).toEqual(["no Hero contains a ListItemLink: why"]);
    expect(broken({ contains: { ancestor: "Heading", descendant: "Heading" } })).toEqual(["no Heading contains a Heading: why"]);
  });

  it("says so when the ancestor is not there at all", () => {
    expect(broken({ contains: { ancestor: "Navbar", descendant: "Heading" } })).toEqual(["has no Navbar to contain Heading: why"]);
  });
});

describe("option", () => {
  it("tests a value by equality or prefix, optionally below an ancestor", () => {
    expect(broken({ option: { signature: "ListItemLink", name: "href", startsWith: "mailto:" } })).toEqual([]);
    expect(broken({ option: { signature: "ListItemLink", name: "href", equals: "/c" } })).toEqual([]);
    expect(broken({ option: { signature: "Button.navigation", name: "href", startsWith: "#", within: "Tabs" } })).toEqual([]);
    expect(broken({ option: { signature: "Button.navigation", name: "href", startsWith: "#", within: "Hero" } })).toEqual([
      'no Button.navigation inside Hero has href starting with "#": why',
    ]);
    expect(broken({ option: { signature: "ListItemLink", name: "href", equals: "/d" } })).toEqual(['no ListItemLink has href = "/d": why']);
  });

  it("reads an omitted option as the contract's default", () => {
    expect(broken({ option: { signature: "Hero", name: "surface", equals: "surface" } })).toEqual([]);
  });
});

describe("before and anchors", () => {
  const sectioned: UsageTree = {
    contract: "layout",
    signature: "Stack",
    children: [
      { contract: "hero", signature: "Hero", children: [heading, { contract: "button", signature: "Button.navigation", options: { href: "#work" }, children: "Go" }] },
      { contract: "layout", signature: "Stack", attrs: { id: "work" }, children: [heading, { contract: "list", signature: "List", children: [link("/a")] }] },
      { contract: "layout", signature: "Stack", attrs: { id: "contact" }, children: [link("mailto:x@example.com")] },
    ],
  };
  const holds = (invariant: Omit<Invariant, "because">) => brokenInvariants(sectioned, [{ ...invariant, because: "why" } as Invariant]);

  it("before: document order of the first occurrences", () => {
    expect(holds({ before: { first: "Hero", then: "List" } })).toEqual([]);
    expect(holds({ before: { first: "List", then: "Hero" } })).toEqual(["the first Hero comes before the first List: why"]);
    expect(holds({ before: { first: "Navbar", then: "Hero" } })).toEqual(["has no Navbar: why"]);
  });

  it("anchors: follows #id to the section and checks what it holds", () => {
    expect(holds({ anchors: { from: "Button.navigation", within: "Hero", to: ["List", ["ListItemLink", "ListItem"]] } })).toEqual([]);
    expect(holds({ anchors: { from: "Button.navigation", within: "Hero", to: ["Avatar.image"] } })).toEqual([
      "Button.navigation inside Hero: #work holds no Avatar.image: why",
    ]);
    expect(holds({ anchors: { from: "ListItemLink", to: ["List"] } })).toEqual(["no ListItemLink links to a section of the page: why"]);
    const dangling = brokenInvariants(page, [{ anchors: { from: "ListItemLink", to: ["List"] }, because: "why" }]);
    expect(dangling).toEqual(["ListItemLink: #a names no id in the page: why"]);
  });
});

describe("anyOf", () => {
  it("holds when one branch does, and lists every branch's failure when none does", () => {
    expect(broken({ anyOf: [{ uses: ["Main"] }, { uses: ["Hero"] }] })).toEqual([]);
    expect(broken({ anyOf: [{ uses: ["Main"] }, { option: { signature: "Hero", name: "heroElement", equals: "main" } }] })).toEqual([
      'none of: uses none of Main; no Hero has heroElement = "main": why',
    ]);
  });
});

describe("well-formedness", () => {
  it("refuses a count with no bound, a count with both kinds, and an option with no test", () => {
    const malformed = malformedInvariants([
      { count: { signature: "X" }, because: "" },
      { count: { signature: "X", exactly: 1, min: 1 }, because: "" },
      { option: { signature: "X", name: "y" }, because: "" },
      { anyOf: [], because: "" },
    ]);
    expect(malformed).toHaveLength(4);
  });

  it("holds for every case in the corpus", () => {
    for (const evalCase of evalCases) expect(malformedInvariants(evalCase.invariants), evalCase.id).toEqual([]);
  });
});

describe("the corpus", () => {
  it("every reference tree and alternative satisfies its invariants; every counterexample breaks one", () => {
    for (const evalCase of evalCases) {
      expect(brokenInvariants(evalCase.tree, evalCase.invariants), evalCase.id).toEqual([]);
      for (const alternative of evalCase.alternatives ?? []) {
        expect(brokenInvariants(alternative.tree, evalCase.invariants), `${evalCase.id}: ${alternative.because}`).toEqual([]);
      }
      for (const counter of evalCase.counterexamples ?? []) {
        expect(brokenInvariants(counter.tree, evalCase.invariants).length, `${evalCase.id}: ${counter.because}`).toBeGreaterThan(0);
      }
    }
  });
});
