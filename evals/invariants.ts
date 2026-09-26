import { walkUsageTree } from "@skryensya/ai-compiler/usage-walk";
import { getContract } from "@skryensya/core/registry";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Invariant, Predicate, Signatures } from "./case.js";

/*
 * Invariants are judged here and nowhere else: `run.ts` holds reference trees and counterexamples
 * to them, and `agent/scoring.ts` holds a live agent's final tree to them. Pure, so the same tree
 * gets the same verdict in both places.
 */

/** Every invariant a tree breaks, as a sentence a report can print. Empty when all hold. */
export function brokenInvariants(tree: UsageTree, invariants: readonly Invariant[] = []): string[] {
  const nodes = nodesOf(tree);
  return invariants.flatMap((invariant) => {
    const failure = check(invariant, nodes);
    return failure === undefined ? [] : [`${failure}: ${invariant.because}`];
  });
}

/** Invariants that cannot be judged as written: a count with no bound, an option with no test. */
export function malformedInvariants(invariants: readonly Invariant[] = []): string[] {
  const problems = (predicate: Predicate): string[] => {
    if ("count" in predicate) {
      const { min, max, exactly } = predicate.count;
      if (min === undefined && max === undefined && exactly === undefined) return [`count of ${names(predicate.count.signature)} states no bound`];
      if (exactly !== undefined && (min !== undefined || max !== undefined)) return [`count of ${names(predicate.count.signature)} states exactly and a range`];
    }
    if ("option" in predicate && predicate.option.equals === undefined && predicate.option.startsWith === undefined)
      return [`option ${predicate.option.name} states neither equals nor startsWith`];
    if ("anchors" in predicate && predicate.anchors.to.length === 0) return ["anchors lists nothing the target must hold"];
    if ("anyOf" in predicate) return predicate.anyOf.length === 0 ? ["anyOf lists nothing"] : predicate.anyOf.flatMap(problems);
    return [];
  };
  return invariants.flatMap(problems);
}

type Node = { readonly node: UsageTree; readonly ancestors: readonly UsageTree[] };

function nodesOf(tree: UsageTree): readonly Node[] {
  const out: Node[] = [];
  walkUsageTree(tree, (node, ancestors) => out.push({ node, ancestors }));
  return out;
}

const list = (signatures: Signatures): readonly string[] => (typeof signatures === "string" ? [signatures] : signatures);
const names = (signatures: Signatures) => list(signatures).join(" / ");
const plural = (count: number, what: string) => `${count} ${what}`;

/** Why a predicate does not hold, or undefined when it does. */
function check(predicate: Predicate, nodes: readonly Node[]): string | undefined {
  const of = (signatures: Signatures) => {
    const wanted = list(signatures);
    return nodes.filter(({ node }) => wanted.includes(node.signature));
  };

  if ("uses" in predicate) {
    return of(predicate.uses).length > 0 ? undefined : `uses none of ${names(predicate.uses)}`;
  }

  if ("avoids" in predicate) {
    const present = [...new Set(of(predicate.avoids).map(({ node }) => node.signature))];
    return present.length === 0 ? undefined : `uses ${present.join(", ")}`;
  }

  if ("count" in predicate) {
    const { signature, min, max, exactly } = predicate.count;
    const count = of(signature).length;
    const what = names(signature);
    if (exactly !== undefined && count !== exactly) return `has ${plural(count, what)}, needs exactly ${exactly}`;
    if (min !== undefined && count < min) return `has ${plural(count, what)}, needs at least ${min}`;
    if (max !== undefined && count > max) return `has ${plural(count, what)}, allows at most ${max}`;
    if (min === undefined && max === undefined && exactly === undefined) return `count of ${what} states no bound`;
    return undefined;
  }

  if ("contains" in predicate) {
    const { ancestor, descendant } = predicate.contains;
    const holders = of(ancestor);
    if (holders.length === 0) return `has no ${names(ancestor)} to contain ${names(descendant)}`;
    const wanted = list(descendant);
    const holds = holders.some(({ node: holder }) =>
      nodes.some(({ node, ancestors }) => ancestors.includes(holder) && wanted.includes(node.signature)),
    );
    return holds ? undefined : `no ${names(ancestor)} contains a ${names(descendant)}`;
  }

  if ("option" in predicate) {
    const { signature, name, equals, startsWith, within } = predicate.option;
    const scope = within ? list(within) : undefined;
    const test = equals !== undefined ? `${name} = ${JSON.stringify(equals)}` : `${name} starting with ${JSON.stringify(startsWith)}`;
    if (equals === undefined && startsWith === undefined) return `option ${name} states neither equals nor startsWith`;
    const matches = of(signature).some(({ node, ancestors }) => {
      if (scope && !ancestors.some((above) => scope.includes(above.signature))) return false;
      const value = node.options?.[name] ?? getContract(node.contract)?.options[name]?.default;
      if (equals !== undefined) return value === equals;
      return typeof value === "string" && value.startsWith(startsWith!);
    });
    return matches ? undefined : `no ${names(signature)}${scope ? ` inside ${names(scope)}` : ""} has ${test}`;
  }

  if ("before" in predicate) {
    const { first, then } = predicate.before;
    const at = (signatures: Signatures) => nodes.findIndex(({ node }) => list(signatures).includes(node.signature));
    const [a, b] = [at(first), at(then)];
    if (a === -1) return `has no ${names(first)}`;
    if (b === -1) return `has no ${names(then)}`;
    return a < b ? undefined : `the first ${names(then)} comes before the first ${names(first)}`;
  }

  if ("anchors" in predicate) {
    const { from, within, to } = predicate.anchors;
    const scope = within ? list(within) : undefined;
    const links = of(from).filter(({ ancestors }) => !scope || ancestors.some((above) => scope.includes(above.signature)));
    const hrefs = links.map(({ node }) => node.options?.href ?? node.attrs?.href).filter((href): href is string => typeof href === "string" && href.startsWith("#"));
    const where = `${names(from)}${scope ? ` inside ${names(scope)}` : ""}`;
    if (hrefs.length === 0) return `no ${where} links to a section of the page`;
    const reasons = hrefs.map((href) => {
      const target = nodes.find(({ node }) => node.attrs?.id === href.slice(1) || node.options?.id === href.slice(1))?.node;
      if (!target) return `${href} names no id in the page`;
      const inside = nodes.filter(({ node, ancestors }) => node === target || ancestors.includes(target));
      const missing = to.filter((group) => !inside.some(({ node }) => list(group).includes(node.signature)));
      return missing.length === 0 ? undefined : `${href} holds no ${missing.map(names).join(" and no ")}`;
    });
    return reasons.some((reason) => reason === undefined) ? undefined : `${where}: ${reasons.join("; ")}`;
  }

  const failures = predicate.anyOf.map((inner) => check(inner, nodes));
  return failures.some((failure) => failure === undefined) ? undefined : `none of: ${failures.join("; ")}`;
}
