import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { snippets } from "@skryensya/snippets";
import type { CompiledIndex } from "./artifact.js";
import { discover, termMatchesWord, wordsOf, DISCOVER_MAX_LIMIT } from "./discover.js";
import { buildManifest, canonical } from "./manifest.js";

/*
 * Discovery is only acceptable because it is deterministic and explained (ADR-0026). These tests pin
 * exactly those two properties, plus the written ordering rules, against a small fixture whose
 * expected order can be worked out by hand, and then against the real compiled index.
 */

const REPO = join(import.meta.dirname, "..", "..", "..");
const real = buildManifest(join(REPO, "contracts", "semantic")).index;

const signature = (id: string, extra: Partial<CompiledIndex["contracts"][number]["signatures"][number]> = {}) => ({
  id,
  intent: [],
  host: "div",
  parents: [],
  useWhen: [],
  avoidWhen: [],
  alternatives: [],
  ...extra,
});

const fixture: CompiledIndex = {
  schemaVersion: "test",
  sourceHash: "test",
  contracts: [
    {
      id: "prose-only",
      category: "content",
      css: "a.css",
      signatures: [signature("ProseOnly", { useWhen: ["a toggle for one setting"] })],
    },
    {
      id: "avoid-only",
      category: "forms",
      css: "b.css",
      signatures: [signature("AvoidOnly", { avoidWhen: ["a toggle that applies at once"] })],
    },
    {
      id: "switch",
      category: "forms",
      css: "c.css",
      signatures: [
        signature("Switch", { intent: ["on-off", "immediate-setting"], host: "input", useWhen: ["a toggle"] }),
        signature("SwitchOld", { intent: ["on-off"], deprecated: "Switch" }),
      ],
    },
    {
      id: "nav",
      category: "navigation",
      css: "d.css",
      signatures: [
        signature("Nav", { host: "nav" }),
        signature("NavLink", { host: "a", parents: ["Nav"], intent: ["destination"] }),
      ],
    },
  ],
};

const noSnippets: never[] = [];

describe("the match rule", () => {
  it("splits ids and folds accents the same way on both sides", () => {
    expect(wordsOf("NavListLink")).toEqual(["nav", "list", "link"]);
    expect(wordsOf("Button.navigation")).toEqual(["button", "navigation"]);
    expect(wordsOf("Navegación rápida")).toEqual(["navegacion", "rapida"]);
  });

  it("matches equal words and long shared prefixes, and nothing else", () => {
    expect(termMatchesWord("navigate", "navigation")).toBe(true);
    expect(termMatchesWord("setting", "settings")).toBe(true);
    expect(termMatchesWord("card", "carousel")).toBe(false);
    expect(termMatchesWord("tab", "table")).toBe(false);
    expect(termMatchesWord("tab", "tab")).toBe(true);
  });
});

describe("determinism", () => {
  it("returns the same bytes for the same index and input", () => {
    const input = { query: "a switch that turns a setting on immediately", limit: 30 };
    expect(canonical(discover(real, snippets, input))).toBe(canonical(discover(real, snippets, input)));
  });

  it("does not depend on the order terms are typed in", () => {
    const a = discover(real, snippets, { query: "switch setting" });
    const b = discover(real, snippets, { query: "setting switch" });
    expect(a.candidates.map((c) => c.signature)).toEqual(b.candidates.map((c) => c.signature));
  });
});

describe("evidence", () => {
  it("explains every candidate by field, term and matched value, with no score", () => {
    const result = discover(real, snippets, { query: "switch immediate setting" });
    expect(result.candidates.length).toBeGreaterThan(0);
    for (const candidate of result.candidates) {
      expect(candidate.matched.length, candidate.signature).toBeGreaterThan(0);
      for (const match of candidate.matched) {
        expect(typeof match.field).toBe("string");
        expect(typeof match.term).toBe("string");
        expect(typeof match.value).toBe("string");
      }
      expect(Object.keys(candidate)).not.toContain("score");
    }
    const sw = result.candidates.find((c) => c.signature === "Switch")!;
    expect(sw.matched).toContainEqual({ field: "signature", term: "switch", value: "Switch" });
    expect(sw.examples).toContain("settings-row-with-switch");
  });

  it("carries what a choice needs, so the catalogue does not have to be read to choose", () => {
    const [candidate] = discover(real, snippets, { intents: ["navigation"] }).candidates;
    expect(candidate).toMatchObject({ host: expect.any(String), useWhen: expect.any(Array), avoidWhen: expect.any(Array) });
    expect(candidate!.alternatives.length).toBeGreaterThan(0);
  });
});

describe("the ordering rules", () => {
  it("puts naming-field matches first, then prose, then avoidWhen-only, then catalogue order", () => {
    const order = discover(fixture, noSnippets, { query: "toggle switch" }).candidates.map((c) => c.signature);
    // Switch: naming 1 (switch). ProseOnly: prose 1. AvoidOnly: avoidWhen only.
    expect(order).toEqual(["Switch", "ProseOnly", "AvoidOnly"]);
  });

  it("falls back to catalogue order when counts tie", () => {
    const order = discover(fixture, noSnippets, { query: "toggle" }).candidates.map((c) => c.signature);
    // ProseOnly and Switch both match "toggle" in useWhen only: catalogue order decides.
    expect(order).toEqual(["ProseOnly", "Switch", "AvoidOnly"]);
  });

  it("matches `intents` whole, never by prefix", () => {
    const result = discover(fixture, noSnippets, { intents: ["on-off"] });
    expect(result.candidates.map((c) => c.signature)).toEqual(["Switch"]);
    expect(discover(fixture, noSnippets, { intents: ["on"] }).coverage).toBe("none");
  });
});

describe("filters", () => {
  it("restricts by category, host and declared parent, and says so in the evidence", () => {
    expect(discover(fixture, noSnippets, { category: "forms" }).candidates.map((c) => c.signature)).toEqual(["AvoidOnly", "Switch"]);
    expect(discover(fixture, noSnippets, { host: "A" }).candidates.map((c) => c.signature)).toEqual(["NavLink"]);
    const child = discover(fixture, noSnippets, { parent: "Nav" }).candidates;
    expect(child.map((c) => c.signature)).toEqual(["NavLink"]);
    expect(child[0]!.matched).toContainEqual({ field: "parent-filter", term: "Nav", value: "Nav" });
  });

  it("leaves deprecated signatures out unless asked", () => {
    expect(discover(fixture, noSnippets, { intents: ["on-off"] }).candidates.map((c) => c.signature)).toEqual(["Switch"]);
    expect(
      discover(fixture, noSnippets, { intents: ["on-off"], includeDeprecated: true }).candidates.map((c) => c.signature),
    ).toEqual(["Switch", "SwitchOld"]);
  });
});

describe("coverage and the fallback to get_catalog", () => {
  it("says nothing matched, and points at get_catalog, rather than guessing", () => {
    const result = discover(real, snippets, { query: "zzqx" });
    expect(result.coverage).toBe("none");
    expect(result.candidates).toEqual([]);
    expect(result.unmatchedTerms).toEqual(["zzqx"]);
    expect(result.guidance).toContain("get_catalog");
  });

  it("flags a term that matched nothing as partial coverage", () => {
    const result = discover(fixture, noSnippets, { query: "switch zzqx" });
    expect(result.coverage).toBe("partial");
    expect(result.unmatchedTerms).toEqual(["zzqx"]);
    expect(result.guidance).toContain("get_catalog");
  });

  it("flags a cut by `limit` as partial and reports the total", () => {
    const result = discover(real, snippets, { category: "forms", limit: 2 });
    expect(result.candidates).toHaveLength(2);
    expect(result.truncated).toBe(true);
    expect(result.total).toBeGreaterThan(2);
    expect(result.coverage).toBe("partial");
  });

  it("clamps `limit`", () => {
    expect(discover(real, snippets, { category: "forms", limit: 10_000 }).input.limit).toBe(DISCOVER_MAX_LIMIT);
  });

  it("returns the vocabulary instead of searching when given nothing", () => {
    const result = discover(real, snippets, {});
    expect(result.coverage).toBe("browse");
    expect(result.vocabulary!.intents).toContain("on-off");
    expect(result.vocabulary!.hosts).toContain("button");
    expect(result.categories.reduce((sum, c) => sum + c.families, 0)).toBe(real.contracts.length);
  });
});

describe("examples", () => {
  it("lists examples that use a candidate, or name a term, and never a tree", () => {
    const result = discover(real, snippets, { query: "product card grid" });
    const card = result.examples.find((e) => e.id === "product-card-in-grid");
    expect(card).toBeDefined();
    expect(card!.matched.length + card!.uses.length).toBeGreaterThan(0);
    expect(Object.keys(card!)).not.toContain("tree");
  });
});

describe("naming fields break a naming tie", () => {
  it("puts the signature named by the term above one that only mentions it in an intent", () => {
    const order = discover(real, snippets, { query: "switch" }).candidates.map((c) => c.signature);
    expect(order.indexOf("Switch")).toBeLessThan(order.indexOf("CodePreview.density"));
  });
});
