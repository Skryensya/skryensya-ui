import type { ComponentContract, ContractOption, ContractSignature } from "@skryensya/core/contract";
import manifest from "../../../../artifacts/ai-manifest.json";
import type { Locale } from "../i18n";

/*
 * THE CONTRACT, AS THE PAGE READS IT.
 *
 * The source is `artifacts/ai-manifest.json`: the same compiled file the MCP server answers
 * `get_contract` from, not a second reading of `packages/core`. That is the whole point of routing
 * the docs through it. A reference table hand-written next to the contract drifts the moment an
 * option is renamed, and the drift is invisible: the page still renders, it just describes a
 * component that no longer exists. Here the page cannot describe an option the agent does not also
 * see, because there is one artifact and both read it.
 *
 * Imported rather than read with `fs` so the bundler resolves it at build time, which also means a
 * rebuilt artifact hot-reloads the page in dev instead of needing the server restarted.
 */

export type ChangeKind = "added" | "changed" | "fixed" | "removed" | "breaking";

export type ChangeEntry = {
  readonly date: string;
  readonly kind: ChangeKind;
  /** An option, part or signature name. The compiler already refused any other value. */
  readonly target?: string;
  readonly es: string;
  readonly en: string;
};

export type SignatureSemantics = {
  readonly useWhen?: readonly string[];
  readonly avoidWhen?: readonly string[];
  readonly alternatives?: readonly string[];
};

export type ContractDoc = ComponentContract & {
  readonly semantics: Readonly<Record<string, SignatureSemantics>>;
  readonly changelog: readonly ChangeEntry[];
};

type Manifest = {
  readonly schemaVersion: string;
  readonly sourceHash: string;
  readonly contracts: Readonly<Record<string, ContractDoc>>;
};

const compiled = manifest as unknown as Manifest;

/**
 * The contract a page documents.
 *
 * Throws rather than returning undefined: a page that names a contract the catalogue does not
 * publish is a build-time typo, and rendering an empty reference section instead would ship a
 * component page whose API tab is silently blank.
 */
export function contractDoc(id: string): ContractDoc {
  const entry = compiled.contracts[id];
  if (!entry) {
    throw new Error(
      `No contract "${id}" in artifacts/ai-manifest.json. Published: ${Object.keys(compiled.contracts).join(", ")}.`,
    );
  }
  return entry;
}

/** Stamped under the reference so a reader can tell which build of the catalogue they are looking at. */
export const catalogueHash = compiled.sourceHash;

/** One signature, flattened into what a reference row needs. Order follows the contract's own. */
export type SignatureRow = {
  readonly id: string;
  readonly signature: ContractSignature;
  readonly options: readonly (readonly [string, ContractOption])[];
};

/**
 * Signatures in the order someone writes them, which is neither the order they are stored in nor
 * the order they arrive.
 *
 * The manifest is canonicalized with its keys sorted, so reading it back hands over
 * `Accordion, Accordion.Content, Accordion.Item, Accordion.Trigger`: a reader meets Content two
 * sections before the Item it goes inside. So the order is REBUILT from the contract's own
 * structure: a root first, then its children, and siblings in the order the parent's slot lists
 * them, which for an ordered slot is exactly the order the markup has to be written in.
 */
export function signatureRows(contract: ContractDoc): readonly SignatureRow[] {
  const ids = Object.keys(contract.signatures);
  const roots = ids.filter((id) => !contract.signatures[id]!.parents?.length);

  /** Where a parent's slots say this child goes; `Infinity` for one no slot names. */
  const positionUnder = (parentId: string, childId: string): number => {
    const slots = Object.values(contract.signatures[parentId]!.slots);
    for (const slot of slots) {
      const at = slot.of?.indexOf(childId) ?? -1;
      if (at >= 0) return at;
    }
    return Number.POSITIVE_INFINITY;
  };

  const ordered: string[] = [];
  const seen = new Set<string>();

  const visit = (id: string): void => {
    if (seen.has(id)) return;
    seen.add(id);
    ordered.push(id);

    ids
      .filter((child) => contract.signatures[child]!.parents?.includes(id))
      .sort((a, b) => positionUnder(id, a) - positionUnder(id, b))
      .forEach(visit);
  };

  roots.forEach(visit);
  // A signature whose only parent is itself unreachable would otherwise vanish from the page.
  ids.forEach(visit);

  return ordered.map((id) => {
    const signature = contract.signatures[id]!;
    return {
      id,
      signature,
      options: signature.options
        .map((name) => [name, contract.options[name]] as const)
        .filter((pair): pair is readonly [string, ContractOption] => Boolean(pair[1])),
    };
  });
}

/**
 * The newest change per target, so a table can badge the exact row that moved.
 *
 * Newest only: a row that says both "added" and "changed" is telling a reader to reconstruct a
 * history from two words. The date belongs to the changelog tab; what the table owes is "this one
 * is not what it was".
 */
export function latestByTarget(contract: ContractDoc): ReadonlyMap<string, ChangeEntry> {
  const latest = new Map<string, ChangeEntry>();
  for (const entry of contract.changelog) {
    if (!entry.target) continue;
    const held = latest.get(entry.target);
    if (!held || held.date < entry.date) latest.set(entry.target, entry);
  }
  return latest;
}

/** An entry's prose in the page's language. Both are always present; the compiler refuses one alone. */
export function entryText(entry: ChangeEntry, locale: Locale): string {
  return locale === "en" ? entry.en : entry.es;
}

/**
 * What an option admits, as one printable string.
 *
 * An enum prints its values because that IS the type; a boolean prints `true` / `false` for the
 * same reason. Only string and number have nothing to enumerate.
 */
export function optionType(option: ContractOption): string {
  if (option.type === "enum") return (option.values ?? []).join(" · ");
  if (option.type === "boolean") return "true · false";
  return option.type;
}

/** Where the value lands in the DOM, which is what makes the two bindings comparable. */
export function optionAttr(option: ContractOption): string | undefined {
  return option.styleProperty ?? option.attr;
}
