import { createHash } from "node:crypto";
import type { ComponentContract, ContractSignature } from "@skryensya/core/contract";

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
 * markup tweak demand a changelog entry, and a gate that fires on noise is a gate people learn to
 * silence.
 */

/** One signature, reduced to what it promises. */
function signatureSurface(signature: ContractSignature) {
  return {
    host: signature.host,
    options: [...signature.options].sort(),
    requires: signature.requires ? [...signature.requires].sort() : undefined,
    forbids: signature.forbids ? [...signature.forbids].sort() : undefined,
    exactlyOneOf: signature.exactlyOneOf,
    parents: signature.parents ? [...signature.parents].sort() : undefined,
    slots: signature.slots,
    mount: signature.mount,
    portals: signature.portals,
    deprecated: signature.deprecated,
  };
}

/**
 * The contract's consumer-visible shape, canonically ordered.
 *
 * Sorted by key at every level for the same reason the manifest is: the hash has to answer "did the
 * promise change", and a reordered literal is not a changed promise.
 */
export function contractSurface(contract: ComponentContract) {
  return {
    css: contract.css,
    parts: contract.parts,
    options: contract.options,
    events: contract.events,
    a11y: contract.a11y,
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
