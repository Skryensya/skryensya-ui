import type {
  ComponentContract,
  ContractOption,
  ContractSignature,
  ContractSlot,
} from "@skryensya/core/contract";
import { getContract, getSignature, contractIds } from "@skryensya/core/registry";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type ItemInput,
  type UsageTree,
} from "@skryensya/core/usage-tree";

/*
 * Gates G0 and G3 over a usage tree: shape, options, requires/forbids, slots, parents and the
 * accessibility a contract declares. Everything checked here is checked against a structured field,
 * never against prose: a rule written as a paragraph could not fail a build, which is why the
 * contract stopped holding any.
 */

export type Severity = "error" | "advisory";

export type Problem = {
  /** Where in the tree, as signature ids from the root: `NavList > NavListGroup > NavListLink`. */
  readonly path: string;
  readonly rule: string;
  readonly severity: Severity;
  readonly message: string;
};

export type ValidationResult = {
  readonly valid: boolean;
  readonly problems: readonly Problem[];
};

export function validateUsageTree(tree: UsageTree): ValidationResult {
  const problems: Problem[] = [];
  walk(tree, undefined, [], problems);
  return { valid: problems.every((p) => p.severity !== "error"), problems };
}

function walk(
  tree: UsageTree,
  parent: { contract: ComponentContract; signature: ContractSignature; id: string } | undefined,
  trail: readonly string[],
  problems: Problem[],
): void {
  const here = [...trail, tree.signature];
  const path = here.join(" > ");

  const contract = getContract(tree.contract);
  if (!contract) {
    problems.push({
      path,
      rule: "unknown-contract",
      severity: "error",
      message: `No contract "${tree.contract}". Published contracts: ${contractIds().join(", ")}.`,
    });
    return;
  }

  const signature = getSignature(contract, tree.signature);
  if (!signature) {
    problems.push({
      path,
      rule: "unknown-signature",
      severity: "error",
      message: `Contract "${tree.contract}" has no signature "${tree.signature}". It has: ${Object.keys(contract.signatures).join(", ")}.`,
    });
    return;
  }

  checkParent(signature, parent, path, problems);
  checkOptions(contract, signature, tree, path, problems);
  checkRequiresForbids(signature, tree, path, problems);
  checkAccessibility(contract, signature, tree, path, problems);
  checkSlots(contract, signature, tree, here, problems);
}

function checkParent(
  signature: ContractSignature,
  parent: { id: string } | undefined,
  path: string,
  problems: Problem[],
): void {
  const parents = signature.parents;
  if (!parents || parents.length === 0) return;

  if (!parent) {
    problems.push({
      path,
      rule: "invalid-parent",
      severity: "error",
      message: `This signature must sit inside ${parents.join(" or ")}; it is at the top level.`,
    });
    return;
  }

  if (!parents.includes(parent.id)) {
    problems.push({
      path,
      rule: "invalid-parent",
      severity: "error",
      message: `This signature must sit inside ${parents.join(" or ")}, not inside ${parent.id}.`,
    });
  }
}

function checkOptions(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  for (const [name, value] of Object.entries(tree.options ?? {})) {
    if (!signature.options.includes(name)) {
      const known = signature.options.join(", ") || "none";

      // An option this contract has but this signature does not is almost always a signature
      // mix-up, so name the sibling that takes it rather than only listing what this one accepts.
      const sibling = Object.entries(contract.signatures).find(
        ([id, other]) => id !== tree.signature && other.options.includes(name),
      );

      problems.push({
        path,
        rule: "unknown-option",
        severity: "error",
        message: sibling
          ? `"${name}" is not an option of ${tree.signature}; it is an option of ${sibling[0]}. It accepts: ${known}.`
          : `"${name}" is not an option of ${tree.signature}. It accepts: ${known}.`,
      });
      continue;
    }

    const option = contract.options[name] as ContractOption;
    const problem = optionValueProblem(option, name, value);
    if (problem) problems.push({ path, rule: "invalid-option-value", severity: "error", message: problem });
  }
}

function optionValueProblem(option: ContractOption, name: string, value: unknown): string | undefined {
  if (option.type === "enum") {
    const values = option.values ?? [];
    if (typeof value !== "string" || !values.includes(value)) {
      return `"${name}" must be one of ${values.join(", ")}; got ${JSON.stringify(value)}.`;
    }
    return undefined;
  }

  if (option.type === "boolean" && typeof value !== "boolean") {
    return `"${name}" is a boolean; got ${JSON.stringify(value)}.`;
  }

  if (option.type === "string" && typeof value !== "string") {
    return `"${name}" is a string; got ${JSON.stringify(value)}.`;
  }

  if (option.type === "number" && typeof value !== "number") {
    return `"${name}" is a number; got ${JSON.stringify(value)}.`;
  }

  return undefined;
}

function checkRequiresForbids(
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const given = new Set([...Object.keys(tree.options ?? {}), ...Object.keys(tree.attrs ?? {})]);

  for (const name of signature.requires ?? []) {
    if (!given.has(name)) {
      problems.push({
        path,
        rule: "missing-required",
        severity: "error",
        message: `${tree.signature} requires "${name}".`,
      });
    }
  }

  for (const name of signature.forbids ?? []) {
    if (given.has(name)) {
      problems.push({
        path,
        rule: "forbidden",
        severity: "error",
        message: `${tree.signature} forbids "${name}". Its sibling signature is the one that takes it.`,
      });
    }
  }

  // Slots count as sources too: a frame takes its media as a `src` option or as authored children,
  // and "exactly one source" is the rule either way.
  const filled = new Set([...given, ...Object.keys(slotsOf(tree)).filter((slot) => slotItems(slotsOf(tree)[slot]).length > 0)]);

  for (const group of signature.exactlyOneOf ?? []) {
    const supplied = group.filter((name) => filled.has(name));

    if (supplied.length === 0) {
      problems.push({
        path,
        rule: "missing-exactly-one",
        severity: "error",
        message: `${tree.signature} needs exactly one of ${group.join(", ")}; none was given, which renders an empty box that every other check calls valid.`,
      });
    } else if (supplied.length > 1) {
      problems.push({
        path,
        rule: "ambiguous-exactly-one",
        severity: "error",
        message: `${tree.signature} takes exactly one of ${group.join(", ")}; got ${supplied.join(" and ")}.`,
      });
    }
  }
}

function checkAccessibility(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const options = tree.options ?? {};
  const attrs = tree.attrs ?? {};

  for (const rule of contract.a11y ?? []) {
    // A landmark rule belongs to the signature that is the landmark, not to every signature of the
    // contract. Absent scope means the rule is keyed on an option they all share.
    if (rule.signatures && !rule.signatures.includes(tree.signature)) continue;

    const conditions = Object.entries(rule.when);

    /*
     * A rule keyed on something that is not an option of this signature is about page context, not
     * about this node: "a second nav on the page". Nothing static can settle it, so it is reported
     * as advisory rather than silently dropped: an unverifiable rule the agent never sees is the
     * same as no rule.
     */
    const evaluable = conditions.every(([key]) => signature.options.includes(key));
    if (!evaluable) {
      // Silent when the author already did it. An advisory that fires at someone who satisfied it
      // is noise, and noise is what teaches an agent to skip advisories.
      const satisfied = rule.requiresOneOf.some(
        (name) => attrs[name] !== undefined || options[name] !== undefined,
      );
      if (satisfied) continue;

      problems.push({
        path,
        rule: "unverifiable-a11y",
        severity: "advisory",
        message: `${rule.because} Requires one of: ${rule.requiresOneOf.join(", ")}. Not decidable from the tree alone; verify it in the render.`,
      });
      continue;
    }

    const applies = conditions.every(([key, expected]) => {
      if (expected === "present") return options[key] !== undefined;
      if (expected === "absent") return options[key] === undefined;
      return options[key] === expected;
    });
    if (!applies) continue;

    // The name may arrive as an option the contract maps (`alt`) or as a raw attribute the author
    // passes through (`aria-label`). Both are the author supplying it.
    if (!rule.requiresOneOf.some((name) => attrs[name] !== undefined || options[name] !== undefined)) {
      problems.push({
        path,
        rule: "missing-accessible-name",
        severity: "error",
        message: `${rule.because} Pass one of: ${rule.requiresOneOf.join(", ")}.`,
      });
    }
  }
}

function checkSlots(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  trail: readonly string[],
  problems: Problem[],
): void {
  const path = trail.join(" > ");
  const filled = slotsOf(tree);

  for (const name of Object.keys(filled)) {
    if (!signature.slots[name]) {
      problems.push({
        path,
        rule: "unknown-slot",
        severity: "error",
        message: `${tree.signature} has no slot "${name}". It has: ${Object.keys(signature.slots).join(", ") || "none"}.`,
      });
    }
  }

  for (const [name, slot] of Object.entries(signature.slots)) {
    // A collection is entries, not children: `slotItems` filters them out, so without this branch a
    // filled collection reads as empty and its entries are never checked at all.
    if (slot.accepts === "items") {
      checkCollection(name, slot, collectionItems(filled[name]), tree, path, problems);
      continue;
    }

    const items = slotItems(filled[name]);
    checkOrderAndCardinality(name, slot, items, path, problems);

    if (slot.required && items.length === 0) {
      problems.push({
        path,
        rule: "missing-required-slot",
        severity: "error",
        message: `${tree.signature} requires its "${name}" slot to be filled.`,
      });
      continue;
    }

    for (const item of items) {
      if (!isUsageTree(item)) {
        if (slot.accepts === "signature") {
          problems.push({
            path,
            rule: "slot-accepts",
            severity: "error",
            message: `Slot "${name}" takes ${slot.of?.join(" or ") ?? "a signature"}, not text.`,
          });
        }
        continue;
      }

      if (slot.accepts === "text") {
        problems.push({
          path,
          rule: "slot-accepts",
          severity: "error",
          message: `Slot "${name}" takes text, not a composed signature.`,
        });
        continue;
      }

      if (slot.of && !slot.of.includes(item.signature)) {
        problems.push({
          path,
          rule: "slot-accepts",
          severity: "error",
          message: `Slot "${name}" takes ${slot.of.join(" or ")}; got ${item.signature}.`,
        });
      }

      if (slot.restrictOptions) {
        checkRestrictedOptions(name, slot.restrictOptions, item, `${path} > ${item.signature}`, problems);
      }

      walk(item, { contract, signature, id: tree.signature }, trail, problems);
    }
  }
}

/**
 * A slot's `restrictOptions` narrows one of the ITEM's own options to a subset of its usual values.
 * Silent when the item's signature does not have that option at all. A Link has no `variant`, so a
 * slot that restricts `variant` says nothing about it, the same way `checkAccessibility` skips a rule
 * keyed on an option this signature never declared.
 *
 * Checked against the item's own contract default when the option is omitted from the tree: leaving
 * `variant` unset does not exempt it, because the rendered button still has SOME variant, the
 * default one, and that default is exactly what most of these restrictions exist to rule out.
 */
function checkRestrictedOptions(
  slotName: string,
  restrictions: Readonly<Record<string, readonly string[]>>,
  item: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const itemContract = getContract(item.contract);
  const itemSignature = itemContract && getSignature(itemContract, item.signature);
  if (!itemContract || !itemSignature) return;

  for (const [optionName, allowed] of Object.entries(restrictions)) {
    if (!itemSignature.options.includes(optionName)) continue;

    const declared = itemContract.options[optionName];
    const value = (item.options ?? {})[optionName] ?? declared?.default;

    if (typeof value === "string" && !allowed.includes(value)) {
      problems.push({
        path,
        rule: "restricted-option-value",
        severity: "error",
        message: `Slot "${slotName}" restricts "${optionName}" on ${item.signature} to ${allowed.join(" or ")}; got ${JSON.stringify(value)}.`,
      });
    }
  }
}

/**
 * The entries of a collection: each one is checked like a miniature signature: its own options
 * against the item shape, its own slots for content, plus the one rule a collection has that nothing
 * else does: **the key must be unique**. Two tabs with the same value silently collapse into one,
 * because the key is what pairs a trigger with its panel.
 */
function checkCollection(
  name: string,
  slot: ContractSlot,
  entries: readonly ItemInput[],
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  if (slot.required && entries.length === 0) {
    problems.push({
      path,
      rule: "missing-required-slot",
      severity: "error",
      message: `${tree.signature} requires entries in its "${name}" collection.`,
    });
    return;
  }

  const shape = slot.item;
  if (!shape) return;

  const seen = new Set<string>();

  entries.forEach((entry, index) => {
    const where = `${path} > ${name}[${index}]`;

    for (const [option, value] of Object.entries(entry.options ?? {})) {
      const declared = shape.options[option];
      if (!declared) {
        problems.push({
          path: where,
          rule: "unknown-item-option",
          severity: "error",
          message: `An entry of "${name}" has no option "${option}". It accepts: ${Object.keys(shape.options).join(", ") || "none"}.`,
        });
        continue;
      }

      const problem = optionValueProblem(declared, option, value);
      if (problem) problems.push({ path: where, rule: "invalid-option-value", severity: "error", message: problem });
    }

    // Only when the collection HAS a key: an entry that becomes one element has nothing to pair,
    // and a uniqueness rule over nothing rejects trees for a reason that does not exist.
    if (shape.key !== undefined) {
      const key = entry.options?.[shape.key];
      if (typeof key !== "string" || key === "") {
        problems.push({
          path: where,
          rule: "missing-item-key",
          severity: "error",
          message: `Every entry of "${name}" needs "${shape.key}": it is what pairs the parts this entry becomes.`,
        });
      } else if (seen.has(key)) {
        problems.push({
          path: where,
          rule: "duplicate-item-key",
          severity: "error",
          message: `Two entries of "${name}" share ${shape.key}="${key}". The parts they become would collapse into one.`,
        });
      } else {
        seen.add(key);
      }
    }

    for (const [slotName, itemSlot] of Object.entries(shape.slots)) {
      if (itemSlot.required && slotItems(entry.slots[slotName]).length === 0) {
        problems.push({
          path: where,
          rule: "missing-required-slot",
          severity: "error",
          message: `Every entry of "${name}" needs its "${slotName}" filled.`,
        });
      }

      /*
       * A recursive slot holds entries of the shape that CONTAINS it, so it is checked against the
       * same shape, one level down. Without this a folder's children were accepted unread: every
       * rule the entries above owe, they owe at every depth.
       */
      if (itemSlot.recursive) {
        const nested = collectionItems(entry.slots[slotName]);
        if (nested.length > 0) checkCollection(slotName, { ...itemSlot, item: shape }, nested, tree, where, problems);
      }
    }

    for (const slotName of Object.keys(entry.slots)) {
      if (!shape.slots[slotName]) {
        problems.push({
          path: where,
          rule: "unknown-slot",
          severity: "error",
          message: `An entry of "${name}" has no slot "${slotName}". It has: ${Object.keys(shape.slots).join(", ")}.`,
        });
      }
    }
  });
}

/**
 * Order and cardinality inside a slot: the two rules a list of allowed signatures cannot state.
 *
 * A table is the reason both exist: its caption must come first and there may be at most one, its
 * body is required, and a `<tfoot>` written before `<tbody>` is markup the parser silently moves.
 * None of that is a presence check, and all of it is invisible until someone reads the page aloud.
 */
function checkOrderAndCardinality(
  name: string,
  slot: ContractSlot,
  items: readonly (string | UsageTree)[],
  path: string,
  problems: Problem[],
): void {
  const composed = items.filter(isUsageTree);
  if (composed.length === 0) return;

  if (slot.ordered && slot.of) {
    const rank = new Map(slot.of.map((id, index) => [id, index]));
    let highest = -1;
    let previous = "";

    for (const item of composed) {
      const position = rank.get(item.signature);
      if (position === undefined) continue;

      if (position < highest) {
        problems.push({
          path,
          rule: "out-of-order",
          severity: "error",
          message: `${item.signature} must come before ${previous} in "${name}". The order is ${slot.of.join(" → ")}.`,
        });
      } else {
        highest = position;
        previous = item.signature;
      }
    }
  }

  for (const [signature, allowed] of Object.entries(slot.cardinality ?? {})) {
    const count = composed.filter((item) => item.signature === signature).length;

    if (allowed === "one" && count !== 1) {
      problems.push({
        path,
        rule: "wrong-cardinality",
        severity: "error",
        message: `"${name}" needs exactly one ${signature}; got ${count}.`,
      });
    } else if (allowed === "optional" && count > 1) {
      problems.push({
        path,
        rule: "wrong-cardinality",
        severity: "error",
        message: `"${name}" takes at most one ${signature}; got ${count}.`,
      });
    }
  }
}
