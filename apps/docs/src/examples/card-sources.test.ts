import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import * as cardTrees from "../demos/card";
import { cardCopy, type CardCopy } from "./card-data";

/*
 * Card is not a component, so it has no source of its own to unit test. What CAN be tested is the
 * ELEVEN EXAMPLES this page teaches with, which are usage trees now (`demos/card.ts`) rather than
 * the hand-written HTML-plus-JSX pairs this file was first written against.
 *
 * That change is what most of these assertions are for. A tree is one authoring, so the two things
 * the old pairs could get wrong  -  a snippet that disagrees with the stage beside it, and a React
 * island that disagrees with both  -  are no longer reachable by hand. What IS still reachable is a
 * tree the contract rejects, and that fails silently in the nicest possible way: the page builds,
 * the markup emits, and the demo is simply wrong about the system it is documenting.
 */

type TreeBuilder = (copy: CardCopy) => ReturnType<typeof cardTrees.cardBasicTree>;

const builders = Object.entries(cardTrees).filter(
  (entry): entry is [string, TreeBuilder] =>
    typeof entry[1] === "function" && entry[0].endsWith("Tree"),
);

describe("card examples", () => {
  const copy = cardCopy.es;

  it("keeps every example's data array at exactly three cards", () => {
    for (const [key, value] of Object.entries(copy)) {
      if (key === "labels" || key === "cta") continue;
      expect(Array.isArray(value), `${key} should be an array`).toBe(true);
      expect((value as unknown[]).length, `${key} should have 3 cards`).toBe(3);
    }
  });

  it("covers the whole ladder: one tree per labelled example", () => {
    /* The labels are the ladder, so they are what says an example went missing: a rung that loses
     * its tree would otherwise just stop rendering, on a page whose whole subject is the rungs. */
    expect(builders.length).toBe(Object.keys(copy.labels).length);
  });

  it("keeps every example valid against the contracts it composes", () => {
    /* ONE test over all eleven rather than `it.each`, because the Tests tab on this page keys a row
     * by the verbatim `it()` title (`scripts/build-test-report.mjs`): eleven generated titles would
     * be eleven rows nobody wrote and none of them would match. The example's name rides in the
     * assertion message instead, where a failure still names it. */
    const problems = builders.flatMap(([name, build]) =>
      validateUsageTree(build(copy))
        .problems.filter((problem) => problem.severity === "error")
        .map((problem) => `${name} · ${problem.path}: ${problem.message}`),
    );

    expect(problems).toEqual([]);
  });

  it("emits both bindings of every example from the one authoring", () => {
    /* Not a snapshot: what matters is that BOTH emitters produce a real composition carrying the
     * example's own words. A tree that emits markup and an empty component is exactly the failure
     * this page used to have by construction, back when the two sides were typed out separately. */
    for (const [name, build] of builders) {
      const tree = build(copy);
      const markup = emitMarkup(tree, { fillDefaults: false });
      const react = emitReactSource(tree, { component: "Example" }).component;

      expect(markup, name).toContain(String(tree.attrs?.["aria-label"]));
      expect(react, name).toContain("<Grid");
    }
  });

  it("marks the select example's initial state on the label, not on the input", () => {
    /*
     * Regression: Zag's checkbox machine (`TileCheckbox.svelte`) reads `defaultChecked` from
     * `data-default-checked` on the ROOT label, never from a native `checked` attribute on the
     * input. That attribute is a live property Zag owns and overwrites on mount. The select
     * example used to author `checked` on the `<input>` instead, so every card rendered
     * unchecked regardless of its data, including the one meant to start checked.
     *
     * Asserted on the EMITTED tree, not on a hand-written string: the mistake this guards is no
     * longer reachable by hand, because `defaultChecked` is the contract's option and the template
     * decides where it lands. Kept anyway, because that is a promise of the contract and this is
     * the page that depends on it.
     */
    const html = emitMarkup(cardTrees.cardSelectTree(copy));

    expect(html).toContain("data-default-checked");
    expect(html).not.toMatch(/<input[^>]*\bchecked\b[^>]*>/);
  });
});
