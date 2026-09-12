import { recipes } from "@skryensya/recipes";
import { snippets } from "@skryensya/snippets";
import { describe, expect, it } from "vitest";
import { checkRecipes } from "./recipes.js";
import { checkSnippets } from "./snippets.js";
import { checkStylingHooks } from "./hooks.js";
import { contractIds, getContract } from "@skryensya/core/registry";

/*
 * THE GATES THAT WATCH EVERYTHING ELSE, WATCHED.
 *
 * `cli.ts` runs six gates in series and refuses to emit when any of them speaks. Three had no test
 * of any kind, which is a particular kind of exposure: each is a `() => string[]`, so the way they
 * fail is by returning an empty array, and an empty array is also what success looks like.
 *
 * `recipes.ts` carries the cautionary tale in its own comment: its first version keyed on the family
 * and silently passed everything, because `typography` holds both `Link` and `Heading` so every
 * recipe with a title counted as offering a way out. It was caught by a person watching a gate not
 * fire. So these tests assert two different things, and the second is the one that matters: that the
 * corpus is clean today, AND that each gate is still looking at a corpus big enough to mean it.
 */

describe("checkRecipes", () => {
  it("passes over the published recipes", () => {
    expect(checkRecipes()).toEqual([]);
  });

  it("is looking at a corpus, not at nothing", () => {
    /* Without this, a `recipes` import that resolved to `[]` would make the gate above green
     * forever while checking no screen at all. */
    expect(recipes.length).toBeGreaterThan(5);
    expect(recipes.every((r) => Object.keys(r.states).length > 0)).toBe(true);
  });

  it("reports a recipe whose state stops composing", () => {
    /* The failure path, exercised rather than assumed: a tree the contracts reject has to come back
     * named, not swallowed. */
    const [first] = recipes;
    const state = Object.keys(first!.states)[0]!;
    const broken = {
      ...first!,
      states: { ...first!.states, [state]: { contract: "button", signature: "Nope.nope" } },
    };
    const saved = recipes[0];
    try {
      (recipes as unknown as unknown[])[0] = broken;
      const problems = checkRecipes();
      expect(problems.length).toBeGreaterThan(0);
      expect(problems.join("\n")).toContain(first!.id);
    } finally {
      (recipes as unknown as unknown[])[0] = saved;
    }
  });
});

describe("checkSnippets", () => {
  it("passes over the published snippets", () => {
    expect(checkSnippets()).toEqual([]);
  });

  it("is looking at a corpus, not at nothing", () => {
    expect(snippets.length).toBeGreaterThan(10);
  });
});

describe("checkStylingHooks", () => {
  it("passes: every declared hook exists, and every published one is declared", () => {
    expect(checkStylingHooks()).toEqual([]);
  });

  it("is looking at contracts that actually declare hooks", () => {
    /* The rule is inert for a contract with no `hooks`, which is deliberate while a corpus is being
     * filled in and dangerous once it is: a silent regression to zero would read as success. */
    const declaring = contractIds().filter((id) => (getContract(id)?.hooks?.length ?? 0) > 0);
    expect(declaring.length).toBeGreaterThan(70);
  });
});
