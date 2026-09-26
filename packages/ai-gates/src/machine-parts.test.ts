// @vitest-environment jsdom
import "@skryensya/vanilla/test-setup";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { anchoredParts } from "@skryensya/core/anchored";
import * as machines from "@skryensya/core/machines";
import { contracts } from "@skryensya/core/registry";
import { initComponents } from "@skryensya/vanilla";
import { loadTree, renderTree, setPortalContainer } from "@skryensya/react/render-tree";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { beforeAll, describe, expect, it } from "vitest";
import { canonicalTrees } from "./trees.js";

/*
 * THE PARTS CONTRACT, VERIFIED AGAINST THE MACHINE (ADR-0010).
 *
 * The ADR's promise was that once both bindings ran one machine from `@skryensya/core/machines`,
 * "the parts contract is verified against the machine instead of being duplicated in a fixture".
 * Nothing did the verifying: the machine was shared, and whether each of its parts landed on the
 * contract's part in BOTH bindings was left to the browser symmetry gate, which is outside CI.
 *
 * Zag stamps every element it owns with `data-scope` and `data-part`, so the answer is observable,
 * not something to restate in a table that would drift the way the old fixtures did. Every canonical
 * tree is rendered in both bindings here, and for every element a machine owns:
 *
 *   1. its part exists in that machine's anatomy (a binding cannot invent one);
 *   2. it carries a class the contracts publish as a part (the machine's part is the contract's
 *      part, not an unstyled div the stylesheet reaches through Zag's attributes);
 *   3. per tree, both bindings put the same machine parts on the same contract parts, as many
 *      times.
 *
 * And across the corpus, every re-exported machine is exercised in both bindings, which is the
 * "one machine, TWO adapters" test the header of `machines.ts` applies by hand.
 */

type MachineName = keyof typeof machines;

/* Scope → machine, read off each machine's own anatomy, so a new re-export needs no edit here. */
const scopeOf = (name: MachineName): string => {
  const [part] = Object.values(machines[name].anatomy.build()) as { attrs: Record<string, string> }[];
  return part!.attrs["data-scope"]!;
};
const partsOf = (name: MachineName): Set<string> =>
  new Set(
    (Object.values(machines[name].anatomy.build()) as { attrs: Record<string, string> }[]).map(
      (part) => part.attrs["data-part"]!,
    ),
  );
const machineNames = Object.keys(machines) as MachineName[];

/*
 * A scope a binding writes OVER a machine's own. Tile runs checkbox, collapsible and radio-group
 * but marks their parts `data-scope="tile"`, identically in both bindings, so one Tile stylesheet
 * reaches all three. Its parts are judged against the union of those machines' anatomies.
 */
const RESCOPED: Readonly<Record<string, readonly MachineName[]>> = {
  tile: ["checkbox", "collapsible", "radioGroup"],
};

/*
 * Machines with ONE adapter today, both vanilla-only. The header of `machines.ts` names them as not
 * yet earning their place; listing them here keeps that honest from both sides: the test fails if
 * one gains its React adapter and stays listed, or if a new machine lands with only one.
 */
const ONE_ADAPTER: ReadonlySet<MachineName> = new Set(["carousel", "splitter"]);

/*
 * Machine parts rendered with no contract part, on purpose, each with its reason. `where` narrows a
 * waiver to the elements matching a selector, so excusing one element does not excuse its whole
 * part everywhere. A new entry is a decision to write down here, not a way to make the test pass.
 */
const UNSTYLED_PARTS: readonly { scope: string; part: string; where?: string; because: string }[] = [
  {
    scope: "color-picker",
    part: "transparency-grid",
    because:
      "the checkerboard behind the alpha track; decorative, painted through its slider " +
      '(`.sk-color-picker__alpha-slider > [data-part="transparency-grid"]`)',
  },
  { scope: "date-picker", part: "table-row", because: "a calendar `<tr>`: table structure, the cells are the parts" },
  {
    scope: "tile",
    part: "root",
    where: "[data-sk-tile-radio-group]",
    because: "the radio group's box: tile.ts's template gives it no part class, the paint is each option's",
  },
];

/* Every class a contract publishes as a part, plus the Anchoring pattern's (a tooltip's arrow). */
const partClasses = new Set<string>([
  ...Object.values(contracts).flatMap((contract) => Object.values(contract.parts as Record<string, string>)),
  ...Object.values(anchoredParts),
]);

const machineOfScope = new Map<string, readonly MachineName[]>([
  ...machineNames.map((name) => [scopeOf(name), [name]] as const),
  ...Object.entries(RESCOPED),
]);

type Seen = { scope: string; part: string; classes: string; waiver?: number };

async function observe(binding: "vanilla" | "react", tree: (typeof canonicalTrees)[number]["tree"]): Promise<Seen[]> {
  const host = document.createElement("div");
  document.body.append(host);
  if (binding === "vanilla") {
    host.innerHTML = emitMarkup(tree);
    await initComponents(host);
  } else {
    setPortalContainer({ current: host });
    await loadTree(tree);
    const root = createRoot(host);
    flushSync(() => root.render(renderTree(tree)));
  }
  // Enhancers patch in effects and microtasks; one macrotask lets them all land.
  await new Promise((resolve) => setTimeout(resolve, 0));

  const seen = [...host.querySelectorAll("[data-scope][data-part]")]
    .map((element) => {
      const scope = element.getAttribute("data-scope")!;
      const part = element.getAttribute("data-part")!;
      const waiver = UNSTYLED_PARTS.findIndex(
        (entry) => entry.scope === scope && entry.part === part && (!entry.where || element.matches(entry.where)),
      );
      return {
        scope,
        part,
        classes: [...element.classList].filter((name) => partClasses.has(name)).sort().join(" "),
        ...(waiver >= 0 ? { waiver } : {}),
      };
    })
    .filter(({ scope }) => machineOfScope.has(scope));
  document.body.innerHTML = "";
  return seen;
}

const observed = new Map<string, { vanilla: Seen[]; react: Seen[] }>();

beforeAll(async () => {
  for (const { name, tree } of canonicalTrees) {
    observed.set(name, { vanilla: await observe("vanilla", tree), react: await observe("react", tree) });
  }
}, 120_000);

const tally = (seen: readonly Seen[]) =>
  Object.fromEntries(
    [...seen.reduce((counts, { scope, part, classes }) => {
      const key = `${scope}:${part} → ${classes || "∅"}`;
      return counts.set(key, (counts.get(key) ?? 0) + 1);
    }, new Map<string, number>())].sort(([a], [b]) => a.localeCompare(b)),
  );

describe("the machines, against the parts contract", () => {
  it("observes machine-owned parts at all", () => {
    /* A floor, so a render that silently produced nothing cannot pass every assertion below. */
    const total = [...observed.values()].reduce((sum, { vanilla, react }) => sum + vanilla.length + react.length, 0);
    expect(total).toBeGreaterThan(500);
  });

  it("exercises every re-exported machine in both bindings, except the ones named as single-adapter", () => {
    const scopesIn = (binding: "vanilla" | "react") =>
      new Set([...observed.values()].flatMap((bindings) => bindings[binding].map(({ scope }) => scope)));
    const vanilla = scopesIn("vanilla");
    const react = scopesIn("react");
    const reached = (binding: Set<string>, name: MachineName) =>
      binding.has(scopeOf(name)) ||
      Object.entries(RESCOPED).some(([scope, names]) => names.includes(name) && binding.has(scope));

    const missing = machineNames.flatMap((name) => [
      ...(reached(vanilla, name) ? [] : [`${name}: no vanilla adapter reached it`]),
      ...(ONE_ADAPTER.has(name) || reached(react, name) ? [] : [`${name}: no React adapter reached it`]),
      ...(ONE_ADAPTER.has(name) && reached(react, name) ? [`${name}: has a React adapter now; drop it from ONE_ADAPTER`] : []),
    ]);
    expect(missing).toEqual([]);
  });

  it("renders only parts the machine's anatomy declares", () => {
    const invented = [...observed].flatMap(([name, bindings]) =>
      (["vanilla", "react"] as const).flatMap((binding) =>
        bindings[binding]
          .filter(({ scope, part }) => !machineOfScope.get(scope)!.some((machine) => partsOf(machine).has(part)))
          .map(({ scope, part }) => `${name}/${binding}: ${scope}:${part}`),
      ),
    );
    expect([...new Set(invented)]).toEqual([]);
  });

  it("puts every machine part on a contract part, or says why not", () => {
    const unclassed = [...observed].flatMap(([name, bindings]) =>
      (["vanilla", "react"] as const).flatMap((binding) =>
        bindings[binding]
          .filter(({ classes, waiver }) => !classes && waiver === undefined)
          .map(({ scope, part }) => `${name}/${binding}: ${scope}:${part}`),
      ),
    );
    expect([...new Set(unclassed)]).toEqual([]);
  });

  it("keeps every waiver in use", () => {
    const all = [...observed.values()].flatMap(({ vanilla, react }) => [...vanilla, ...react]);
    const stale = UNSTYLED_PARTS.filter(
      (_, index) => !all.some(({ classes, waiver }) => waiver === index && !classes),
    ).map(({ scope, part, where }) => `${scope}:${part}${where ?? ""}`);
    expect(stale).toEqual([]);
  });

  for (const { name } of canonicalTrees) {
    it(`${name}: both bindings map the machine's parts onto the same contract parts`, () => {
      const { vanilla, react } = observed.get(name)!;
      const twoAdapters = (seen: readonly Seen[]) =>
        seen.filter(({ scope }) => !machineOfScope.get(scope)!.every((machine) => ONE_ADAPTER.has(machine)));
      expect(tally(twoAdapters(vanilla))).toEqual(tally(twoAdapters(react)));
    });
  }
});
