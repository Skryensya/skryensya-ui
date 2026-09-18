import { createHash } from "node:crypto";
import type {
  ComponentContract,
  ContractOption,
  ContractSignature,
  ContractSlot,
} from "@skryensya/core/contract";

/*
 * THE SURFACE: the part of a contract a consumer can depend on, and therefore the only part whose
 * change is worth telling anyone about.
 *
 * A changelog nobody trusts is one that reports edits nobody can observe. So the hash below is
 * taken over a DELIBERATE subset rather than over the whole contract: rename an option, flip a
 * default, drop a signature's parent, tighten a slot's cardinality, and someone's markup breaks or
 * quietly means something else. Rewire a `template`, add a `wiring` id, reword a `because`, and
 * nothing a consumer wrote changes, because those are how the bindings REALIZE the contract, not
 * what it promises.
 *
 * `template` is the interesting exclusion, because authored markup does copy it. It is left out
 * anyway: the emitter writes that markup (decision 29), so a template edit reaches an author as a
 * regenerated snippet rather than as a thing to go fix. Including it would make every internal
 * markup tweak - `also: ["sk-button"]`, ephemeral `data-variant` dumps on a system-owned remove
 * control, `attrsWhen` wiring - demand a changelog entry, and a gate that fires on noise is a gate
 * people learn to silence. Public composition is declared via `compose` / `forward` / `systemOwned`,
 * not via those template class/attr dumps.
 *
 * Options are projected through a WHITELIST. New realization flags on `ContractOption` must not
 * silently enter the hash; only the fields below count. `machineInput` is deliberately out: it is
 * binding-symmetry bookkeeping (G2), not a UsageTree promise. `computedInput` stays in: flipping it
 * changes whether the emitter writes the attribute.
 */

/** Option fields that belong on the public surface (consumer-visible promise). */
const PUBLIC_OPTION_KEYS = [
  "type",
  "values",
  "default",
  "prop",
  "attr",
  "styleProperty",
  "element",
  "keyOf",
  "refersTo",
  "valuesFrom",
  "pattern",
  "list",
  "between",
  "min",
  "max",
  "integer",
  "trueValue",
  "falseValue",
  "alsoAttr",
  "deprecatedValues",
  "computedInput",
] as const satisfies readonly (keyof ContractOption)[];

/** One option, reduced to what an author / agent can depend on. */
export function optionSurface(option: ContractOption): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PUBLIC_OPTION_KEYS) {
    const value = option[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function optionsSurface(options: Readonly<Record<string, ContractOption>>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(options).map(([name, option]) => [name, optionSurface(option)]));
}

/** One slot, with nested item / childAttrs options projected the same way. */
function slotSurface(slot: ContractSlot): unknown {
  const item = slot.item
    ? {
        options: optionsSurface(slot.item.options),
        slots: Object.fromEntries(
          Object.entries(slot.item.slots).map(([name, nested]) => [name, slotSurface(nested)]),
        ),
        key: slot.item.key,
        requires: slot.item.requires ? [...slot.item.requires].sort() : undefined,
      }
    : undefined;

  return {
    accepts: slot.accepts,
    prop: slot.prop,
    required: slot.required,
    of: slot.of ? [...slot.of] : undefined,
    restrictOptions: slot.restrictOptions,
    childAttrs: slot.childAttrs ? optionsSurface(slot.childAttrs) : undefined,
    ordered: slot.ordered,
    flatHierarchy: slot.flatHierarchy,
    cardinality: slot.cardinality,
    groupCardinality: slot.groupCardinality,
    minItems: slot.minItems,
    maxItems: slot.maxItems,
    countWhere: slot.countWhere,
    positions: slot.positions,
    recursive: slot.recursive,
    item,
  };
}

/** One signature, reduced to what it promises. */
function signatureSurface(signature: ContractSignature) {
  return {
    host: signature.host,
    options: [...signature.options].sort(),
    requires: signature.requires ? [...signature.requires].sort() : undefined,
    forbids: signature.forbids ? [...signature.forbids].sort() : undefined,
    exactlyOneOf: signature.exactlyOneOf,
    atLeastOneOf: signature.atLeastOneOf,
    parents: signature.parents ? [...signature.parents].sort() : undefined,
    /*
     * The constraints between options are promises too: a tree that validated yesterday fails today
     * when one tightens. They were left out, so NavList and Stat gained `implies`/`excludes` with no
     * changelog gate firing.
     */
    notInside: signature.notInside ? [...signature.notInside].sort() : undefined,
    implies: signature.implies,
    excludes: signature.excludes,
    pairs: signature.pairs,
    slots: Object.fromEntries(
      Object.entries(signature.slots).map(([name, slot]) => [name, slotSurface(slot)]),
    ),
    mount: signature.mount,
    portals: signature.portals,
    hitTesting: signature.hitTesting
      ? {
          host: signature.hitTesting.host,
          childrenNone: signature.hitTesting.childrenNone
            ? [...signature.hitTesting.childrenNone].sort()
            : undefined,
        }
      : undefined,
    forward: signature.forward ? [...signature.forward].sort() : undefined,
    compose: signature.compose
      ? signature.compose.map((entry) => ({
          of: entry.of,
          sheets: entry.sheets ? [...entry.sheets].sort() : undefined,
          systemOwned: entry.systemOwned,
        }))
      : undefined,
    deprecated: signature.deprecated,
  };
}

/**
 * The contract's consumer-visible shape, canonically ordered.
 *
 * Included: css, parts, options (public fields), events, eventDetails, a11y, hooks, hookSheets,
 * outputHooks, authoredAttrs, systemOwned, and per signature host / option lists / requires·forbids·groups /
 * parents / notInside / implies / excludes / pairs / slots / mount / portals / hitTesting /
 * forward / compose / deprecated.
 *
 * Excluded: template (also / attrs / attrsWhen / optionAttrs / …), wiring, because, intent, react,
 * category, and option.machineInput.
 *
 * Sorted by key at every level for the same reason the manifest is: the hash has to answer "did the
 * promise change", and a reordered literal is not a changed promise.
 */
export function contractSurface(contract: ComponentContract) {
  return {
    css: contract.css,
    parts: contract.parts,
    options: optionsSurface(contract.options),
    events: contract.events,
    /* The payload is a promise too: a consumer reads `detail.value`, not just the event's name. */
    eventDetails: contract.eventDetails,
    a11y: contract.a11y,
    hooks: contract.hooks,
    hookSheets: contract.hookSheets,
    outputHooks: contract.outputHooks,
    /* Dropping one breaks authored markup on a host this contract does not even own. */
    authoredAttrs: contract.authoredAttrs ? [...contract.authoredAttrs].sort() : undefined,
    systemOwned: contract.systemOwned ? [...contract.systemOwned].sort() : undefined,
    signatures: Object.fromEntries(
      Object.entries(contract.signatures)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, signature]) => [name, signatureSurface(signature)]),
    ),
  };
}

/** Stable, short, and printable in an error message someone has to paste back into a YAML file. */
export function surfaceHash(contract: ComponentContract): string {
  return createHash("sha256").update(canonicalJson(contractSurface(contract))).digest("hex").slice(0, 16);
}

/** `JSON.stringify` with object keys sorted at every depth, so key order cannot move the hash. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, raw: unknown) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return raw;
    return Object.fromEntries(
      Object.entries(raw as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)),
    );
  });
}

/**
 * Every name a changelog entry may point at: an option, a part, a signature, or one of the item
 * options a collection slot declares.
 *
 * A `target` is what lets the API table put "nuevo" next to the exact row, so a dangling one is the
 * same failure as a dangling `alternatives` pointer: a badge that never renders, on a page nobody
 * rechecks.
 */
export function targetableNames(contract: ComponentContract): ReadonlySet<string> {
  const names = new Set<string>([
    ...Object.keys(contract.options),
    ...Object.keys(contract.parts),
    ...Object.keys(contract.events ?? {}),
    ...Object.keys(contract.signatures),
  ]);

  for (const signature of Object.values(contract.signatures)) {
    for (const slot of Object.values(signature.slots)) {
      for (const option of Object.keys(slot.item?.options ?? {})) names.add(option);
    }
  }

  return names;
}
