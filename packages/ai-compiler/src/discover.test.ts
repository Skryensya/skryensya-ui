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

  /*
   * Every pair the previous rule (a shared prefix of max(4, shorter - 2)) accepted by accident,
   * found by running the eval prompts against the real index. Each shares a prefix and then
   * diverges, which is what the current rule refuses.
   */
  it.each([
    ["active", "action"],
    ["active", "actions"],
    ["three", "thread"],
    ["overlapping", "overlays"],
    ["oversized", "over"],
    ["headline", "header"],
    ["prominent", "prompt"],
    ["accent", "accept"],
    ["page", "pager"],
    ["time", "timeline"],
    ["work", "workflow"],
    ["view", "viewer"],
    ["companies", "comparar"],
    ["editorial", "editor"],
    ["breakout", "break"],
    ["linkedin", "linked"],
    ["checkbox", "check"],
  ])("refuses the accidental pair %s / %s", (term, word) => {
    expect(termMatchesWord(term, word)).toBe(false);
  });

  it.each([
    ["navigate", "navigation"],
    ["navigation", "navigate"],
    ["setting", "settings"],
    ["toggle", "toggles"],
    ["tabs", "tab"],
    ["pages", "page"],
    ["botones", "boton"],
    ["immediately", "immediate"],
    ["navegacion", "navega"],
    ["lista", "list"],
    ["tabla", "table"],
    ["opening", "open"],
    ["linked", "link"],
    ["switcher", "switch"],
    ["selection", "select"],
    ["labelled", "label"],
    ["scrolling", "scroll"],
    ["navigates", "navigation"],
    ["closing", "close"],
    ["cambiar", "cambia"],
    ["navegar", "navegacion"],
    ["imagen", "image"],
    ["shown", "show"],
  ])("keeps the inflection %s / %s", (term, word) => {
    expect(termMatchesWord(term, word)).toBe(true);
  });

  it("reads a camelCase word in a query whole, the way intents spell it", () => {
    const result = discover(real, snippets, { query: "JavaScript" });
    expect(result.input.terms).toEqual(["javascript"]);
    expect(result.candidates.map((c) => c.signature)).toContain("DetailsGroup");
  });
});

describe("negation", () => {
  const signatures = (query: string) => discover(real, snippets, { query }).candidates.map((c) => c.signature);

  it("separates negated terms from the ones searched for", () => {
    const { input } = discover(real, snippets, { query: "a switch that changes immediately, with no save button" });
    expect(input.terms).toEqual(["switch", "changes", "immediately"]);
    expect(input.negated).toEqual(["save", "button"]);
  });

  it("does not admit or promote a candidate through a negated term", () => {
    const order = signatures("switch with no save button");
    expect(order[0]).toBe("Switch");
    expect(order).not.toContain("SplitButton");
    for (const candidate of discover(real, snippets, { query: "switch with no save button" }).candidates) {
      expect(candidate.matched.some((m) => m.term === "switch" && m.negation === undefined), candidate.signature).toBe(true);
    }
    // Switch's own useWhen says "there is no save button involved": the whole phrase agrees.
    const sw = discover(real, snippets, { query: "switch with no save button" }).candidates[0]!;
    expect(sw.matched).toContainEqual(expect.objectContaining({ field: "useWhen", term: "save", negation: "both" }));
  });

  it("agrees with a value only when it negates the whole negated phrase", () => {
    // Hero's "never a row of buttons of equal weight" negates `buttons`, not "save button".
    const hero = discover(real, snippets, { query: "a hero with no save button" }).candidates.find((c) => c.signature === "Hero")!;
    for (const match of hero.matched.filter((m) => m.term === "button")) expect(match.negation).toBe("query");
  });

  it("keeps a negated match as evidence on a candidate admitted otherwise", () => {
    const result = discover(real, snippets, { query: "switch with no button" });
    const stateButton = result.candidates.find((c) => c.signature === "StateButton")!;
    expect(stateButton.matched).toContainEqual({ field: "signature", term: "button", value: "StateButton", negation: "query" });
  });

  it("ends a negation at a clause or at a new clause word", () => {
    expect(discover(real, snippets, { query: "no menu, a navigation list" }).input.negated).toEqual(["menu"]);
    expect(discover(real, snippets, { query: "without a menu and with links" }).input.terms).toEqual(["links"]);
    expect(discover(real, snippets, { query: "doesn't need a dialog" }).input.negated).toEqual(["dialog"]);
  });

  it("navigation without a menu", () => {
    const result = discover(real, snippets, { query: "navigation without a menu" });
    expect(result.input).toMatchObject({ terms: ["navigation"], negated: ["menu"] });
    expect(result.candidates.length).toBeGreaterThan(0);
    for (const candidate of result.candidates) {
      for (const match of candidate.matched.filter((m) => m.term === "menu")) expect(match.negation, candidate.signature).toBe("query");
      expect(candidate.matched.some((m) => m.term === "navigation"), candidate.signature).toBe(true);
    }
  });

  it("works in Spanish: sin and no", () => {
    expect(discover(real, snippets, { query: "un switch sin botón de guardar" }).input).toMatchObject({
      terms: ["switch"],
      negated: ["boton", "guardar"],
    });
    expect(discover(real, snippets, { query: "navegación que no tenga menú" }).input).toMatchObject({
      terms: ["navegacion"],
      negated: ["tenga", "menu"],
    });
    expect(signatures("un switch sin botón de guardar")).not.toContain("SplitButton");
  });

  it("counts a negated term where the value negates it too", () => {
    const result = discover(real, snippets, { query: "an FAQ without JavaScript" });
    const group = result.candidates.find((c) => c.signature === "DetailsGroup")!;
    expect(group.matched).toContainEqual({ field: "intent", term: "javascript", value: "faq-without-javascript", negation: "both" });
    expect(result.candidates[0]!.signature).toBe("DetailsGroup");
    expect(discover(real, snippets, { query: "un FAQ sin JavaScript" }).candidates[0]!.signature).toBe("DetailsGroup");
  });

  it("reads 'with X disabled' as 'without X', and nothing looser", () => {
    const faq = discover(real, snippets, { query: "an FAQ that works with JavaScript disabled" });
    expect(faq.input).toMatchObject({ terms: ["faq", "works"], negated: ["javascript"] });
    expect(faq.input.ignored).toContain("disabled");
    expect(faq.candidates[0]!.signature).toBe("DetailsGroup");
    expect(discover(real, snippets, { query: "funciona con JavaScript desactivado" }).input.negated).toEqual(["javascript"]);
    // A description of a state, not an absence.
    expect(discover(real, snippets, { query: "a disabled button" }).input).toMatchObject({ terms: ["disabled", "button"], negated: [] });
    expect(discover(real, snippets, { query: "a form with the submit button disabled" }).input.negated).toEqual([]);
  });

  it("a word used both ways is searched for", () => {
    expect(discover(real, snippets, { query: "a button, but no save button" }).input).toMatchObject({ terms: ["button"], negated: ["save"] });
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
  it("never lets an avoidWhen match make a candidate look better than one without it", () => {
    const both: CompiledIndex = {
      ...fixture,
      contracts: [
        { id: "a", category: "forms", css: "a.css", signatures: [signature("Warned", { intent: ["toggle"], avoidWhen: ["a toggle that navigates"] })] },
        { id: "b", category: "forms", css: "b.css", signatures: [signature("Clean", { intent: ["toggle"] })] },
      ],
    };
    // Same naming evidence; Warned is first in the catalogue and names the case in its avoidWhen.
    expect(discover(both, noSnippets, { query: "toggle" }).candidates.map((c) => c.signature)).toEqual(["Clean", "Warned"]);
  });

  it("prefers more terms in ONE naming value, then a whole-name match", () => {
    const named: CompiledIndex = {
      ...fixture,
      contracts: [
        { id: "tree-view", category: "data", css: "a.css", signatures: [signature("TreeView", { intent: ["nested-list"] })] },
        { id: "segmented", category: "forms", css: "b.css", signatures: [signature("Segmented", { intent: ["view-switcher"] })] },
        { id: "state-button", category: "actions", css: "c.css", signatures: [signature("StateButton", { intent: ["icon-button"] })] },
        { id: "button", category: "actions", css: "d.css", signatures: [signature("Button.go")] },
      ],
    };
    const order = (query: string) => discover(named, noSnippets, { query }).candidates.map((c) => c.signature);
    // Both match two terms by name; Segmented's two are one intent, TreeView's are spread out.
    expect(order("list view switcher")).toEqual(["Segmented", "TreeView"]);
    // StateButton matches "button" in more naming fields, but `button` IS Button.go's family.
    expect(order("button")).toEqual(["Button.go", "StateButton"]);
  });

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

/*
 * Discovery quality against the real index, stated as properties rather than as a pinned list: a
 * new family may enter these results, and that is fine, as long as the ones that matter keep their
 * place relative to the ones that do not. No prompt here is special-cased anywhere in discover.ts.
 */
describe("discovery quality on real prompts", () => {
  const order = (query: string, limit?: number) =>
    discover(real, snippets, { query, ...(limit ? { limit } : {}) }).candidates.map((c) => c.signature);
  const before = (list: readonly string[], a: string, b: string) => {
    expect(list, `${a} is a candidate`).toContain(a);
    if (list.includes(b)) expect(list.indexOf(a), `${a} before ${b}`).toBeLessThan(list.indexOf(b));
  };

  it("navigation CTA: Button.navigation first, Button.action visible below it, no pager", () => {
    const list = order('A prominent "See pricing" button that takes the visitor to the /pricing page.');
    expect(list[0]).toBe("Button.navigation");
    before(list, "Button.navigation", "Button.action");
    expect(list).toContain("Button.action");
    for (const pager of ["TablePager", "TablePagerBar", "TablePagerSize", "TablePagerNav", "Pagination"]) before(list, "Button.navigation", pager);
    const action = discover(real, snippets, { query: "pricing button to the pricing page" }).candidates.find((c) => c.signature === "Button.action")!;
    expect(action.matched.some((m) => m.field === "avoidWhen")).toBe(true);
  });

  it("immediate setting: Switch first, SplitButton not promoted by a negated save", () => {
    const list = order("A switch to turn on dark mode immediately, with no save button involved.");
    expect(list[0]).toBe("Switch");
    expect(list).not.toContain("SplitButton");
  });

  it("native no-JS FAQ: DetailsGroup first, Accordion visible with its avoidWhen", () => {
    const query = "An FAQ with three questions where opening one closes the others, and it must work with JavaScript disabled.";
    const result = discover(real, snippets, { query });
    const list = result.candidates.map((c) => c.signature);
    expect(list[0]).toBe("DetailsGroup");
    before(list, "DetailsGroup", "Accordion");
    const accordion = result.candidates.find((c) => c.signature === "Accordion")!;
    expect(accordion.matched.some((m) => m.field === "avoidWhen" && m.term === "javascript")).toBe(true);
    expect(list).not.toContain("CommentThread");
  });

  it("exclusive view switcher: Segmented ahead of generic list and action candidates", () => {
    const list = order("A List / Grid view switcher where exactly one view is active at a time.");
    expect(list[0]).toBe("Segmented");
    for (const generic of ["List", "ListItem", "Grid", "Button.action", "Timeline", "Menu"]) before(list, "Segmented", generic);
    expect(list).not.toContain("Button.action");
  });

  it("expressive landing page: the expressive primitives are in the default candidate set", () => {
    const list = order(
      "A cinematic editorial landing page with an oversized headline, overlapping image, breakout sections, and strong visual hierarchy.",
    );
    for (const id of ["Hero", "LayoutGrid", "Heading", "ImageFrame", "MediaCaption"]) expect(list, id).toContain(id);
    for (const id of ["Hero", "LayoutGrid", "Heading", "MediaCaption"]) before(list, id, "Lightbox");
    // A pager family may appear through an intent that literally says "page", never through `pager`,
    // and never above the primitives the prompt is about.
    const result = discover(real, snippets, {
      query: "A cinematic editorial landing page with an oversized headline, overlapping image, breakout sections, and strong visual hierarchy.",
    });
    for (const candidate of result.candidates) {
      for (const match of candidate.matched.filter((m) => m.term === "page"))
        expect(wordsOf(match.value), `${candidate.signature}: ${match.value}`).toContain("page");
      // Nothing through the old accident: "overlapping" is not the `overlays` category.
      expect(candidate.matched.some((m) => m.value === "overlays"), candidate.signature).toBe(false);
    }
    for (const pager of ["TablePager", "TablePagerSize", "Pagination"]) before(list, "Hero", pager);
    // MediaGradient, which only lives inside a MediaCaption, is matched too, past the default limit.
    expect(order("A cinematic editorial landing page with an oversized headline, overlapping image.", 40)).toContain("MediaGradient");
  });
});

describe("naming fields break a naming tie", () => {
  it("puts the signature named by the term above one that only mentions it in an intent", () => {
    const order = discover(real, snippets, { query: "switch" }).candidates.map((c) => c.signature);
    expect(order.indexOf("Switch")).toBeLessThan(order.indexOf("CodePreview.density"));
  });
});
