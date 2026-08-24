import type { Locator } from "@playwright/test";
import type { ContractSlot, ContractTemplate } from "@skryensya/core/contract";
import { contracts } from "@skryensya/ai-compiler/registry";
import { canonicalTrees } from "./trees.js";
import { expect, test } from "./fixtures.js";

/*
 * G2: the gate that makes "two bindings" mean something.
 *
 * Both halves of every canonical tree are rendered in one real page, the enhancers run, and then the
 * two subtrees are compared. What is compared is the DOM each binding actually produced: elements,
 * part classes, mapped attributes and the ARIA relationships between them.
 *
 * Two things are deliberately normalized away, and each one is a claim:
 *
 *   - The enhancer's own bookkeeping: the MOUNT attribute a signature declares (`data-sk-button`) and
 *     the lifecycle markers the runtime writes (`data-sk-…-ready`, `data-sk-mounting`). React needs
 *     no attachment point, so these exist in one binding by definition. They are matched exactly,
 *     NOT by a `data-sk-*` wildcard, which would also swallow an option a contract someday maps
 *     there, and hide a real divergence behind a convenience.
 *   - The VALUE of an id. React generates ids with useId, the emitter slugs the label text. What has
 *     to hold is the relationship: that `aria-labelledby` points at the element that renders the
 *     label, so ids are replaced by their position and the pointer is resolved against that.
 *
 * Anything else that differs is a real divergence and fails here.
 */

/*
 * Exactly what the enhancer adds, taken from the contracts themselves plus the runtime's two
 * lifecycle markers. Anything outside this list is compared.
 */
const enhancerAttributes = [
  ...Object.values(contracts).flatMap((contract) => [
    ...Object.values(contract.signatures).flatMap((signature) =>
      // A machine-backed enhancer marks itself per key; an imperative one shares the two below.
      signature.mount ? [signature.mount, `${signature.mount}-ready`, `${signature.mount}-mounting`] : [],
    ),
    /*
     * Machine configuration. Authored markup has no channel but an attribute, so the enhancer reads
     * it off the DOM; React passes a prop and Zag never writes it back. Present on one side by
     * construction, exactly like the mount point, and the contract is what says which options these
     * are, so the gate is not guessing from a name.
     */
    ...Object.values(contract.options)
      .filter((option) => option.machineInput)
      .map((option) => option.attr),
    // Same rule one level down: a collection ENTRY can carry machine input too: a radio's initial
    // `checked` is authored as an attribute and set by React as a property.
    ...Object.values(contract.signatures).flatMap((signature) =>
      Object.values(signature.slots as Record<string, ContractSlot>).flatMap((slot) =>
        Object.values(slot.item?.options ?? {})
          .filter((option) => option.machineInput)
          .map((option) => option.attr),
      ),
    ),
    // Same rule one level down again: a mount mark that sits on an inner part rather than on the
    // signature root, declared by the template node that carries it.
    ...Object.values(contract.signatures).flatMap((signature) => templateMounts(signature.template)),
  ]),
  "data-sk-ready",
  "data-sk-mounting",
  /*
   * Treegrid's OWN idempotency markers on structure the contract already documents as
   * binding-inserted, never authored (`treegridParts.disclosure`/its own `columnResizer` doc,
   * `core/treegrid.ts`): a `<colgroup>` and a branch row's disclosure button. React re-describes
   * both on every render and needs no marker; the vanilla enhancer re-runs on the same DOM and
   * needs one to avoid inserting a second copy. Not a formal `mount` field (nothing is mounted
   * ON them, they mark "I already built this"), so `templateMounts` above cannot see them. First
   * exercised at all once a Treegrid canonical tree existed to find the gap.
   */
  "data-sk-treegrid-colgroup",
  "data-sk-treegrid-disclosure",
];

/** Every `mount` declared below a signature's root, in template order. */
function templateMounts(node: ContractTemplate): string[] {
  return [
    ...(node.mount ? [node.mount, `${node.mount}-ready`, `${node.mount}-mounting`] : []),
    ...(node.children ?? []).flatMap(templateMounts),
  ];
}

/** Attributes whose value is an element id, or a list of them. Compared by relationship, not string. */
const idReferences = [
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "data-ownedby",
  // A label's `for` is an id reference like any other: the relationship is what has to match, and
  // React generates ids with useId while the emitter slugs the label text.
  "for",
  /*
   * The native Popover API's wiring is an id reference too, and the same rule applies for the same
   * reason: what has to hold is that the trigger points at the element that IS the popover, not that
   * both bindings invented the same string for it. Listed before anything uses it, because the
   * alternative is discovering it as a false divergence the first time a popover is compared: the
   * shape of failure `for` and `aria-controls` are already here to prevent.
   */
  "popovertarget",
];

/*
 * `<template>` content is inert by the HTML spec, and lands DIFFERENTLY depending on how it was
 * built: the HTML parser (vanilla's `innerHTML` emission) puts it in `.content`, a DocumentFragment
 * a plain DOM walk never sees; imperative DOM operations (React's own reconciler) put it in the
 * template element's ordinary `.childNodes` instead, which the SAME walk DOES see. Two bindings
 * therefore produce a genuinely different, both CORRECT, shape for the identical markup: not a
 * divergence this gate exists to catch, a limit of comparing raw DOM shape across two construction
 * methods for the one element the platform treats specially. The accessibility-tree comparison
 * beside this one needs no such exemption: template content is never in the accessible tree either
 * way, so both sides already agree there.
 */
const SHAPE_NOT_COMPARABLE = new Set(["content/toast-template"]);

for (const { name } of canonicalTrees) {
  test(`${name}: both bindings land on the same DOM`, async ({ stagePage: page }) => {
    test.skip(SHAPE_NOT_COMPARABLE.has(name), "template content is inert and not comparable as DOM shape");
    const block = page.locator(`[data-case="${name}"]`);

    const [vanilla, react] = await Promise.all([
      shapeOf(block, "vanilla"),
      shapeOf(block, "react"),
    ]);

    expect(vanilla).toEqual(react);
  });

  test(`${name}: both bindings expose the same accessibility tree`, async ({ stagePage: page }) => {
    const block = page.locator(`[data-case="${name}"]`);

    const [vanilla, react] = await Promise.all([
      block.locator('[data-binding="vanilla"]').ariaSnapshot(),
      block.locator('[data-binding="react"]').ariaSnapshot(),
    ]);

    expect(vanilla).toBe(react);
  });
}

/** The comparable shape of one binding's subtree. */
async function shapeOf(
  block: Locator,
  binding: "vanilla" | "react",
): Promise<unknown> {
  return block.locator(`[data-binding="${binding}"]`).evaluate((live: HTMLElement, [skip, idRefs]: [string[], string[]]) => {
    /*
     * On a COPY, because hoisting below detaches nodes and the stage is shared by every other gate in
     * this worker (fixtures.ts). Reading the live tree would leave each portalling case stripped of
     * its floating regions for whatever test ran next: the accessibility snapshot and axe would then
     * scan a subtree this gate had quietly mutilated, in an order nothing controls. Only attributes,
     * tag names and text are read here, so a detached clone says exactly the same thing.
     */
    const host = live.cloneNode(true) as HTMLElement;
    const ids = new Map<string, number>();
    const anchorNames = new Map<string, number>();

    const describe = (element: Element): unknown => {
      const attributes: Record<string, string> = {};

      for (const { name, value } of element.attributes) {
        // The enhancer's own bookkeeping, matched exactly: present in one binding by definition.
        if (skip.includes(name)) continue;

        if (name === "id") {
          attributes.id = `#${ids.get(value) ?? "?"}`;
          continue;
        }

        if (idRefs.includes(name)) {
          attributes[name] = value
            .split(/\s+/)
            .map((token) => `#${ids.get(token) ?? "?"}`)
            .join(" ");
          continue;
        }

        if (name === "class") {
          attributes.class = value.split(/\s+/).filter(Boolean).sort().join(" ");
          continue;
        }

        /*
         * A generated name is an id by another route. React derives them from `useId` and the
         * vanilla helpers from their own counters, so the STRING can never match while the pairing
         * it expresses must; the same reasoning as the `id` attribute above, applied to the two
         * other places a generated name shows up: the anchor name inside a style, and the machine's
         * own uid, which Zag writes as `data-uid` and refers to from `data-controls`.
         */
        const token = (raw: string): string => {
          if (!anchorNames.has(raw)) anchorNames.set(raw, anchorNames.size);
          return `#${anchorNames.get(raw)}`;
        };

        if (name === "data-uid" || name === "data-controls") {
          attributes[name] = value.replace(/(_r_[0-9a-z]+_|sk-[a-z-]+-[0-9a-z]+)/g, token);
          continue;
        }

        /*
         * A style attribute's STRING is not its meaning. React assigns through CSSOM, so the
         * browser re-serialises it (`border: 0px`, `overflow-wrap`); authored markup keeps whatever
         * text was written (`border:0`, `word-wrap`). Both declare the same style. Round-tripping
         * each side through CSSOM makes them comparable without pretending the difference matters:
         * matching Zag's source string byte for byte does NOT work, because only one side gets
         * normalised.
         */
        if (name === "style") {
          const scratch = document.createElement("div");
          scratch.setAttribute("style", value);
          attributes.style = scratch.style.cssText.replace(
            /--sk-anchor-[\w-]+/g,
            (raw) => `--sk-anchor${token(raw)}`,
          );
          continue;
        }

        attributes[name] = value.replace(/--sk-anchor-[\w-]+/g, (raw) => `--sk-anchor${token(raw)}`);
      }

      /*
       * A text node's own whitespace RUNS collapse to one space outside `<pre>`, the same rule the
       * browser applies when it paints them, so a line the markup emitter wrapped for readability
       * (`packages/ai-compiler/src/emit.ts`, PRINT_WIDTH) reads identically to the one-line string a
       * live React render never bothered to wrap. Comparing the raw bytes instead would fail two
       * DOMs that render the same thing, over a difference no reader or screen reader can see.
       * `<pre>` is excluded because there whitespace IS the content: collapsing it there would be
       * the false negative this exists to avoid, not fix.
       */
      const normalizeText = (text: string): string =>
        element.closest("pre") ? text.trim() : text.replace(/\s+/g, " ").trim();

      return {
        tag: element.tagName.toLowerCase(),
        attributes: Object.fromEntries(Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b))),
        children: [...element.childNodes]
          .map((node) =>
            node.nodeType === Node.TEXT_NODE
              ? normalizeText(node.textContent ?? "") || undefined
              : node.nodeType === Node.ELEMENT_NODE
                ? describe(node as Element)
                : undefined,
          )
          .filter((child) => child !== undefined),
      };
    };

    /*
     * FLOATING CONTENT IS HOISTED, in both bindings, before anything is compared.
     *
     * A positioned region is nested where it belongs in authored markup and PORTALLED to the
     * container in React, and that is the whole point of portalling, since an ancestor with
     * `overflow: hidden` would otherwise clip it. So the two bindings genuinely disagree about
     * nesting while agreeing about everything else, and comparing the raw trees says they differ
     * for a reason neither one is wrong about.
     *
     * Lifting every `.sk-anchored` subtree out to one flat list, in document order, makes the two
     * shapes comparable again without weakening anything: the region's own contents are still
     * compared in full, and a positioner appearing in one binding and not the other still fails.
     *
     * Nothing exercised this until now: menu, select and tooltip are the only signatures that
     * portal, and none of them had a canonical tree, so G2 had never once compared a portalling
     * component. The scoping machinery was there; the comparison was not.
     */
    const floating: Element[] = [];
    const hoist = (element: Element): void => {
      for (const child of [...element.children]) {
        if (child.classList.contains("sk-anchored")) {
          floating.push(child);
          child.remove();
          hoist(child);
          continue;
        }
        hoist(child);
      }
    };
    /*
     * Every direct child is walked, anchored or not: `hoist` only ever touches a node's
     * DESCENDANTS, never the node itself, so calling it on a top-level anchored child cannot
     * double-add that child. It only reaches whatever is nested INSIDE it. Skipping anchored
     * children here (the previous shape of this loop) meant a portalled top-level positioner's own
     * nested submenu positioner. Buried in its content, since only React portals the ROOT and
     * leaves submenus nested (menu.tsx). Was never pulled out, while vanilla's fully inline tree
     * always found it. One binding's `anchored` list came out one element short of the other's for
     * every canonical tree with a nested submenu, which read as a content divergence when the two
     * trees actually agreed.
     */
    for (const child of [...host.children]) {
      hoist(child);
    }

    /*
     * Floating regions are compared as a SET, not a sequence. Their order in the container is an
     * accident of how each binding got them there (nesting depth in authored markup, mount order
     * in React), and no reader can perceive it, since each one is positioned against its own
     * anchor. Ordering both sides by content keeps every region compared in full while dropping the
     * one property that legitimately differs.
     *
     * Which forces two passes, because ids are POSITIONAL. Numbering them requires a stable
     * traversal, and the traversal is only stable once the regions are ordered, so the first pass
     * orders them by a signature that ignores ids entirely, and the second numbers and describes.
     * Getting this backwards is what made `aria-labelledby` point at "#8" on one side and "#5" on
     * the other while both were pointing at the same element.
     */
    const rooted = [...host.children].filter((child) => !child.classList.contains("sk-anchored"));
    const anchored = [...host.children]
      .filter((child) => child.classList.contains("sk-anchored"))
      .concat(floating);

    const skeleton = (element: Element): string =>
      `${element.tagName}[${[...element.attributes]
        .filter(({ name }) => name !== "id" && !idRefs.includes(name) && name !== "style")
        .map(({ name, value }) => `${name}=${value}`)
        .sort()
        .join(",")}]{${[...element.children].map(skeleton).join("")}}`;

    anchored.sort((a, b) => skeleton(a).localeCompare(skeleton(b)));

    const number = (element: Element): void => {
      if (element.id && !ids.has(element.id)) ids.set(element.id, ids.size);
      for (const child of element.children) number(child);
    };
    for (const element of [...rooted, ...anchored]) number(element);

    return {
      anchored: anchored.map(describe),
      rooted: rooted.map(describe),
    };
  }, [enhancerAttributes, idReferences] as [string[], string[]]);
}
