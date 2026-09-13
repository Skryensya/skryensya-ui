// @vitest-environment jsdom
/*
 * The vanilla layer's OWN jsdom shims, imported here rather than set as a global `setupFiles`:
 * jsdom ships `<dialog>` without its methods, no `matchMedia`, and no pointer capture, and several
 * enhancers are built on the platform owning modality. A global setup would also run for the
 * node-environment tests in this package, where `Element` does not exist at all. Reused rather than
 * copied, so there is one floor to keep in step instead of two.
 */
import "@skryensya/vanilla/test-setup";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { initComponents, registeredSelectors } from "@skryensya/vanilla";
import { afterEach, describe, expect, it } from "vitest";
import { canonicalTrees } from "./trees.js";

/*
 * THE VANILLA BINDING, AGAINST ITS CONTRACT.
 *
 * G1 (`ai-compiler/src/conformance.ts`) reads exactly one binding: the word `vanilla` does not
 * appear in that file. It resolves `signature.react.from` and opens a `.tsx`, because what it looks
 * for is a restated literal union, and that is legible in React's property signatures. The vanilla
 * layer has no equivalent to read: it patches attributes imperatively, so nothing static says
 * whether it agrees with the contract. Until this file the only thing comparing the two bindings
 * was `symmetry.spec.ts`, which needs a browser and sits outside CI at ~19 minutes.
 *
 * SO THIS ASSERTS THE BEHAVIOURAL INVARIANT, and specifically the one that fails silently: a root
 * the layer claims to enhance, in markup the emitter produced, gets enhanced. `querySelector`
 * returns null when a selector stops matching, the enhancer patches nothing, and nothing is raised.
 * That is exactly what a renamed mount attribute looks like from the outside.
 *
 * It reads `registeredSelectors` rather than guessing which enhancer belongs to which contract,
 * because guessing wrong produces the same symptom as the bug: an enhancer that mounts nothing.
 * `initComponents` is the real entry point a consumer calls, and it returns how many roots it
 * enhanced, so "it found nothing" is a number rather than an inference.
 */

/*
 * `enhanced` is the corpus's OWN declaration of whether a case has an enhancer behind it, and it is
 * what makes this precise rather than inferred. Presence of a registered root cannot stand in for
 * it: rename a mount attribute and the root leaves the markup with it, so every per-tree check
 * reads "nothing to enhance here" and passes.
 */
const cases = canonicalTrees.map(({ name, tree, enhanced }) => ({
  name,
  tree,
  enhanced,
  markup: emitMarkup(tree),
}));

/** The roots this layer advertises that are actually present in a piece of emitted markup. */
const rootsIn = (host: Element) =>
  registeredSelectors.filter((selector) => host.querySelector(selector) !== null);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("the vanilla layer over emitted markup", () => {
  it("knows about a real number of roots", () => {
    /* A floor: an import that resolved to an empty array would make every assertion below vacuous
     * while still reporting success, which is the failure `public-exports.test.ts` records. */
    expect(registeredSelectors.length).toBeGreaterThan(40);
  });

  it("has canonical markup to check it against", () => {
    expect(cases.length).toBeGreaterThan(100);
  });

  it("exercises every root it knows about somewhere in the corpus", () => {
    /*
     * THE ONE THAT CATCHES A RENAME, and the reason the per-tree check below cannot.
     *
     * Rename a mount attribute in a contract and the emitted markup moves with it, so the root
     * simply stops being present: every per-tree assertion then reads "nothing to enhance here"
     * and passes. Across the whole corpus that hides nowhere. A selector this layer advertises and
     * no canonical tree ever presents is either an enhancer whose contract moved out from under it,
     * or one nothing is evidence for. This is the vanilla twin of "every published signature is
     * reachable from a canonical tree", which `canonical.test.ts` already asserts for contracts.
     */
    const host = document.createElement("div");
    document.body.append(host);
    const unexercised = registeredSelectors.filter((selector) =>
      cases.every(({ markup }) => {
        host.innerHTML = markup;
        return host.querySelector(selector) === null;
      }),
    );
    expect(unexercised).toEqual([]);
  });

  for (const { name, markup, enhanced } of cases) {
    it(`${name}: enhances every root it claims to know`, async () => {
      const host = document.createElement("div");
      host.innerHTML = markup;
      document.body.append(host);

      const present = rootsIn(host);
      const count = await initComponents(host);

      /*
       * BOTH SIGNALS, because neither alone is right.
       *
       * `enhanced` is per CASE and a recipe carries it for the whole recipe, so its `loading` state
       * is a skeleton with nothing to enhance and still arrives marked enhanced. And a `<template>`
       * is inert by spec, so `content/toast-template` has no root in the document at all. Requiring
       * a registered root to be PRESENT covers those without weakening anything: a rename, which
       * removes the root from the markup, is caught by the corpus-level assertion above instead.
       */
      if (!enhanced || present.length === 0) return;

      /* Zero here is the silent failure: the root is in the markup, the layer says it knows that
       * root, and nothing was patched. */
      expect(count, `registered roots found in the markup: ${present.join(", ") || "none"}`).toBeGreaterThan(0);
    });
  }
});
