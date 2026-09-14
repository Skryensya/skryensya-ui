import { snippets } from "@skryensya/snippets";
import { describe, expect, it } from "vitest";
import { checkSnippets } from "./snippets.js";
import { checkStylingHooks } from "./hooks.js";
import { contractIds, getContract } from "@skryensya/core/registry";

/*
 * THE GATES THAT WATCH EVERYTHING ELSE, WATCHED.
 *
 * `cli.ts` runs the gates in series and refuses to emit when any of them speaks. Several had no test
 * of any kind, which is a particular kind of exposure: each is a `() => string[]`, so the way they
 * fail is by returning an empty array, and an empty array is also what success looks like.
 *
 * A gate that keys on the wrong thing passes everything and says nothing, which is only ever caught
 * by a person watching a gate not fire. So these tests assert two different things, and the second is
 * the one that matters: that the corpus is clean today, AND that each gate is still looking at a
 * corpus big enough to mean it.
 */

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
