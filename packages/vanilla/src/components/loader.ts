import { loaderAttrs, loaderContract, loaderParts, loaderTicks } from "@skryensya/core/loader";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${loaderAttrs.root}]`;

type Cleanup = () => void;

/*
 * THE ONE ENHANCER THAT ADDS NO BEHAVIOUR.
 *
 * Every other enhancer in this package wires a machine: state, events, a lifecycle. This one writes
 * markup and stops, because the markup is the only part of a staggered Loader a person cannot get
 * right by hand. Twelve `sk-loader__tick` spans is a count, and a count typed out is a count typed
 * wrong eventually; eleven of them is not an error anything reports, it is a spinner with a gap.
 *
 * So the count comes from `loaderTicks` in core, the same function React calls, and the stagger
 * comes from `loader.css`'s `:nth-child()`. Neither this file nor the React binding computes an
 * angle or a delay. What they share is the COUNT, and sharing it is the whole point: authored markup
 * and a React island cannot disagree about how many spokes a spokes has.
 */
export const mountLoader = createConnectMount({ key: "loader", rootSelector, connect: connectLoader });

/** The design's mark count, read off the root. Unset means the contract's default. */
const variantOf = (root: HTMLElement): string =>
  root.getAttribute(loaderContract.options.variant.attr) ?? loaderContract.options.variant.default;

export function connectLoader(root: HTMLElement): Cleanup {
  /*
   * Only DIRECT children count. A Loader is a leaf in practice, but `:scope >` is what keeps this
   * honest if one is ever nested inside another component's slot: marks belonging to some other
   * loader deeper in the tree must not make this one look already built.
   */
  const marks = () => root.querySelectorAll<HTMLElement>(`:scope > .${loaderParts.tick}`);

  /*
   * IF NEEDED, which is the whole contract of this function.
   *
   * Authored markup is an empty root, so the usual case is "build them". But the emitter, a
   * server render and a docs preview can all hand over a root that already has its marks, and
   * rebuilding those would restart twelve animations mid-cycle for no reason. A root that already
   * matches is left untouched.
   */
  const sync = () => {
    const wanted = loaderTicks(variantOf(root));
    const current = marks();
    if (current.length === wanted) return;

    for (const mark of current) mark.remove();
    if (wanted === 0) return;

    const batch = document.createDocumentFragment();
    for (let index = 0; index < wanted; index += 1) {
      const mark = document.createElement("span");
      mark.className = loaderParts.tick;
      batch.append(mark);
    }
    /*
     * Prepended, not appended: `mountLoader` runs through Imperative.svelte, which has already put
     * its own anchor inside this root. Appending would leave that anchor BEFORE the marks, and
     * `loader.css` addresses marks by `:nth-child()` - an anchor is a comment node and does not
     * count, but a future anchor that is an element would, and the marks must be the first children
     * either way for the angles to start at zero.
     */
    root.prepend(batch);
  };

  sync();

  /*
   * The variant is not fixed for the life of the root: the docs' own preview switches it on a live
   * element, and so does anything that themes a loading state as it runs. A spokes that became a
   * beads would otherwise keep twelve marks where the stylesheet expects eight, and the eight
   * `:nth-child()` angles would leave four marks stacked at the same angle.
   */
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: [loaderContract.options.variant.attr] });

  return () => {
    observer.disconnect();
    for (const mark of marks()) mark.remove();
  };
}
