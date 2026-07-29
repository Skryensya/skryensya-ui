import { expect, test, type Locator } from "@playwright/test";
import type { ContractTemplate } from "@skryensya/core/contract";
import { contracts } from "@skryensya/ai-compiler/registry";
import { canonicalTrees } from "./trees.js";

/*
 * G2 — the gate that makes "two bindings" mean something.
 *
 * Both halves of every canonical tree are rendered in one real page, the enhancers run, and then the
 * two subtrees are compared. What is compared is the DOM each binding actually produced: elements,
 * part classes, mapped attributes and the ARIA relationships between them.
 *
 * Two things are deliberately normalized away, and each one is a claim:
 *
 *   - The enhancer's own bookkeeping: the MOUNT attribute a signature declares (`data-sk-button`) and
 *     the lifecycle markers the runtime writes (`data-sk-…-ready`, `data-sk-mounting`). React needs
 *     no attachment point, so these exist in one binding by definition. They are matched exactly —
 *     NOT by a `data-sk-*` wildcard, which would also swallow an option a contract someday maps
 *     there, and hide a real divergence behind a convenience.
 *   - The VALUE of an id. React generates ids with useId, the emitter slugs the label text. What has
 *     to hold is the relationship — that `aria-labelledby` points at the element that renders the
 *     label — so ids are replaced by their position and the pointer is resolved against that.
 *
 * Anything else that differs is a real divergence and fails here.
 */

test.beforeEach(async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));

  await page.goto("/");
  await page.waitForSelector("body[data-ready]");

  const state = await page.getAttribute("body", "data-ready");
  if (state !== "true") {
    const reason = await page.evaluate(() => window.gateError);
    throw new Error(`The stage never became ready: ${reason ?? "unknown"}`);
  }
  expect(failures, "the page must render both bindings without throwing").toEqual([]);
});

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
     * construction, exactly like the mount point — and the contract is what says which options these
     * are, so the gate is not guessing from a name.
     */
    ...Object.values(contract.options)
      .filter((option) => option.machineInput)
      .map((option) => option.attr),
    // Same rule one level down: a collection ENTRY can carry machine input too — a radio's initial
    // `checked` is authored as an attribute and set by React as a property.
    ...Object.values(contract.signatures).flatMap((signature) =>
      Object.values(signature.slots).flatMap((slot) =>
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
];

for (const { name } of canonicalTrees) {
  test(`${name} — both bindings land on the same DOM`, async ({ page }) => {
    const block = page.locator(`[data-case="${name}"]`);

    const [vanilla, react] = await Promise.all([
      shapeOf(block, "vanilla"),
      shapeOf(block, "react"),
    ]);

    expect(vanilla).toEqual(react);
  });

  test(`${name} — both bindings expose the same accessibility tree`, async ({ page }) => {
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
  return block.locator(`[data-binding="${binding}"]`).evaluate((host: HTMLElement, [skip, idRefs]: [string[], string[]]) => {
    // Ids are positional: the relationship survives, the generated string does not.
    const ids = new Map<string, number>();
    let next = 0;
    for (const element of host.querySelectorAll<HTMLElement>("[id]")) {
      ids.set(element.id, next++);
    }

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

        attributes[name] = value;
      }

      return {
        tag: element.tagName.toLowerCase(),
        attributes: Object.fromEntries(Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b))),
        children: [...element.childNodes]
          .map((node) =>
            node.nodeType === Node.TEXT_NODE
              ? (node.textContent ?? "").trim() || undefined
              : node.nodeType === Node.ELEMENT_NODE
                ? describe(node as Element)
                : undefined,
          )
          .filter((child) => child !== undefined),
      };
    };

    return [...host.children].map(describe);
  }, [enhancerAttributes, idReferences] as [string[], string[]]);
}
